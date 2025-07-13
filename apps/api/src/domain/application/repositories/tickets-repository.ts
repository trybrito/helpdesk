import { TicketStatus } from '@api/core/@types/enums'
import { PaginationParams } from '@api/core/repositories/pagination-params'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export abstract class TicketsRepository {
	abstract create(ticket: Ticket): Promise<void>
	abstract update(ticket: Ticket): Promise<void>
	abstract findById(id: string): Promise<Ticket | null>
	abstract findMany(params?: PaginationParams): Promise<Ticket[]>
	abstract findManyByStatus(status: TicketStatus): Promise<Ticket[]>
	abstract findManyByTechnicianId(
		id: string,
		params?: PaginationParams,
	): Promise<Ticket[]>
	abstract findManyByCustomerId(
		id: string,
		params?: PaginationParams,
	): Promise<Ticket[]>
}
