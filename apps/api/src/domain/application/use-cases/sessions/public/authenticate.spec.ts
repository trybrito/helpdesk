import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { FakeEncrypter } from 'apps/api/test/crypto/fake-encrypter'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryAdminsRepository } from 'apps/api/test/repositories/in-memory-admins-repository'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'apps/api/test/repositories/in-memory-users-repository'
import { AuthenticateUseCase } from './authenticate'

let admin: Admin

let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let encrypter: FakeEncrypter

let sut: AuthenticateUseCase

describe('Authenticate', () => {
	beforeEach(async () => {
		admin = await makeAdmin({
			user: {
				email: unwrapOrThrow(Email.create('admin@example.com')),
				password: await Password.createFromPlainText('123456'),
			},
		})

		inMemoryAdminsRepository = new InMemoryAdminsRepository([admin])
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryUsersRepository = new InMemoryUsersRepository(
			inMemoryAdminsRepository,
			inMemoryTechniciansRepository,
			inMemoryCustomersRepository,
		)

		encrypter = new FakeEncrypter()

		sut = new AuthenticateUseCase(inMemoryUsersRepository, encrypter)
	})

	it('should be able to authenticate an admin', async () => {
		const result = await sut.execute({
			email: 'admin@example.com',
			password: '123456',
		})

		expect(result.isRight()).toBeTruthy()
		expect(result.value).toEqual({
			accessToken: expect.any(String),
		})
	})

	it('should be able to authenticate a technician', async () => {
		const email = 'technician@example.com'
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

	it('should be able to authenticate a customer', async () => {
		const email = 'customer@example.com'
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

	it('should not be able to authenticate when using invalid e-mail', async () => {
		const email = 'customer@example.com'
		const password = '123456'

		const customer = await makeCustomer({
			user: {
				email: unwrapOrThrow(Email.create('wrong@mail.com')),
				password: await Password.createFromPlainText(password),
			},
		})

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			email,
			password,
		})

		expect(result.isLeft()).toBeTruthy()
	})

	it('should not be able to authenticate when using invalid password', async () => {
		const email = 'customer@example.com'
		const password = '123456'

		const customer = await makeCustomer({
			user: {
				email: unwrapOrThrow(Email.create(email)),
				password: await Password.createFromPlainText('wrong'),
			},
		})

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			email,
			password,
		})

		expect(result.isLeft()).toBeTruthy()
	})
})
