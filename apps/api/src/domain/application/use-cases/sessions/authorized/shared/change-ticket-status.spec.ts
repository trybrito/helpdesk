import { TicketStatus } from '@api/core/@types/enums'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryInteractionsRepository } from 'apps/api/test/repositories/in-memory-interactions-repository'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { ChangeTicketStatusUseCase } from './change-ticket-status'

let inMemoryTicketsRepository: InMemoryTicketsRepository
let inMemoryInteractionsRepository: InMemoryInteractionsRepository
let sut: ChangeTicketStatusUseCase

describe('Change ticket status', () => {
	beforeEach(() => {
		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		inMemoryInteractionsRepository = new InMemoryInteractionsRepository()

		sut = new ChangeTicketStatusUseCase(
			inMemoryTicketsRepository,
			inMemoryInteractionsRepository,
		)
	})

	it('should allow an admin to change the status of a ticket to "being_handled"', async () => {
		const admin = await makeAdmin()

		const technician = await makeTechnician()

		const ticket = await makeTicket({ ticket: { technicianId: technician.id } })
		inMemoryTicketsRepository.create(ticket)

		const eitherResult = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(eitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(eitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(resultTicket)
		expect(inMemoryTicketsRepository.items[0].status).toBe(
			TicketStatus.BeingHandled,
		)
		expect(inMemoryInteractionsRepository.items).toHaveLength(1)
		expect(inMemoryInteractionsRepository.items[0].status).toEqual(
			resultTicket.status,
		)
	})

	it('should allow an admin to change the status of a ticket to "closed"', async () => {
		const admin = await makeAdmin()

		const technician = await makeTechnician()

		const ticket = await makeTicket({
			ticket: { technicianId: technician.id },
		})
		inMemoryTicketsRepository.create(ticket)

		await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			ticketId: ticket.id.toString(),
		})

		const eitherResult = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(eitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(eitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(resultTicket)
		expect(inMemoryTicketsRepository.items[0].status).toBe(TicketStatus.Closed)
		expect(inMemoryInteractionsRepository.items).toHaveLength(1)
		expect(inMemoryInteractionsRepository.items[0].closedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should allow a technician to change the status of a ticket to "being_handled"', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({
			ticket: { technicianId: technician.id },
		})
		inMemoryTicketsRepository.create(ticket)

		const eitherResult = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(eitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(eitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(resultTicket)
		expect(inMemoryTicketsRepository.items[0].status).toBe(
			TicketStatus.BeingHandled,
		)
		expect(inMemoryInteractionsRepository.items).toHaveLength(1)
		expect(inMemoryInteractionsRepository.items[0].status).toEqual(
			resultTicket.status,
		)
	})
	it('should allow a technician to change the status of a ticket to "closed"', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({
			ticket: { technicianId: technician.id },
		})
		inMemoryTicketsRepository.create(ticket)

		await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		const eitherResult = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(eitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(eitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(resultTicket)
		expect(inMemoryTicketsRepository.items[0].status).toBe(TicketStatus.Closed)
		expect(inMemoryInteractionsRepository.items).toHaveLength(1)
		expect(inMemoryInteractionsRepository.items[0].closedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should not allow a technician to change the status of a ticket assigned to another technician', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({
			ticket: { technicianId: technician.id },
		})
		inMemoryTicketsRepository.create(ticket)

		const result = await sut.execute({
			actorId: 'another-technician',
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryInteractionsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to change the status of a non-existent ticket', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: 'non-existent',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryInteractionsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to change the status of a ticket if a ticket is changed to "being_handled" without an interaction associated with it', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({ ticket: { technicianId: technician.id } })
		inMemoryTicketsRepository.create(ticket)

		inMemoryTicketsRepository.items[0].status = TicketStatus.BeingHandled

		const result = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryInteractionsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
