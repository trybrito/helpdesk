import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { Service } from '@api/domain/enterprise/entities/service'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface FetchServicesUseCaseRequest {
	actorRole: Role
	page: number
}

export type FetchServicesUseCaseResponse = Either<
	NotAllowedError,
	{ services: Service[] }
>

export class FetchServicesUseCase {
	constructor(private servicesRepository: ServicesRepository) {}

	async execute({
		actorRole,
		page,
	}: FetchServicesUseCaseRequest): Promise<FetchServicesUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const services = await this.servicesRepository.findMany({ page })

		return right({ services })
	}
}
