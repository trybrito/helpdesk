import { TicketAssignmentStatus } from '@api/core/@types/enums'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'
import { TimeRange } from '@api/domain/enterprise/entities/value-objects/time-range'
import { Weekday } from '@api/domain/enterprise/entities/value-objects/weekday'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeCategory } from 'apps/api/test/factories/make-category'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeService } from 'apps/api/test/factories/make-service'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeWorkSchedule } from 'apps/api/test/factories/make-work-schedule'
import { InMemoryBillingsRepository } from 'apps/api/test/repositories/in-memory-billings-repository'
import { InMemoryCategoriesRepository } from 'apps/api/test/repositories/in-memory-categories-repository'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryServicesRepository } from 'apps/api/test/repositories/in-memory-services-repository'
import { InMemoryTechniciansRepository } from 'apps/api/test/repositories/in-memory-technicians-repository'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { CreateTicketUseCase } from './create-ticket'

let inMemoryTicketsRepository: InMemoryTicketsRepository
let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryTechniciansRepository: InMemoryTechniciansRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryServicesRepository: InMemoryServicesRepository
let inMemoryBillingsRepository: InMemoryBillingsRepository
let sut: CreateTicketUseCase

describe('Create ticket', () => {
	beforeEach(async () => {
		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryTechniciansRepository = new InMemoryTechniciansRepository()
		inMemoryCategoriesRepository = new InMemoryCategoriesRepository()
		inMemoryServicesRepository = new InMemoryServicesRepository()
		inMemoryBillingsRepository = new InMemoryBillingsRepository()

		sut = new CreateTicketUseCase(
			inMemoryTicketsRepository,
			inMemoryCustomersRepository,
			inMemoryTechniciansRepository,
			inMemoryCategoriesRepository,
			inMemoryServicesRepository,
			inMemoryBillingsRepository,
		)
	})

	it('should allow a customer to create a ticket', async () => {
		const admin = await makeAdmin()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

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
			actorId: customer.id.toString(),
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
		expect(inMemoryBillingsRepository.items).toHaveLength(1)
		expect(inMemoryBillingsRepository.items[0].ticketId).toBe(ticket.id)
		expect(inMemoryBillingsRepository.items[0].totalPrice).toEqual(
			expect.objectContaining({
				value: expect.any(Number),
			}),
		)
	})

	it('should not allow an admin to create a ticket', async () => {
		const admin = await makeAdmin()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: admin.user.role,
			actorId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a technician to create a ticket', async () => {
		const technician = await makeTechnician()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: technician.user.role,
			actorId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to create a ticket when the received actor id does not exist on persistency', async () => {
		const customer = await makeCustomer()

		const category = await makeCategory()
		inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: customer.user.role,
			actorId: customer.id.toString(), // not persisted
			categoryId: category.id.toString(),
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to create a ticket when the customer actor was soft deleted', async () => {
		const customer = await makeCustomer({ customer: { deletedAt: new Date() } })

		inMemoryCustomersRepository.create(customer)

		const category = await makeCategory()
		inMemoryCategoriesRepository.create(category)

		const result = await sut.execute({
			actorRole: customer.user.role,
			actorId: customer.id.toString(),
			categoryId: category.id.toString(),
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to create a ticket using a non-existent category id', async () => {
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: customer.user.role,
			actorId: customer.id.toString(),
			categoryId: 'non-existent-category',
			servicesIds: ['service-1', 'service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to create a ticket using a non-existent services ids', async () => {
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorRole: customer.user.role,
			actorId: customer.id.toString(),
			categoryId: 'category-1',
			servicesIds: ['non-existent-service-1', 'non-existent-service-2'],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to create a ticket when there are no technicians created', async () => {
		const admin = await makeAdmin()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

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
			actorId: customer.id.toString(),
			categoryId: category.id.toString(),
			servicesIds: [stService.id.toString(), ndService.id.toString()],
			description: 'Example description',
		})

		expect(result.isLeft()).toBeTruthy()

		expect(inMemoryTicketsRepository.items).toHaveLength(0)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should allow a customer to create a ticket to be assigned when there are no technicians available on its creation day and hour', async () => {
		const admin = await makeAdmin()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

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
			actorId: customer.id.toString(),
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
