import { PaginationParams } from '@api/core/repositories/pagination-params'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { Service } from '@api/domain/enterprise/entities/service'

export class InMemoryServicesRepository implements ServicesRepository {
	public items: Service[] = []

	async findById(id: string): Promise<Service | null> {
		const service = this.items.find((item) => item.id.toString() === id) ?? null

		return service
	}

	async create(service: Service): Promise<void> {
		this.items.push(service)
	}

	async update(service: Service): Promise<void> {
		const serviceIndex = this.items.findIndex((item) => item.id === service.id)

		this.items[serviceIndex] = service
	}

	async findMany(params?: PaginationParams): Promise<Service[]> {
		if (params?.page) {
			const paginatedServices = this.items.slice(
				(params.page - 1) * 20,
				params.page * 20,
			)

			return paginatedServices
		}

		return this.items
	}
}
