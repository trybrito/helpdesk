import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { CreateCustomerUseCase } from './create-customer'

let inMemoryCustomersRepository: InMemoryCustomersRepository
let sut: CreateCustomerUseCase

describe('Create customer', () => {
	beforeEach(() => {
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		sut = new CreateCustomerUseCase(inMemoryCustomersRepository)
	})

	it('should be able to create a customer', async () => {
		const { customer } = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			email: 'example@example.com',
			password: '123456',
		})

		expect(inMemoryCustomersRepository.items[0]).toEqual(customer)
		expect(inMemoryCustomersRepository.items[0].user.role).toEqual('customer')
	})
})
