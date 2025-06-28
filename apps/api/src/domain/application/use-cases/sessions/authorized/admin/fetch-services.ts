import { Either, left, right } from '@api/core/either'
import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { Service } from '@api/domain/enterprise/entities/service'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface FetchServicesUseCaseRequest {
	requesterId: string
	page: number
}

export type FetchServicesUseCaseResponse = Either<
	NotAllowedError,
	{ services: Service[] }
>

export class FetchServicesUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		requesterId,
		page,
	}: FetchServicesUseCaseRequest): Promise<FetchServicesUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			requesterId,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(new NotAllowedError())
		}

		const services = await this.servicesRepository.findMany({ page })

		return right({ services })
	}
}
