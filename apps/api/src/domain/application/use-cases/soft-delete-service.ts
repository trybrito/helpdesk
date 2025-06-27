import { Either, left, right } from '@api/core/either'
import { Service } from '@api/domain/enterprise/entities/service'
import { AdminsRepository } from '../repositories/admins-repository'
import { ServicesRepository } from '../repositories/services-repository'
import { ActionNotPossibleError } from './errors/action-not-possible-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { verifyAdminPermission } from './utils/verify-admin-permission'

export interface SoftDeleteUseCaseRequest {
	adminId: string
	serviceId: string
}

export type SoftDeleteUseCaseResponse = Either<
	ResourceNotFoundError | ActionNotPossibleError,
	{ service: Service }
>

export class SoftDeleteUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		adminId,
		serviceId,
	}: SoftDeleteUseCaseRequest): Promise<SoftDeleteUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(adminId, this.adminsRepository)

		if (isAdmin.isLeft()) {
			return isAdmin
		}

		const service = await this.servicesRepository.findById(serviceId)

		if (!service) {
			return left(new ResourceNotFoundError())
		}

		if (service.deletedAt) {
			return left(new ActionNotPossibleError())
		}

		service.deletedAt = new Date()

		await this.servicesRepository.update(service)

		return right({ service })
	}
}
