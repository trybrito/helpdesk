import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface FetchTechniciansUseCaseRequest {
	actorRole: Role
	page: number
}

export type FetchTechniciansUseCaseResponse = Either<
	NotAllowedError,
	{ technicians: Technician[] }
>

export class FetchTechniciansUseCase {
	constructor(private techniciansRepository: TechniciansRepository) {}

	async execute({
		actorRole,
		page,
	}: FetchTechniciansUseCaseRequest): Promise<FetchTechniciansUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const technicians = await this.techniciansRepository.findMany({ page })

		return right({ technicians })
	}
}
