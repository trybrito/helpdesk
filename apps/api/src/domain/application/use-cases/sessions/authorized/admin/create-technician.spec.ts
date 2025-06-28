import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
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
import {} from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { CreateTechnicianUseCase } from './create-technician'

let admin: Admin
let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let sut: CreateTechnicianUseCase

describe('Create Technician', () => {
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

		sut = new CreateTechnicianUseCase(
			inMemoryAdminsRepository,
			inMemoryUsersRepository,
			inMemoryTechniciansRepository,
		)
	})

	it('should allow an admin to create a technician', async () => {
		const resultOrError = await sut.execute({
			requesterId: admin.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe@mail.com',
				password: '123456',
			},
			scheduleAvailability: [''],
		})

		const result = unwrapOrThrow(resultOrError)

		expect(resultOrError.isRight()).toBeTruthy()
		expect(inMemoryTechniciansRepository.items[0]).toBe(result.technician)
		expect(inMemoryTechniciansRepository.items[0].user.role).toEqual(
			'technician',
		)
	})

	it('should not allow a technician to create another technician', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			requesterId: technician.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe@mail.com',
				password: '123456',
			},
			scheduleAvailability: [''],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to create a technician', async () => {
		const customer = await makeCustomer()

		const result = await sut.execute({
			requesterId: customer.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe@mail.com',
				password: '123456',
			},
			scheduleAvailability: [''],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to create a technician when using an invalid e-mail', async () => {
		const result = await sut.execute({
			requesterId: admin.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe',
				password: '123456',
			},
			scheduleAvailability: [''],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(InvalidInputDataError)
		expect(inMemoryTechniciansRepository.items).toHaveLength(0)
	})

	it('should not be able to create a technician when using an existing e-mail', async () => {
		const customer = await makeCustomer({
			user: { email: unwrapOrThrow(Email.create('johndoe@mail.com')) },
		})

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			requesterId: admin.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'johndoe@mail.com',
				password: '123456',
			},
			scheduleAvailability: [''],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
		expect(inMemoryTechniciansRepository.items).toHaveLength(0)
	})
})
