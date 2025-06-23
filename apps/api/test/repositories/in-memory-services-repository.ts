import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { Service } from '@api/domain/enterprise/entities/service'

export class InMemoryServicesRepository implements ServicesRepository {
	public items: Service[] = []

	async create(service: Service): Promise<void> {
		this.items.push(service)
	}
}
