import { Either, left, right } from '@api/core/either'
import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface FetchTechniciansUseCaseRequest {
	requesterId: string
	page: number
}

export type FetchTechniciansUseCaseResponse = Either<
	NotAllowedError,
	{ technicians: Technician[] }
>

export class FetchTechniciansUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private techniciansRepository: TechniciansRepository,
	) {}

	async execute({
		requesterId,
		page,
	}: FetchTechniciansUseCaseRequest): Promise<FetchTechniciansUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			requesterId,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(new NotAllowedError())
		}

		const technicians = await this.techniciansRepository.findMany({ page })

		return right({ technicians })
	}
}
