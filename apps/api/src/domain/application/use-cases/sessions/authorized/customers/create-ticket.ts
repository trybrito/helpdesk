import {
	BillingStatus,
	Role,
	TicketAssignmentStatus,
	TicketStatus,
} from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { BillingsRepository } from '@api/domain/application/repositories/billings-repository'
import { CategoriesRepository } from '@api/domain/application/repositories/categories-repository'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Billing } from '@api/domain/enterprise/entities/billing'
import { BillingItem } from '@api/domain/enterprise/entities/billing-item'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { deconstructEitherList } from '../../../helpers/deconstruct-either-list'
import { getAvailableTechnicians } from '../../../helpers/get-available-technicians'
import { getRandomAvailableTechnicianId } from '../../../helpers/get-random-available-technician-id'
import { getServiceByIdOrFail } from '../../../helpers/get-service-or-fail'

export interface CreateTicketUseCaseRequest {
	actorRole: Role
	customerId: string
	categoryId: string
	servicesIds: string[]
	description: string
}

export type CreateTicketUseCaseResponse = Either<
	NotAllowedError | ResourceNotFoundError | InvalidInputDataError,
	{ ticket: Ticket }
>

export class CreateTicketUseCase {
	constructor(
		private ticketsRepository: TicketsRepository,
		private techniciansRepository: TechniciansRepository,
		private categoriesRepository: CategoriesRepository,
		private servicesRepository: ServicesRepository,
		private billingsRepository: BillingsRepository,
	) {}

	async execute({
		actorRole,
		customerId,
		categoryId,
		servicesIds,
		description,
	}: CreateTicketUseCaseRequest): Promise<CreateTicketUseCaseResponse> {
		if (actorRole !== Role.Customer) {
			return left(new NotAllowedError())
		}

		const STATUS = TicketStatus.Open
		const category = await this.categoriesRepository.findById(categoryId)

		if (!category) {
			return left(new ResourceNotFoundError())
		}

		const servicesResults = await Promise.all(
			servicesIds.map(async (id) => {
				const eitherResult = await getServiceByIdOrFail(
					id,
					this.servicesRepository,
				)

				return eitherResult
			}),
		)

		const servicesEitherResult = deconstructEitherList(servicesResults)

		if (servicesEitherResult.isLeft()) {
			return left(servicesEitherResult.value)
		}

		const services = servicesEitherResult.value
		const technicians = await this.techniciansRepository.findMany()

		if (!technicians.length) {
			return left(new ResourceNotFoundError())
		}

		const openTickets = await this.ticketsRepository.findManyByStatus(
			TicketStatus.Open,
		)

		const availableTechniciansEitherResult = getAvailableTechnicians({
			technicians,
			openTickets,
		})

		if (availableTechniciansEitherResult.isLeft()) {
			return left(availableTechniciansEitherResult.value)
		}

		const { availableTechnicians } = availableTechniciansEitherResult.value

		let assignmentStatus = TicketAssignmentStatus.Pendent
		let technicianId: UniqueEntityId | null = null

		if (availableTechnicians.length > 0) {
			assignmentStatus = TicketAssignmentStatus.Assigned
			technicianId = getRandomAvailableTechnicianId({
				availableTechnicians,
			})
		}

		const ticket = Ticket.create({
			customerId: new UniqueEntityId(customerId),
			category,
			assignmentStatus,
			description,
			technicianId,
			services,
			status: STATUS,
		})

		this.ticketsRepository.create(ticket)

		const billingItems = services.map((service) => {
			const billingItem = BillingItem.create({
				serviceId: service.id,
				price: service.price,
			})

			return billingItem
		})

		const billing = Billing.create({
			ticketId: ticket.id,
			status: BillingStatus.Open,
			items: billingItems,
		})

		this.billingsRepository.create(billing)

		return right({ ticket })
	}
}
