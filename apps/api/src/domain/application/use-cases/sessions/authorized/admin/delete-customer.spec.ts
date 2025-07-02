import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { DeleteCustomerUseCase } from './delete-customer'

let admin: Admin

let inMemoryCustomersRepository: InMemoryCustomersRepository
let sut: DeleteCustomerUseCase

describe('Delete customer', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		sut = new DeleteCustomerUseCase(inMemoryCustomersRepository)
	})

	it('should allow an admin to delete a customer', async () => {
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isRight()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(0)
	})

	it('should not allow a technician to delete a customer', async () => {
		const technician = await makeTechnician()

		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: technician.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(1)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to delete other customers profile', async () => {
		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(1)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to delete other customers profile', async () => {
		const customer = await makeCustomer()

		const customerToBeDeleted = await makeCustomer()
		inMemoryCustomersRepository.create(customerToBeDeleted)

		const result = await sut.execute({
			actorRole: customer.user.role,
			targetId: customerToBeDeleted.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(1)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to delete a non-existent customer', async () => {
		const result = await sut.execute({
			actorRole: admin.user.role,
			targetId: 'non-existent',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
