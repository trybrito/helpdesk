import { PaginationParams } from '@api/core/repositories/pagination-params'
import { Ticket } from '@api/domain/enterprise/entities/ticket'

export abstract class TicketsRepository {
	abstract create(ticket: Ticket): Promise<void>
	abstract findManyOpen(params?: PaginationParams): Promise<Ticket[]>
}
