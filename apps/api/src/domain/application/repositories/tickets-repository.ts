import { TicketStatus } from '@api/core/@types/enums'
import { PaginationParams } from '@api/core/repositories/pagination-params'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export abstract class TicketsRepository {
	abstract create(ticket: Ticket): Promise<void>
	abstract findManyByStatus(status: TicketStatus): Promise<Ticket[]>
	abstract findMany(params?: PaginationParams): Promise<Ticket[]>
}
