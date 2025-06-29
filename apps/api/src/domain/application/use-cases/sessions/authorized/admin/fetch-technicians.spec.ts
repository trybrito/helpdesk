import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { FetchTechniciansUseCase } from './fetch-technicians'

let admin: Admin

let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let sut: FetchTechniciansUseCase

describe('Fetch technicians', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		sut = new FetchTechniciansUseCase(inMemoryTechniciansRepository)
	})

	it('should allow an admin to fetch technicians with pagination', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryTechniciansRepository.create(
				await makeTechnician({
					technician: { firstName: 'John', lastName: 'Doe' },
				}),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			page: 1,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.technicians).toHaveLength(20)
		expect(result.technicians).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					firstName: 'John',
					lastName: 'Doe',
				}),
			]),
		)
		expect(inMemoryTechniciansRepository.items).toHaveLength(22)
	})

	it('should not allow a technician to fetch technicians', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to fetch technicians', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			actorRole: customer.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
