import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Service } from '@api/domain/enterprise/entities/service'
import { Money } from '@api/domain/enterprise/entities/value-objects/money'
import { CategoriesRepository } from '../../../../repositories/categories-repository'
import { ServicesRepository } from '../../../../repositories/services-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface CreateServiceUseCaseRequest {
	actorRole: Role
	createdBy: string
	categoryId: string
	name: string
	price: string
}

export type CreateServiceUseCaseResponse = Either<
	ResourceNotFoundError | NotAllowedError,
	{ service: Service }
>

export class CreateServiceUseCase {
	constructor(
		private categoriesRepository: CategoriesRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		actorRole,
		createdBy,
		categoryId,
		name,
		price,
	}: CreateServiceUseCaseRequest): Promise<CreateServiceUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const category = await this.categoriesRepository.findById(categoryId)

		if (!category) {
			return left(new ResourceNotFoundError())
		}

		const priceOrError = Money.create(price, true)

		if (priceOrError.isLeft()) {
			return left(new InvalidInputDataError([price]))
		}

		const validatedPrice = priceOrError.value

		const service = Service.create({
			createdBy: new UniqueEntityId(createdBy),
			categoryId: new UniqueEntityId(categoryId),
			name,
			price: validatedPrice,
		})

		await this.servicesRepository.create(service)

		return right({ service })
	}
}
