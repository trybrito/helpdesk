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
import { expect } from 'vitest'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { UpdateTechnicianProfileUseCase } from './update-technician-profile'

let admin: Admin

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryAdminsRepository: InMemoryAdminsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let sut: UpdateTechnicianProfileUseCase

describe('Update technician', () => {
	beforeEach(async () => {
		const authContext = await authenticatedAdminSetup('admin-1', {
			user: { email: unwrapOrThrow(Email.create('admin@example.com')) },
			admin: { firstName: 'John' },
		})

		admin = authContext.admin
		inMemoryAdminsRepository = authContext.adminsRepository

		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryUsersRepository = new InMemoryUsersRepository(
			inMemoryAdminsRepository,
			inMemoryTechniciansRepository,
			inMemoryCustomersRepository,
		)
		sut = new UpdateTechnicianProfileUseCase(
			inMemoryUsersRepository,
			inMemoryTechniciansRepository,
		)
	})

	it('should allow a technician to update its own profile', async () => {
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(technician)

		const resultOrError = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			targetId: technician.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryTechniciansRepository.items[0]).toBe(result.technician)
		expect(inMemoryTechniciansRepository.items[0].updatedAt).toBeTruthy()
		expect(
			inMemoryTechniciansRepository.items[0].mustUpdatePassword,
		).toBeFalsy()
		expect(inMemoryTechniciansRepository.items[0].firstName).toBe('John')
		expect(inMemoryTechniciansRepository.items[0].user.email.getValue()).toBe(
			'doe@mail.com',
		)
	})

	it('should allow an admin to update a technician profile', async () => {
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(technician)

		const resultOrError = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: technician.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryTechniciansRepository.items[0]).toBe(result.technician)
		expect(inMemoryTechniciansRepository.items[0].updatedAt).toBeTruthy()
		expect(
			inMemoryTechniciansRepository.items[0].mustUpdatePassword,
		).toBeFalsy()
		expect(inMemoryTechniciansRepository.items[0].lastName).toBe('Doe')
		expect(
			inMemoryTechniciansRepository.items[0].user.password.compare('123456'),
		).toBeTruthy()
	})

	it('should not allow a technician to update other technician profile', async () => {
		const actorTechnician = await makeTechnician()

		const targetTechnician = await makeTechnician()

		inMemoryTechniciansRepository.create(targetTechnician)

		const result = await sut.execute({
			actorId: actorTechnician.id.toString(),
			actorRole: actorTechnician.user.role,
			targetId: targetTechnician.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to update a technician profile', async () => {
		const customer = await makeCustomer()

		const technician = await makeTechnician()
		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			targetId: technician.id.toString(),

			firstName: 'John',
			lastName: 'Doe',
			user: {
				email: 'doe@mail.com',
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to update technician profile e-mail using an existent admin e-mail', async () => {
		const email = 'same@mail.com'

		const admin = await makeAdmin({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryAdminsRepository.items[0] = admin

		const technicianToUpdate = await makeTechnician()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: technicianToUpdate.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update technician profile e-mail using an existent technician e-mail', async () => {
		const email = 'same@mail.com'

		const technician = await makeTechnician({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryTechniciansRepository.create(technician)

		const technicianToUpdate = await makeTechnician()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: technicianToUpdate.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update technician profile e-mail using an existent customer e-mail', async () => {
		const email = 'same@mail.com'

		const customer = await makeCustomer({
			user: { email: unwrapOrThrow(Email.create(email)) },
		})

		inMemoryCustomersRepository.create(customer)

		const technicianToUpdate = await makeTechnician()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: technicianToUpdate.id.toString(),
			firstName: 'John',
			lastName: 'Doe',
			user: {
				email,
				password: '123456',
			},
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(UserWithSameEmailError)
	})

	it('should not be able to update a non-existent technician', async () => {
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
			availability: [
				{
					weekday: 'Monday',
					beforeLunchWorkingHours: { start: '07:00', end: '13:00' },
					afterLunchWorkingHours: { start: '14:00', end: '16:00' },
				},
			],
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
