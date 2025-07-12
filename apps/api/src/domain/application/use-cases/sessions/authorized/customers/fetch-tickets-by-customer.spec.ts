import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { FetchTicketsByCustomerUseCase } from './fetch-tickets-by-customer'

let inMemoryTicketsRepository: InMemoryTicketsRepository
let sut: FetchTicketsByCustomerUseCase

describe('Fetch tickets history by customer', () => {
	beforeEach(async () => {
		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		sut = new FetchTicketsByCustomerUseCase(inMemoryTicketsRepository)
	})

	it('should allow a customer to fetch all tickets created by him', async () => {
		const customer = await makeCustomer()

		for (let i = 0; i < 20; i++) {
			const ticket = await makeTicket({
				ticket: { customerId: customer.id },
			})
			inMemoryTicketsRepository.create(ticket)
		}

		const sutEitherResult = await sut.execute({
			actorId: customer.id.toString(),
			targetId: customer.id.toString(),
		})

		expect(sutEitherResult.isRight).toBeTruthy()

		const { tickets } = unwrapOrThrow(sutEitherResult)

		expect(tickets).toHaveLength(20)
		expect(inMemoryTicketsRepository.items).toHaveLength(20)
	})

	it('should allow a customer to fetch all tickets created by him with pagination', async () => {
		const customer = await makeCustomer()

		for (let i = 0; i < 22; i++) {
			const ticket = await makeTicket({
				ticket: { customerId: customer.id },
			})
			inMemoryTicketsRepository.create(ticket)
		}

		const sutEitherResult = await sut.execute({
			actorId: customer.id.toString(),
			targetId: customer.id.toString(),
			page: 1,
		})

		expect(sutEitherResult.isRight).toBeTruthy()

		const { tickets } = unwrapOrThrow(sutEitherResult)

		expect(tickets).toHaveLength(20)
		expect(inMemoryTicketsRepository.items).toHaveLength(22)
	})

	it('should not allow a customer to fetch tickets created by another customer', async () => {
		const customer = await makeCustomer()

		for (let i = 0; i < 20; i++) {
			const ticket = await makeTicket({
				ticket: { customerId: customer.id },
			})
			inMemoryTicketsRepository.create(ticket)
		}

		const result = await sut.execute({
			actorId: 'another-customer',
			targetId: customer.id.toString(),
		})

		expect(result.isLeft).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
