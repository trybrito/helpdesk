import { Password } from '@api/domain/enterprise/entities/value-objects/password'
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
		const result = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			email: 'example@example.com',
			password: '123456',
		})

		expect(inMemoryCustomersRepository.items[0]).toEqual(result.value.customer)
		expect(inMemoryCustomersRepository.items[0].user.role).toEqual('customer')
	})

	it('should be able to hash and compare passwords', async () => {
		const password = await Password.createFromPlainText('123456')

		const isValidHash = await password.compare('123456')
		const isInvalidHash = await password.compare('wrong-password')

		expect(isValidHash).toBeTruthy()
		expect(!isInvalidHash).toBeTruthy()
	})
})
