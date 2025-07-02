import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { authenticatedAdminSetup } from 'apps/api/test/factories/helpers/authenticated-admin-setup'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryAdminsRepository } from 'apps/api/test/repositories/in-memory-admins-repository'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'apps/api/test/repositories/in-memory-users-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { UpdateCustomerProfileUseCase } from './update-customer-profile'

let admin: Admin

let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: UpdateCustomerProfileUseCase

describe('Update technician', () => {
	beforeEach(async () => {
		const authContext = await authenticatedAdminSetup('admin-1')

		admin = authContext.admin
		inMemoryAdminsRepository = authContext.adminsRepository

		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryUsersRepository = new InMemoryUsersRepository(
			inMemoryAdminsRepository,
			inMemoryTechniciansRepository,
			inMemoryCustomersRepository,
		)
		sut = new UpdateCustomerProfileUseCase(
			inMemoryUsersRepository,
			inMemoryCustomersRepository,
		)
	})

	it('should allow a customer to update its own profile', async () => {
		const customer = await makeCustomer()

		await inMemoryCustomersRepository.create(customer)

		const resultOrError = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
			user: {
				email: 'customer@mail.com',
				password: '123456',
			},
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryCustomersRepository.items[0]).toBe(result.customer)
		expect(inMemoryCustomersRepository.items[0].user.email.getValue()).toBe(
			'customer@mail.com',
		)
		expect(inMemoryCustomersRepository.items[0]).toEqual(
			expect.objectContaining({
				firstName: 'John',
				lastName: 'Doe',
			}),
		)
	})

	it('should allow an admin to update a customer profile', async () => {
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const resultOrError = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
			user: {
				email: 'customer@mail.com',
				password: '123456',
			},
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryCustomersRepository.items[0]).toBe(result.customer)
		expect(inMemoryCustomersRepository.items[0].user.email.getValue()).toBe(
			'customer@mail.com',
		)
		expect(inMemoryCustomersRepository.items[0]).toEqual(
			expect.objectContaining({
				firstName: 'John',
				lastName: 'Doe',
			}),
		)
	})

	it('should not allow a customer to update other customer profile', async () => {
		const actorCustomer = await makeCustomer()

		const targetCustomer = await makeCustomer()

		inMemoryCustomersRepository.create(targetCustomer)

		const result = await sut.execute({
			actorId: actorCustomer.id.toString(),
			actorRole: actorCustomer.user.role,
			targetId: targetCustomer.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a technician to update a customer profile', async () => {
		const technician = await makeTechnician()

		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			targetId: customer.id.toString(),

			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to update customer profile e-mail using an existent admin e-mail', async () => {
		const email = 'same@mail.com'

		const admin = await makeAdmin({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryAdminsRepository.items[0] = admin

		const customer = await makeCustomer()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update customer profile e-mail using an existent technician e-mail', async () => {
		const email = 'same@mail.com'

		const technician = await makeTechnician({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryTechniciansRepository.create(technician)

		const customer = await makeCustomer()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update customer profile e-mail using an existent customer e-mail', async () => {
		const email = 'same@mail.com'

		const customer = await makeCustomer({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryCustomersRepository.create(customer)

		const customerToUpdate = await makeCustomer()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customerToUpdate.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update a non-existent customer', async () => {
		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: 'non-existent-1',
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
