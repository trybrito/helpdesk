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
}
