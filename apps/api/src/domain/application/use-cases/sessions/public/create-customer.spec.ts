import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
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
			user: {
				email: 'example@example.com',
				password: '123456',
			},
		})

		const result = unwrapOrThrow(resultOrError)

		expect(resultOrError.isRight()).toBeTruthy()
		expect(inMemoryCustomersRepository.items[0]).toEqual(result.customer)
		expect(inMemoryCustomersRepository.items[0].user.role).toEqual('customer')
	})

	it('should not be able to create a customer when using an invalid e-mail', async () => {
		const resultOrError = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe',
				password: '123456',
			},
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(0)
	})

	it('should not be able to create a customer when using an existing e-mail', async () => {
		const customer = await makeCustomer({
			user: { email: unwrapOrThrow(Email.create('johndoe@mail.com')) },
		})

		inMemoryCustomersRepository.create(customer)

		const resultOrError = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe@mail.com',
				password: '123456',
			},
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryCustomersRepository.items).toHaveLength(1)
	})

	it('should be able to hash and compare passwords', async () => {
		const password = await Password.createFromPlainText('123456')

		const isValidHash = await password.compare('123456')
		const isInvalidHash = await password.compare('wrong-password')

		expect(isValidHash).toBeTruthy()
		expect(!isInvalidHash).toBeTruthy()
	})
})
