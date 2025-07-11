import { InteractionsRepository } from '@api/domain/application/repositories/interactions-repository'
import { Interaction } from '@api/domain/enterprise/entities/interaction'

export class InMemoryInteractionsRepository implements InteractionsRepository {
	public items: Interaction[] = []

	async create(interaction: Interaction): Promise<void> {
		this.items.push(interaction)
	}

	async update(interaction: Interaction): Promise<void> {
		const itemIndex = this.items.findIndex((item) => item.id === interaction.id)

		this.items.splice(itemIndex, 1, interaction)
	}

	async findById(id: string): Promise<Interaction | null> {
		const interaction =
			this.items.find((item) => item.id.toString() === id) ?? null

		return interaction
	}

	async findLastOpenByTicketId(ticketId: string): Promise<Interaction | null> {
		const interaction =
			this.items.find((item) => {
				return item.ticketId.toString() === ticketId && !item.closedAt
			}) ?? null

		return interaction
	}
}
