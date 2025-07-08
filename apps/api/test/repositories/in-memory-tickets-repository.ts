import { TicketStatus } from '@api/core/@types/enums'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export class InMemoryTicketsRepository implements TicketsRepository {
	public items: Ticket[] = []

	async create(ticket: Ticket): Promise<void> {
		this.items.push(ticket)
	}

	async findManyByStatus(status: TicketStatus): Promise<Ticket[]> {
		const tickets = this.items.filter((item) => item.status === status)

		return tickets
	}
}
