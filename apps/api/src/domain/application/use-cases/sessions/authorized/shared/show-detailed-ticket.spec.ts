import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import {} from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { ShowDetailedTicketUseCase } from './show-detailed-ticket'

let inMemoryTicketsRepository: InMemoryTicketsRepository
let sut: ShowDetailedTicketUseCase

describe('Show detailed ticket', () => {
	beforeEach(() => {
		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		sut = new ShowDetailedTicketUseCase(inMemoryTicketsRepository)
	})

	it('should allow an admin to view a detailed version of a ticket', async () => {
		const admin = await makeAdmin()

		const ticket = await makeTicket()
		inMemoryTicketsRepository.create(ticket)

		const sutEitherResult = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(sutEitherResult)

		expect(resultTicket).toBe(inMemoryTicketsRepository.items[0])
	})

	it('should allow a technician to view a detailed version of a ticket assigned to him', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({ ticket: { technicianId: technician.id } })
		inMemoryTicketsRepository.create(ticket)

		const sutEitherResult = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(sutEitherResult)

		expect(resultTicket).toBe(inMemoryTicketsRepository.items[0])
	})

	it('should allow a customer to view a detailed version of a ticket created by him', async () => {
		const customer = await makeCustomer()

		const ticket = await makeTicket({
			ticket: { customerId: customer.id },
		})
		inMemoryTicketsRepository.create(ticket)

		const sutEitherResult = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { ticket: resultTicket } = unwrapOrThrow(sutEitherResult)

		expect(resultTicket).toBe(inMemoryTicketsRepository.items[0])
	})

	it('should not allow a technician to view a detailed version of a ticket assigned to another technician', async () => {
		const technician = await makeTechnician()

		const ticket = await makeTicket({ ticket: { technicianId: technician.id } })
		inMemoryTicketsRepository.create(ticket)

		const result = await sut.execute({
			actorId: 'another-technician',
			actorRole: technician.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to view a detailed version of a ticket created by another customer', async () => {
		const customer = await makeCustomer()

		const ticket = await makeTicket({
			ticket: { customerId: customer.id },
		})
		inMemoryTicketsRepository.create(ticket)

		const result = await sut.execute({
			actorId: 'another-customer',
			actorRole: customer.user.role,
			ticketId: ticket.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to show a detailed version of a non-existent ticket', async () => {
		const admin = await makeAdmin()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			ticketId: 'non-existent',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
