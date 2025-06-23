import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
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
		const resultOrError = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			email: 'example@example.com',
			password: '123456',
		})

		const result = unwrapOrThrow(resultOrError)

		expect(resultOrError.isRight()).toBeTruthy()
		expect(inMemoryCustomersRepository.items[0]).toEqual(result.customer)
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
