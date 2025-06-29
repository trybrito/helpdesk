import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { TechnicianAlreadyDeletedError } from '../../../errors/technician-already-deleted-error'
import { SoftDeleteTechnicianUseCase } from './soft-delete-technician'

let admin: Admin

let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let sut: SoftDeleteTechnicianUseCase

describe('Soft delete technician', () => {
	beforeEach(async () => {
		admin = await makeAdmin()

		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		sut = new SoftDeleteTechnicianUseCase(inMemoryTechniciansRepository)
	})

	it('should allow an admin to soft delete a technician', async () => {
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(technician)

		const resultOrError = await sut.execute({
			actorRole: admin.user.role,
			technicianId: technician.id.toString(),
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryTechniciansRepository.items[0]).toBe(result.technician)
		expect(inMemoryTechniciansRepository.items[0].deletedAt).not.toBe(null)
	})

	it('should not allow a technician to soft delete another technician', async () => {
		const requesterTechnician = await makeTechnician()
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(requesterTechnician)
		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
			actorRole: technician.user.role,
			technicianId: technician.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryTechniciansRepository.items[0].deletedAt).toBeFalsy()
	})

	it('should not allow a customer to soft delete a technician', async () => {
		const customer = await makeCustomer()
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(technician)

		const result = await sut.execute({
			actorRole: customer.user.role,
			technicianId: technician.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
		expect(inMemoryTechniciansRepository.items[0].deletedAt).toBeFalsy()
	})

	it('should not be able to soft delete a non-existent technician', async () => {
		const result = await sut.execute({
			actorRole: admin.user.role,
			technicianId: 'non-existent',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
		expect(inMemoryTechniciansRepository.items).toHaveLength(0)
	})

	it('should not be able to soft delete an already deleted technician', async () => {
		const technician = await makeTechnician()

		inMemoryTechniciansRepository.create(technician)

		await sut.execute({
			actorRole: admin.user.role,
			technicianId: technician.id.toString(),
		})

		const result = await sut.execute({
			actorRole: admin.user.role,
			technicianId: technician.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(TechnicianAlreadyDeletedError)
		expect(inMemoryTechniciansRepository.items).toHaveLength(1)
	})
})
