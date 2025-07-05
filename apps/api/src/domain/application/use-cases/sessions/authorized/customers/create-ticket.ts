import {
	Role,
	TicketAssignmentStatus,
	TicketStatus,
} from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { CategoriesRepository } from '@api/domain/application/repositories/categories-repository'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'
import { ImpossibleToCreateTicketWithThisStatusError } from '../../../errors/impossible-to-create-ticket-with-this-status-error'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { deconstructEitherList } from '../../../helpers/deconstruct-either-list'
import { getServiceByIdOrFail } from '../../../helpers/get-service-or-fail'

export interface CreateTicketUseCaseRequest {
	actorRole: Role
	customerId: string
	categoryId: string
	servicesIds: string[]
	description: string
	status: TicketStatus
}

export type CreateTicketUseCaseResponse = Either<
	NotAllowedError | ImpossibleToCreateTicketWithThisStatusError,
	{ ticket: Ticket }
>

export class CreateTicketUseCase {
	constructor(
		private ticketsRepository: TicketsRepository,
		private techniciansRepository: TechniciansRepository,
		private categoriesRepository: CategoriesRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		actorRole,
		customerId,
		categoryId,
		servicesIds,
		description,
		status,
	}: CreateTicketUseCaseRequest): Promise<CreateTicketUseCaseResponse> {
		if (actorRole !== Role.Customer) {
			return left(new NotAllowedError())
		}

		if (status !== TicketStatus.Open) {
			return left(new ImpossibleToCreateTicketWithThisStatusError(status))
		}

		const category = await this.categoriesRepository.findById(categoryId)

		if (!category) {
			return left(new ResourceNotFoundError())
		}

		const servicesList = await Promise.all(
			servicesIds.map(async (id) => {
				const eitherResult = await getServiceByIdOrFail(
					id,
					this.servicesRepository,
				)

				return eitherResult
			}),
		)

		const servicesOrError = deconstructEitherList(servicesList)

		if (servicesOrError.isLeft()) {
			return left(servicesOrError.value)
		}

		const services = servicesOrError.value

		const technicians = await this.techniciansRepository.findMany()
		const openTickets = await this.ticketsRepository.findManyOpen()

		const techniciansHandlingTicketsAtTime = openTickets.map(
			(ticket) => ticket.technicianId,
		)

		const techniciansNotHandlingTickets = technicians.filter(
			(technician) => !techniciansHandlingTicketsAtTime.includes(technician.id),
		)

		const now = new Date()

		const localDay = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
		}).format(now)

		const hour = now.getHours().toString().padStart(2, '0')
		const minute = now.getMinutes().toString().padStart(2, '0')

		const formattedTime = `${hour}:${minute}`
		const localTimeOrError = Time.create(formattedTime)

		if (localTimeOrError.isLeft()) {
			return left(localTimeOrError.value)
		}

		const localTime = localTimeOrError.value

		const availableTechnicians = techniciansNotHandlingTickets.filter(
			(technician) => {
				return technician.availability.find((availability) => {
					return (
						availability.weekday.getValue() === localDay &&
						(availability.beforeLunchWorkingHours.isBetween(localTime) ||
							availability.afterLunchWorkingHours.isBetween(localTime))
					)
				})
			},
		)

		let assignmentStatus = TicketAssignmentStatus.Assigned
		let technicianId: UniqueEntityId | null =
			availableTechnicians[
				Math.floor(Math.random() * availableTechnicians.length)
			].id

		if (availableTechnicians.length === 0) {
			assignmentStatus = TicketAssignmentStatus.Pendent
			technicianId = null
		}

		const ticket = Ticket.create({
			customerId: new UniqueEntityId(customerId),
			category,
			assignmentStatus,
			description,
			technicianId,
			services,
			status,
		})

		return right({ ticket })
	}
}
