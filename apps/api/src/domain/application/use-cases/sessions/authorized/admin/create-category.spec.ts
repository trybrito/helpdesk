import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryCategoriesRepository } from 'apps/api/test/repositories/in-memory-categories-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { CreateCategoryUseCase } from './create-category'

let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let sut: CreateCategoryUseCase

describe('Create category', () => {
	beforeEach(async () => {
		inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
		sut = new CreateCategoryUseCase(inMemoryCategoriesRepository)
	})

	it('should allow an admin to create a category', async () => {
		const admin = await makeAdmin()

		const result = await sut.execute({
			actorRole: admin.user.role,
			createdBy: admin.id.toString(),
			name: 'Test',
		})

		expect(result.isRight()).toBeTruthy()
		expect(inMemoryCategoriesRepository.items[0]).toEqual(
			expect.objectContaining({
				name: 'Test',
			}),
		)
	})

	it('should not allow a technician to create a category', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			createdBy: technician.id.toString(),
			name: 'Test',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryCategoriesRepository.items).toHaveLength(0)
	})

	it('should not allow a customer to create a category', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			actorRole: customer.user.role,
			createdBy: customer.id.toString(),
			name: 'Test',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryCategoriesRepository.items).toHaveLength(0)
	})
})
