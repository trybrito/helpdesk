import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { FetchTicketsUseCase } from './fetch-tickets'

let admin: Admin

let inMemoryTicketsRepository: InMemoryTicketsRepository
let sut: FetchTicketsUseCase

describe('Fetch tickets', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		sut = new FetchTicketsUseCase(inMemoryTicketsRepository)
	})

	it('should allow an admin to fetch tickets with pagination', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryTicketsRepository.create(
				await makeTicket({ ticket: { description: 'Example' } }),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			page: 1,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.tickets).toHaveLength(20)
		expect(result.tickets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					description: 'Example',
				}),
			]),
		)
		expect(inMemoryTicketsRepository.items).toHaveLength(22)
	})

	it('should allow an admin to fetch all tickets', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryTicketsRepository.create(
				await makeTicket({ ticket: { description: 'Example' } }),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.tickets).toHaveLength(22)
		expect(result.tickets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					description: 'Example',
				}),
			]),
		)
		expect(inMemoryTicketsRepository.items).toHaveLength(22)
	})

	it('should not allow a technician to fetch tickets', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to fetch tickets', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			actorRole: customer.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
