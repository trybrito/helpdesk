import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCategory } from 'apps/api/test/factories/make-category'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryCategoriesRepository } from 'apps/api/test/repositories/in-memory-categories-repository'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { CreateServiceUseCase } from './create-service'

let admin: Admin

let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryServicesRepository: InMemoryServicesRepository
let sut: CreateServiceUseCase

describe('Create service', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
		inMemoryServicesRepository = new InMemoryServicesRepository()

		sut = new CreateServiceUseCase(
			inMemoryCategoriesRepository,
			inMemoryServicesRepository,
		)
	})

	it('should allow an admin to create a service', async () => {
		const category = await makeCategory({ createdBy: admin.id })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: admin.user.role,
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

	it('should not allow a technician to create a service', async () => {
		const technician = await makeTechnician()

		const category = await makeCategory({ createdBy: admin.id })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: technician.user.role,
			categoryId: category.id.toString(),
			createdBy: technician.id.toString(),
			name: 'Test',
			price: '39,90',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})

	it('should not allow a customer to create a service', async () => {
		const customer = await makeCustomer()

		const category = await makeCategory({ createdBy: admin.id })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: customer.user.role,
			categoryId: category.id.toString(),
			createdBy: customer.id.toString(),
			name: 'Test',
			price: '39,90',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})

	it('should not be able to create a service without category', async () => {
		const result = await sut.execute({
			actorRole: admin.user.role,
			categoryId: 'non-existent',
			createdBy: admin.id.toString(),
			name: 'Test',
			price: '39,90',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})

	it('should not be able to create a service with invalid price', async () => {
		const category = await makeCategory({ createdBy: admin.id })

		await inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: admin.user.role,
			categoryId: category.id.toString(),
			createdBy: admin.id.toString(),
			name: 'Test',
			price: 'wrong',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(InvalidInputDataError)
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})
})
