import { Service } from '@api/domain/enterprise/entities/service'

export abstract class ServicesRepository {
	abstract findById(id: string): Promise<Service | null>
	abstract create(service: Service): Promise<void>
	abstract update(service: Service): Promise<void>
}
