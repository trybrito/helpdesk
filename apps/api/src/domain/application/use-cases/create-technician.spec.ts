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
		const password = '123456'

		const result = await sut.execute({
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@mail.com',
			password,
			scheduleAvailability: [''],
		})

		const hashed = await Password.createFromPlainText(password)

		expect(inMemoryTechniciansRepository.items[0]).toBe(result.technician)
		expect(inMemoryTechniciansRepository.items[0].user).toEqual(
			expect.objectContaining({
				role: 'technician',
			}),
		)
		expect(await hashed.compare(password)).toBeTruthy()
	})
})
