import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface FetchTicketsUseCaseRequest {
	actorRole: Role
	page?: number
}

export type FetchTicketsUseCaseResponse = Either<
	NotAllowedError,
	{ tickets: Ticket[] }
>

export class FetchTicketsUseCase {
	constructor(private ticketsRepository: TicketsRepository) {}

	async execute({
		actorRole,
		page,
	}: FetchTicketsUseCaseRequest): Promise<FetchTicketsUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const tickets = await this.ticketsRepository.findMany({ page })

		return right({ tickets })
	}
}
