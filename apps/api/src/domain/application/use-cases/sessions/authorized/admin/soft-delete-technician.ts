import { Either, left, right } from '@api/core/either'
import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { TechnicianAlreadyDeletedError } from '../../../errors/technician-already-deleted-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface SoftDeleteTechnicianUseCaseRequest {
	requesterId: string
	technicianId: string
}

export type SoftDeleteTechnicianUseCaseResponse = Either<
	NotAllowedError,
	{ technician: Technician }
>

export class SoftDeleteTechnicianUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private techniciansRepository: TechniciansRepository,
	) {}

	async execute({
		requesterId,
		technicianId,
	}: SoftDeleteTechnicianUseCaseRequest): Promise<SoftDeleteTechnicianUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			requesterId,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(isAdmin.value)
		}

		const technician = await this.techniciansRepository.findById(technicianId)

		if (!technician) {
			return left(new ResourceNotFoundError())
		}

		if (technician.deletedAt) {
			return left(new TechnicianAlreadyDeletedError())
		}

		technician.softDelete()

		return right({ technician })
	}
}
