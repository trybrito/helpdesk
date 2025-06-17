import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { CreateTechnicianUseCase } from './create-technician'

let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let sut: CreateTechnicianUseCase

describe('Create Technician', () => {
	beforeEach(() => {
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		sut = new CreateTechnicianUseCase(inMemoryTechniciansRepository)
	})

	it('should be able to create a technician', async () => {
		const result = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@mail.com',
			password: '123456',
			scheduleAvailability: [''],
		})

		expect(result.isRight()).toBeTruthy()
		expect(inMemoryTechniciansRepository.items[0]).toBe(result.value.technician)
		expect(inMemoryTechniciansRepository.items[0].user.role).toEqual(
			'technician',
		)
	})

	it('should be able to hash and compare passwords', async () => {
		const password = await Password.createFromPlainText('123456')

		const isValidHash = await password.compare('123456')
		const isInvalidHash = await password.compare('wrong-password')

		expect(isValidHash).toBeTruthy()
		expect(!isInvalidHash).toBeTruthy()
	})
})
