import { Either, left, right } from '@api/core/either'
import { Service } from '@api/domain/enterprise/entities/service'
import { AdminsRepository } from '../../../../repositories/admins-repository'
import { ServicesRepository } from '../../../../repositories/services-repository'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { ServiceAlreadyDeletedError } from '../../../errors/service-already-deleted-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface SoftDeleteServiceUseCaseRequest {
	adminId: string
	serviceId: string
}

export type SoftDeleteServiceUseCaseResponse = Either<
	ResourceNotFoundError | ServiceAlreadyDeletedError,
	{ service: Service }
>

export class SoftDeleteServiceUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		adminId,
		serviceId,
	}: SoftDeleteServiceUseCaseRequest): Promise<SoftDeleteServiceUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(adminId, this.adminsRepository)

		if (isAdmin.isLeft()) {
			return left(isAdmin.value)
		}

		const service = await this.servicesRepository.findById(serviceId)

		if (!service) {
			return left(new ResourceNotFoundError())
		}

		if (service.deletedAt) {
			return left(new ServiceAlreadyDeletedError())
		}

		service.softDelete()

		await this.servicesRepository.update(service)

		return right({ service })
	}
}
