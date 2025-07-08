import { TicketStatus } from '@api/core/@types/enums'
import { PaginationParams } from '@api/core/repositories/pagination-params'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export class InMemoryTicketsRepository implements TicketsRepository {
	public items: Ticket[] = []

	async create(ticket: Ticket): Promise<void> {
		this.items.push(ticket)
	}

	async findMany(params?: PaginationParams): Promise<Ticket[]> {
		if (params?.page) {
			const ticketsWithPagination = this.items.slice(
				(params.page - 1) * 20,
				params.page * 20,
			)

			return ticketsWithPagination
		}

		const tickets = this.items

		return tickets
	}

	async findManyByStatus(status: TicketStatus): Promise<Ticket[]> {
		const tickets = this.items.filter((item) => item.status === status)

		return tickets
	}
}
