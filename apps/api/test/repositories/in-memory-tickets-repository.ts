import { TicketStatus } from '@api/core/@types/enums'
import { PaginationParams } from '@api/core/repositories/pagination-params'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export class InMemoryTicketsRepository implements TicketsRepository {
	public items: Ticket[] = []

	async create(ticket: Ticket): Promise<void> {
		this.items.push(ticket)
	}

	async update(ticket: Ticket): Promise<void> {
		const itemIndex = this.items.findIndex((item) => item.id === ticket.id)

		this.items.splice(itemIndex, 1, ticket)
	}

	async findById(id: string): Promise<Ticket | null> {
		const ticket = this.items.find((item) => item.id.toString() === id) ?? null

		return ticket
	}

	async findMany(params?: PaginationParams): Promise<Ticket[]> {
		if (params?.page) {
			const paginatedTickets = this.items.slice(
				(params.page - 1) * 20,
				params.page * 20,
			)

			return paginatedTickets
		}

		return this.items
	}

	async findManyByStatus(status: TicketStatus): Promise<Ticket[]> {
		const tickets = this.items.filter((item) => item.status === status)

		return tickets
	}

	async findManyByTechnicianId(
		id: string,
		params?: PaginationParams,
	): Promise<Ticket[]> {
		if (params?.page) {
			const paginatedTicketsByTechnician = this.items
				.filter((item) => item.technicianId?.toString() === id)
				.slice((params.page - 1) * 20, params.page * 20)

			return paginatedTicketsByTechnician
		}

		const ticketsByTechnician = this.items.filter(
			(item) => item.technicianId?.toString() === id,
		)

		return ticketsByTechnician
	}
}
