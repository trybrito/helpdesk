import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { Service } from '@api/domain/enterprise/entities/service'
import { ServicesRepository } from '../../../../repositories/services-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceAlreadyDeletedError } from '../../../errors/resource-already-deleted-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface SoftDeleteServiceUseCaseRequest {
	actorRole: Role
	serviceId: string
}

export type SoftDeleteServiceUseCaseResponse = Either<
	ResourceNotFoundError | ResourceAlreadyDeletedError | NotAllowedError,
	{ service: Service }
>

export class SoftDeleteServiceUseCase {
	constructor(private servicesRepository: ServicesRepository) {}

	async execute({
		actorRole,
		serviceId,
	}: SoftDeleteServiceUseCaseRequest): Promise<SoftDeleteServiceUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const service = await this.servicesRepository.findById(serviceId)

		if (!service) {
			return left(new ResourceNotFoundError())
		}

		if (service.deletedAt) {
			return left(new ResourceAlreadyDeletedError())
		}

		service.softDelete()

		await this.servicesRepository.update(service)

		return right({ service })
	}
}
