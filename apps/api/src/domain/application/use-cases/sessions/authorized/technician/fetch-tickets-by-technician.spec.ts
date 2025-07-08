import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { FetchTicketsByTechnicianUseCase } from './fetch-tickets-by-technician'

let technician: Technician

let inMemoryTicketsRepository: InMemoryTicketsRepository
let sut: FetchTicketsByTechnicianUseCase

describe('Fetch tickets by technician', () => {
	beforeEach(async () => {
		technician = await makeTechnician()

		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		sut = new FetchTicketsByTechnicianUseCase(inMemoryTicketsRepository)
	})

	it('should allow a technician to fetch all tickets assigned to him', async () => {
		for (let i = 0; i < 20; i++) {
			const ticket = await makeTicket({
				ticket: { technicianId: technician.id },
			})
			inMemoryTicketsRepository.create(ticket)
		}

		const sutEitherResult = await sut.execute({
			actorId: technician.id.toString(),
			targetId: technician.id.toString(),
		})

		expect(sutEitherResult.isRight).toBeTruthy()

		const { tickets } = unwrapOrThrow(sutEitherResult)

		expect(tickets).toHaveLength(20)
		expect(inMemoryTicketsRepository.items).toHaveLength(20)
	})

	it('should allow a technician to fetch tickets assigned to him with pagination', async () => {
		for (let i = 0; i < 22; i++) {
			const ticket = await makeTicket({
				ticket: { technicianId: technician.id },
			})
			inMemoryTicketsRepository.create(ticket)
		}

		const sutEitherResult = await sut.execute({
			actorId: technician.id.toString(),
			targetId: technician.id.toString(),
			page: 1,
		})

		expect(sutEitherResult.isRight).toBeTruthy()

		const { tickets } = unwrapOrThrow(sutEitherResult)

		expect(tickets).toHaveLength(20)
		expect(inMemoryTicketsRepository.items).toHaveLength(22)
	})
})
