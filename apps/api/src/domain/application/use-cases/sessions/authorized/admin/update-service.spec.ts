import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCategory } from 'apps/api/test/factories/make-category'
import { makeService } from 'apps/api/test/factories/make-service'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UpdateServiceUseCase } from './update-service'

let admin: Admin

let inMemoryServicesRepository: InMemoryServicesRepository
let sut: UpdateServiceUseCase

describe('Update service', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryServicesRepository = new InMemoryServicesRepository()
		sut = new UpdateServiceUseCase(inMemoryServicesRepository)
	})

	it('should allow an admin to update a service', async () => {
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const categoryToUpdate = await makeCategory(
			{},
			new UniqueEntityId('category-1'),
		)

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			targetId: service.id.toString(),
			categoryId: categoryToUpdate.id.toString(),
			name: 'other-name',
			price: '49,99',
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryServicesRepository.items[0]).toBe(result.service)
		expect(
			inMemoryServicesRepository.items[0].categoryId.equals(
				categoryToUpdate.id,
			),
		).toBeTruthy()
		expect(inMemoryServicesRepository.items[0].price.getValue()).toBe(4999)
	})

	it('should not allow a technician to update a service', async () => {
		const technician = await makeTechnician()
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const categoryToUpdate = await makeCategory(
			{},
			new UniqueEntityId('category-1'),
		)

		const result = await sut.execute({
			actorRole: technician.user.role,
			targetId: service.id.toString(),
			categoryId: categoryToUpdate.id.toString(),
			name: 'other-name',
			price: '4999',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryServicesRepository.items[0]).toBe(service)
	})

	it('should not allow a customer to update a service', async () => {
		const customer = await makeTechnician()
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const categoryToUpdate = await makeCategory(
			{},
			new UniqueEntityId('category-1'),
		)

		const result = await sut.execute({
			actorRole: customer.user.role,
			targetId: service.id.toString(),
			categoryId: categoryToUpdate.id.toString(),
			name: 'other-name',
			price: '4999',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryServicesRepository.items[0]).toBe(service)
	})

	it('should not be able to update a non-existent service', async () => {
		const result = await sut.execute({
			actorRole: admin.user.role,
			targetId: 'service-1',
			categoryId: 'category-1',
			name: 'other-name',
			price: '49,99',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
