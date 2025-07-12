import { Role, TicketStatus } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { InteractionsRepository } from '@api/domain/application/repositories/interactions-repository'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Interaction } from '@api/domain/enterprise/entities/interaction'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { TicketNotAssignedToATechnician } from '../../../errors/ticket-not-assigned-to-a-technician-error'

export interface ChangeTicketStatusUseCaseRequest {
	actorId: string
	actorRole: Role
	ticketId: string
}

export type ChangeTicketStatusUseCaseResponse = Either<
	NotAllowedError | ResourceNotFoundError,
	{
		ticket: Ticket
		// interaction: Interaction
	}
>

export class ChangeTicketStatusUseCase {
	constructor(
		private ticketsRepository: TicketsRepository,
		private interactionsRepository: InteractionsRepository,
	) {}

	async execute({
		actorId,
		actorRole,
		ticketId,
	}: ChangeTicketStatusUseCaseRequest): Promise<ChangeTicketStatusUseCaseResponse> {
		if (actorRole !== Role.Admin && actorRole !== Role.Technician) {
			return left(new NotAllowedError())
		}

		const ticket = await this.ticketsRepository.findById(ticketId)

		if (!ticket) {
			return left(new ResourceNotFoundError())
		}

		if (!ticket.technicianId) {
			return left(new TicketNotAssignedToATechnician())
		}

		if (
			actorRole === Role.Technician &&
			actorId !== ticket.technicianId.toString()
		) {
			return left(new NotAllowedError())
		}

		const ticketWillBeHandled = ticket.status === TicketStatus.Open

		if (ticketWillBeHandled) {
			const interaction = Interaction.create({
				ticketId: ticket.id,
				technicianId: ticket.technicianId,
			})

			await this.interactionsRepository.create(interaction)
		}

		const ticketWillBeClose = ticket.status === TicketStatus.BeingHandled

		if (ticketWillBeClose) {
			const interaction =
				await this.interactionsRepository.findLastOpenByTicketId(ticketId)

			if (!interaction) {
				return left(new ResourceNotFoundError())
			}

			interaction.close()

			await this.interactionsRepository.update(interaction)
		}

		ticket.changeTicketStatus()

		await this.ticketsRepository.update(ticket)

		return right({ ticket })
	}
}
