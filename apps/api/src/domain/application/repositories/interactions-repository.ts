import { Interaction } from '@api/domain/enterprise/entities/interaction'

export abstract class InteractionsRepository {
	abstract create(interaction: Interaction): Promise<void>
	abstract update(interaction: Interaction): Promise<void>
	abstract findById(id: string): Promise<Interaction | null>
	abstract findLastOpenByTicketId(ticketId: string): Promise<Interaction | null>
}
