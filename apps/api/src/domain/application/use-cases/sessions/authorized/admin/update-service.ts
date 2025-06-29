import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { ServicesRepository } from '@api/domain/application/repositories/services-repository'
import { Service } from '@api/domain/enterprise/entities/service'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface UpdateServiceUseCaseRequest {
	actorRole: Role
	targetId: string
	categoryId: string
	name: string
	price: string
}

export type UpdateServiceUseCaseResponse = Either<
	NotAllowedError | ResourceNotFoundError | InvalidInputDataError,
	{ service: Service }
>

export class UpdateServiceUseCase {
	constructor(private servicesRepository: ServicesRepository) {}

	async execute({
		actorRole,
		targetId,
		categoryId,
		name,
		price,
	}: UpdateServiceUseCaseRequest): Promise<UpdateServiceUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const service = await this.servicesRepository.findById(targetId)

		if (!service) {
			return left(new ResourceNotFoundError())
		}

		const resultOrError = await service.update({ categoryId, name, price })

		if (resultOrError.isLeft()) {
			return left(resultOrError.value)
		}

		const result = resultOrError.value
		const { updatedService } = result

		this.servicesRepository.update(updatedService)

		return right({ service: updatedService })
	}
}
