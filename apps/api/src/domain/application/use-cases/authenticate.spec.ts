import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { FakeEncrypter } from 'apps/api/test/crypto/fake-encrypter'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'apps/api/test/repositories/in-memory-users-repository'
import { AuthenticateUseCase } from './authenticate'

let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
	beforeEach(() => {
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryUsersRepository = new InMemoryUsersRepository(
			inMemoryTechniciansRepository,
			inMemoryCustomersRepository,
		)

		encrypter = new FakeEncrypter()

		sut = new AuthenticateUseCase(inMemoryUsersRepository, encrypter)
	})

	it('should be able to authenticate a customer', async () => {
		const email = 'example@example.com'
		const password = '123456'

		const customer = await makeCustomer({
			user: {
				email: unwrapOrThrow(Email.create(email)),
				password: await Password.createFromPlainText(password),
			},
		})

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			email,
			password,
		})

		expect(result.isRight()).toBeTruthy()
		expect(result.value).toEqual({
			accessToken: expect.any(String),
		})
	})

	it('should be able to authenticate a technician', async () => {
		const email = 'example@example.com'
		const password = '123456'

		const technician = await makeTechnician({
			user: {
				email: unwrapOrThrow(Email.create(email)),
				password: await Password.createFromPlainText(password),
			},
		})

		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
			email,
			password,
		})

		expect(result.isRight()).toBeTruthy()
		expect(result.value).toEqual({
			accessToken: expect.any(String),
		})
	})
})
