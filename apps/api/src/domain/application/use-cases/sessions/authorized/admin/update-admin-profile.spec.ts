import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { authenticatedAdminSetup } from 'apps/api/test/factories/helpers/authenticated-admin-setup'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryAdminsRepository } from 'apps/api/test/repositories/in-memory-admins-repository'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'apps/api/test/repositories/in-memory-users-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { UpdateAdminProfileUseCase } from './update-admin-profile'

let _admin: Admin

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let sut: UpdateAdminProfileUseCase

describe('Update admin', () => {
	beforeEach(async () => {
		const authContext = await authenticatedAdminSetup('admin-1', {
			user: { email: unwrapOrThrow(Email.create('example@example.com')) },
			admin: { firstName: 'John' },
		})

		_admin = authContext.admin
		inMemoryAdminsRepository = authContext.adminsRepository
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryUsersRepository = new InMemoryUsersRepository(
			inMemoryAdminsRepository,
			inMemoryTechniciansRepository,
			inMemoryCustomersRepository,
		)
		sut = new UpdateAdminProfileUseCase(
			inMemoryAdminsRepository,
			inMemoryUsersRepository,
		)
	})

	it('should allow an admin to update its own profile', async () => {
		const resultOrError = await sut.execute({
			user: {
				email: 'doe@example.com',
				password: '654321',
			},
			requesterId: 'admin-1',
			adminId: 'admin-1',
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryAdminsRepository.items[0]).toBe(result.admin)
		expect(inMemoryAdminsRepository.items[0].firstName).toBe('John')
		expect(inMemoryAdminsRepository.items[0].user.email.getValue()).toBe(
			'doe@example.com',
		)
	})

	it('should not allow an admin to update other admin profile', async () => {
		const result = await sut.execute({
			user: {
				email: 'doe@example.com',
				password: '654321',
			},
			requesterId: 'other-admin',
			adminId: 'admin-1',
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryAdminsRepository.items[0].user.email.getValue()).toBe(
			'example@example.com',
		)
	})

	it('should not be able to change the admins profile e-mail using other existent e-mail', async () => {
		const technician = await makeTechnician({
			user: { email: unwrapOrThrow(Email.create('same@email.com')) },
		})

		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
			user: {
				email: 'same@email.com',
				password: '654321',
			},
			requesterId: 'admin-1',
			adminId: 'admin-1',
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not allow a technician to update an admin profile', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			user: {
				email: 'doe@example.com',
				password: '654321',
			},
			requesterId: technician.id.toString(),
			adminId: 'admin-1',
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryAdminsRepository.items[0].user.email.getValue()).toBe(
			'example@example.com',
		)
	})

	it('should not allow a customer to update an admin profile', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			user: {
				email: 'doe@example.com',
				password: '654321',
			},
			requesterId: customer.id.toString(),
			adminId: 'admin-1',
			firstName: 'John',
			lastName: 'Doe',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryAdminsRepository.items[0].user.email.getValue()).toBe(
			'example@example.com',
		)
	})
})
