import { Either, left, right } from '@api/core/either'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface FetchTicketsByCustomerUseCaseRequest {
	actorId: string
	targetId: string
	page?: number
}

export type FetchTicketsByCustomerUseCaseResponse = Either<
	NotAllowedError,
	{ tickets: Ticket[] }
>

export class FetchTicketsByCustomerUseCase {
	constructor(private ticketsRepository: TicketsRepository) {}

	async execute({
		actorId,
		targetId,
		page,
	}: FetchTicketsByCustomerUseCaseRequest): Promise<FetchTicketsByCustomerUseCaseResponse> {
		if (actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const tickets = await this.ticketsRepository.findManyByCustomerId(
			targetId,
			{
				page,
			},
		)

		return right({ tickets })
	}
}
