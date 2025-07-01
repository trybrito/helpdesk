import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { FetchCustomersUseCase } from './fetch-customers'

let admin: Admin

let inMemoryCustomersRepository: InMemoryCustomersRepository
let sut: FetchCustomersUseCase

describe('Fetch customers', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		sut = new FetchCustomersUseCase(inMemoryCustomersRepository)
	})

	it('should allow an admin to fetch customers of page 1', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryCustomersRepository.create(
				await makeCustomer({
					customer: { firstName: 'John', lastName: 'Doe' },
				}),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			page: 1,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.customers).toHaveLength(20)
		expect(result.customers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					firstName: 'John',
					lastName: 'Doe',
				}),
			]),
		)
		expect(inMemoryCustomersRepository.items).toHaveLength(22)
	})

	it('should allow an admin to fetch customers of page 2', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryCustomersRepository.create(
				await makeCustomer({
					customer: { firstName: 'John', lastName: 'Doe' },
				}),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			page: 2,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.customers).toHaveLength(2)
		expect(result.customers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					firstName: 'John',
					lastName: 'Doe',
				}),
			]),
		)
		expect(inMemoryCustomersRepository.items).toHaveLength(22)
	})

	it('should not allow a technician to fetch customers', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to fetch customers', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			actorRole: customer.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
