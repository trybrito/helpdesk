import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { expect } from 'vitest'
import { UserWithSameEmailError } from '../../errors/user-with-same-email-error'
import { CreateTechnicianUseCase } from './create-technician'

let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let sut: CreateTechnicianUseCase

describe('Create Technician', () => {
	beforeEach(() => {
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		sut = new CreateTechnicianUseCase(inMemoryTechniciansRepository)
	})

	it('should be able to create a technician', async () => {
		const resultOrError = await sut.execute({
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

	it('should not be able to create a technician when using an invalid e-mail', async () => {
		const result = await sut.execute({
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
		const technician = await makeTechnician({
			user: { email: unwrapOrThrow(Email.create('johndoe@mail.com')) },
		})

		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
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
		expect(inMemoryTechniciansRepository.items).toHaveLength(1)
	})

	it('should be able to hash and compare passwords', async () => {
		const password = await Password.createFromPlainText('123456')

		const isValidHash = await password.compare('123456')
		const isInvalidHash = await password.compare('wrong-password')

		expect(isValidHash).toBeTruthy()
		expect(!isInvalidHash).toBeTruthy()
	})
})
