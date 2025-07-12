import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface ShowDetailedTicketUseCaseRequest {
	actorId: string
	actorRole: Role
	ticketId: string
}

export type ShowDetailedTicketUseCaseResponse = Either<
	NotAllowedError,
	{ ticket: Ticket }
>

export class ShowDetailedTicketUseCase {
	constructor(private ticketsRepository: TicketsRepository) {}

	async execute({
		actorId,
		actorRole,
		ticketId,
	}: ShowDetailedTicketUseCaseRequest): Promise<ShowDetailedTicketUseCaseResponse> {
		const ticket = await this.ticketsRepository.findById(ticketId)

		if (!ticket) {
			return left(new ResourceNotFoundError())
		}

		if (
			actorRole === Role.Technician &&
			actorId !== ticket.technicianId?.toString()
		) {
			return left(new NotAllowedError())
		}

		if (
			actorRole === Role.Customer &&
			actorId !== ticket.customerId.toString()
		) {
			return left(new NotAllowedError())
		}

		return right({ ticket })
	}
}
