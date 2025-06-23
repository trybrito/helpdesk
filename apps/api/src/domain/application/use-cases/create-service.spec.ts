import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCategory } from 'apps/api/test/factories/make-category'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryAdminsRepository } from 'apps/api/test/repositories/in-memory-admins-repository'
import { InMemoryCategoriesRepository } from 'apps/api/test/repositories/in-memory-categories-repository'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { CreateServiceUseCase } from './create-service'

let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryServicesRepository: InMemoryServicesRepository
let sut: CreateServiceUseCase

let admin: Admin

describe('Create service', () => {
	beforeEach(async () => {
		admin = await makeAdmin({}, new UniqueEntityId('admin-1'))

		inMemoryAdminsRepository = new InMemoryAdminsRepository([admin])
		inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
		inMemoryServicesRepository = new InMemoryServicesRepository()

		sut = new CreateServiceUseCase(
			inMemoryAdminsRepository,
			inMemoryCategoriesRepository,
			inMemoryServicesRepository,
		)
	})

	it('should be able to create a service', async () => {
		const category = await makeCategory({ category: { createdBy: admin.id } })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			categoryId: category.id.toString(),
			createdBy: admin.id.toString(),
			name: 'Test',
			price: '39,90',
		})

		expect(result.isRight()).toBeTruthy()
		expect(inMemoryServicesRepository.items[0]).toEqual(
			expect.objectContaining({
				name: 'Test',
				price: 3990, // in cents
			}),
		)
	})

	it('should not be able to create a service if other user roles try to create a service', async () => {
		const technician = await makeTechnician()

		const category = await makeCategory({ category: { createdBy: admin.id } })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			categoryId: category.id.toString(),
			createdBy: technician.id.toString(),
			name: 'Test',
			price: '39,90',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})
})
