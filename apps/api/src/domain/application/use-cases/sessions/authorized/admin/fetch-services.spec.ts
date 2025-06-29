import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeService } from 'apps/api/test/factories/make-service'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { FetchServicesUseCase } from './fetch-services'

let admin: Admin
let inMemoryServicesRepository: InMemoryServicesRepository
let sut: FetchServicesUseCase

describe('Fetch services', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryServicesRepository = new InMemoryServicesRepository()
		sut = new FetchServicesUseCase(inMemoryServicesRepository)
	})

	it('should allow an admin to fetch services with pagination', async () => {
		for (let i = 0; i <= 21; i++) {
			inMemoryServicesRepository.create(
				await makeService(admin.id, { service: { name: 'test-service' } }),
			)
		}

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			page: 1,
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(result.services).toHaveLength(20)
		expect(result.services).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'test-service',
				}),
			]),
		)
		expect(inMemoryServicesRepository.items).toHaveLength(22)
	})

	it('should not allow a technician to fetch services', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to fetch services', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			actorRole: customer.user.role,
			page: 1,
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
