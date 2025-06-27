import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { authenticatedAdminSetup } from 'apps/api/test/factories/helpers/authenticated-admin-setup'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeService } from 'apps/api/test/factories/make-service'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryAdminsRepository } from 'apps/api/test/repositories/in-memory-admins-repository'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { SoftDeleteUseCase } from './soft-delete-service'

let admin: Admin
let inMemoryAdminsRepository: InMemoryAdminsRepository

let inMemoryServicesRepository: InMemoryServicesRepository
let sut: SoftDeleteUseCase

describe('Soft delete service', () => {
	beforeEach(async () => {
		const authContext = await authenticatedAdminSetup('admin-1')

		admin = authContext.admin
		inMemoryAdminsRepository = authContext.adminsRepository

		inMemoryServicesRepository = new InMemoryServicesRepository()
		sut = new SoftDeleteUseCase(
			inMemoryAdminsRepository,
			inMemoryServicesRepository,
		)
	})

	it('should allow an admin to soft delete a service', async () => {
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const resultOrError = await sut.execute({
			adminId: admin.id.toString(),
			serviceId: service.id.toString(),
		})

		expect(resultOrError.isRight()).toBeTruthy()

		const result = unwrapOrThrow(resultOrError)

		expect(inMemoryServicesRepository.items[0]).toBe(result.service)
		expect(inMemoryServicesRepository.items[0].deletedAt).not.toBe(
			expect.any(Date),
		)
	})

	it('should not allow a technician to soft delete a service', async () => {
		const technician = await makeTechnician()
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const resultOrError = await sut.execute({
			adminId: technician.id.toString(),
			serviceId: service.id.toString(),
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryServicesRepository.items[0].deletedAt).toBeFalsy()
	})

	it('should not allow a customer to soft delete a service', async () => {
		const customer = await makeCustomer()
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		const resultOrError = await sut.execute({
			adminId: customer.id.toString(),
			serviceId: service.id.toString(),
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryServicesRepository.items[0].deletedAt).toBeFalsy()
	})

	it('should not be able to soft delete a non-existent service', async () => {
		await sut.execute({
			adminId: admin.id.toString(),
			serviceId: 'non-existent',
		})

		const resultOrError = await sut.execute({
			adminId: admin.id.toString(),
			serviceId: 'non-existent',
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryServicesRepository.items).toHaveLength(0)
	})

	it('should not be able to soft delete an already deleted service', async () => {
		const service = await makeService(admin.id)

		inMemoryServicesRepository.create(service)

		await sut.execute({
			adminId: admin.id.toString(),
			serviceId: service.id.toString(),
		})

		const resultOrError = await sut.execute({
			adminId: admin.id.toString(),
			serviceId: service.id.toString(),
		})

		expect(resultOrError.isLeft()).toBeTruthy()
		expect(inMemoryServicesRepository.items).toHaveLength(1)
	})
})
