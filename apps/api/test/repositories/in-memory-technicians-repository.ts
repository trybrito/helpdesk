import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'

export class InMemoryTechniciansRepository implements TechniciansRepository {
	public items: Technician[] = []

	async create(technician: Technician): Promise<void> {
		this.items.push(technician)
	}

	async update(technician: Technician): Promise<void> {
		const index = this.items.findIndex((item) => item.id === technician.id)

		this.items.splice(index, 1, technician)
	}

	async findById(id: string): Promise<Technician | null> {
		const technician =
			this.items.find((item) => item.id.toString() === id) ?? null

		return technician
	}

	async findByEmail(email: string): Promise<Technician | null> {
		const technician =
			this.items.find((item) => item.user.email.getValue() === email) ?? null

		return technician
	}
}
