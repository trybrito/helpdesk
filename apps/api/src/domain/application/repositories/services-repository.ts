import { Service } from '@api/domain/enterprise/entities/service'

export abstract class ServicesRepository {
	abstract create(service: Service): Promise<void>
}
