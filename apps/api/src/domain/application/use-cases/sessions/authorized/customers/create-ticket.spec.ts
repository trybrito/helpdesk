import { TicketAssignmentStatus } from '@api/core/@types/enums'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'
import { TimeRange } from '@api/domain/enterprise/entities/value-objects/time-range'
import { Weekday } from '@api/domain/enterprise/entities/value-objects/weekday'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCategory } from 'apps/api/test/factories/make-category'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeService } from 'apps/api/test/factories/make-service'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeWorkSchedule } from 'apps/api/test/factories/make-work-schedule'
import { InMemoryCategoriesRepository } from 'apps/api/test/repositories/in-memory-categories-repository'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { CreateTicketUseCase } from './create-ticket'

let admin: Admin
let customer: Customer

let inMemoryTicketsRepository: InMemoryTicketsRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryServicesRepository: InMemoryServicesRepository
let sut: CreateTicketUseCase

describe('Create ticket', () => {
	beforeEach(async () => {
		admin = await makeAdmin()
		customer = await makeCustomer()

		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
		inMemoryServicesRepository = new InMemoryServicesRepository()

		sut = new CreateTicketUseCase(
			inMemoryTicketsRepository,
			inMemoryTechniciansRepository,
			inMemoryCategoriesRepository,
			inMemoryServicesRepository,
		)
	})

	it('should allow a customer to create a ticket', async () => {
		const category = await makeCategory()
		inMemoryCategoriesRepository.create(category)

		const stService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(stService)

		const ndService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(ndService)

		const now = new Date()

		const localDay = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
		}).format(now)

		const beforeTimeRange = unwrapOrThrow(
			TimeRange.create({
				start: unwrapOrThrow(
					Time.create(`${now.getHours().toString().padStart(2, '0')}:00`),
				),
				end: unwrapOrThrow(
					Time.create(`${(now.getHours() + 5).toString().padStart(2, '0')}:00`),
				),
			}),
		)

		const afterTimeRange = unwrapOrThrow(
			TimeRange.create({
				start: unwrapOrThrow(
					Time.create(`${(now.getHours() + 6).toString().padStart(2, '0')}:00`),
				),
				end: unwrapOrThrow(
					Time.create(`${(now.getHours() + 8).toString().padStart(2, '0')}:00`),
				),
			}),
		)

		const technician = await makeTechnician({
			technician: {
				availability: await makeWorkSchedule({
					weekday: unwrapOrThrow(Weekday.create(localDay)),
					beforeLunchWorkingHours: beforeTimeRange,
					afterLunchWorkingHours: afterTimeRange,
				}),
			},
		})
		inMemoryTechniciansRepository.create(technician)

		const sutEitherResult = await sut.execute({
			actorRole: customer.user.role,
			customerId: customer.id.toString(),
			categoryId: category.id.toString(),
			servicesIds: [stService.id.toString(), ndService.id.toString()],
			description: 'Example description',
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { ticket } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(ticket)
		expect(inMemoryTicketsRepository.items[0].technicianId).not.toBe(null)
		expect(inMemoryTicketsRepository.items[0].assignmentStatus).toBe(
			TicketAssignmentStatus.Assigned,
		)
	})

	it('should not allow an admin to create a ticket', async () => {
		const result = await sut.execute({
			actorRole: admin.user.role,
			customerId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow an technician to create a ticket', async () => {
		const technician = await makeTechnician()

		const result = await sut.execute({
			actorRole: technician.user.role,
			customerId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to create a ticket using a non-existent category id', async () => {
		const result = await sut.execute({
			actorRole: customer.user.role,
			customerId: customer.id.toString(),
			categoryId: 'non-existent-category',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to create a ticket using a non-existents services ids', async () => {
		const result = await sut.execute({
			actorRole: customer.user.role,
			customerId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['non-existent-service-1', 'non-existent-service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to create a ticket when there are no technicians created', async () => {
		const category = await makeCategory()
		inMemoryCategoriesRepository.create(category)

		const stService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(stService)

		const ndService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(ndService)

		const result = await sut.execute({
			actorRole: customer.user.role,
			customerId: customer.id.toString(),
			categoryId: category.id.toString(),
			servicesIds: [stService.id.toString(), ndService.id.toString()],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should allow a customer to create a ticket to be assigned when there are no technicians available on its creation day and hour', async () => {
		const category = await makeCategory()
		inMemoryCategoriesRepository.create(category)

		const stService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(stService)

		const ndService = await makeService(admin.id, {
			service: { categoryId: category.id },
		})
		inMemoryServicesRepository.create(ndService)

		const now = new Date()

		const localDay = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
		}).format(now)

		const beforeTimeRange = unwrapOrThrow(
			TimeRange.create({
				start: unwrapOrThrow(
					Time.create(
						`${(now.getHours() - 10).toString().padStart(2, '0')}:00`,
					),
				),
				end: unwrapOrThrow(
					Time.create(`${(now.getHours() - 5).toString().padStart(2, '0')}:00`),
				),
			}),
		)

		const afterTimeRange = unwrapOrThrow(
			TimeRange.create({
				start: unwrapOrThrow(
					Time.create(`${(now.getHours() - 4).toString().padStart(2, '0')}:00`),
				),
				end: unwrapOrThrow(
					Time.create(`${(now.getHours() - 2).toString().padStart(2, '0')}:00`),
				),
			}),
		)

		const technician = await makeTechnician({
			technician: {
				availability: await makeWorkSchedule({
					weekday: unwrapOrThrow(Weekday.create(localDay)),
					beforeLunchWorkingHours: beforeTimeRange,
					afterLunchWorkingHours: afterTimeRange,
				}),
			},
		})
		inMemoryTechniciansRepository.create(technician)

		const sutEitherResult = await sut.execute({
			actorRole: customer.user.role,
			customerId: customer.id.toString(),
			categoryId: category.id.toString(),
			servicesIds: [stService.id.toString(), ndService.id.toString()],
			description: 'Example description',
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { ticket } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryTicketsRepository.items[0]).toBe(ticket)
		expect(inMemoryTicketsRepository.items[0].technicianId).toBe(null)
		expect(inMemoryTicketsRepository.items[0].assignmentStatus).toBe(
			TicketAssignmentStatus.Pendent,
		)
	})
})
