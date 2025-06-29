import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { TechnicianAlreadyDeletedError } from '../../../errors/technician-already-deleted-error'

export interface SoftDeleteTechnicianUseCaseRequest {
	actorRole: Role
	technicianId: string
}

export type SoftDeleteTechnicianUseCaseResponse = Either<
	NotAllowedError,
	{ technician: Technician }
>

export class SoftDeleteTechnicianUseCase {
	constructor(private techniciansRepository: TechniciansRepository) {}

	async execute({
		actorRole,
		technicianId,
	}: SoftDeleteTechnicianUseCaseRequest): Promise<SoftDeleteTechnicianUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
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
