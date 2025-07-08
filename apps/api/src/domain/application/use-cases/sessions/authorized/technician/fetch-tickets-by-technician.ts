import { Either, left, right } from '@api/core/either'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'

interface FetchTicketsByTechnicianUseCaseRequest {
	actorId: string
	targetId: string
	page?: number
}

type FetchTicketsByTechnicianUseCaseResponse = Either<
	NotAllowedError,
	{ tickets: Ticket[] }
>

export class FetchTicketsByTechnicianUseCase {
	constructor(private ticketsRepository: TicketsRepository) {}

	async execute({
		actorId,
		targetId,
		page,
	}: FetchTicketsByTechnicianUseCaseRequest): Promise<FetchTicketsByTechnicianUseCaseResponse> {
		if (actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const tickets = await this.ticketsRepository.findManyByTechnicianId(
			targetId,
			{ page },
		)

		return right({ tickets })
	}
}
