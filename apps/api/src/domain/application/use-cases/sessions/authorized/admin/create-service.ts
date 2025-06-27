import { Either, left, right } from '@api/core/either'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Service } from '@api/domain/enterprise/entities/service'
import { Money } from '@api/domain/enterprise/entities/value-objects/money'
import { AdminsRepository } from '../../../../repositories/admins-repository'
import { CategoriesRepository } from '../../../../repositories/categories-repository'
import { ServicesRepository } from '../../../../repositories/services-repository'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface CreateServiceUseCaseRequest {
	createdBy: string
	categoryId: string
	name: string
	price: string
}

export type CreateServiceUseCaseResponse = Either<
	ResourceNotFoundError,
	{ service: Service }
>

export class CreateServiceUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private categoriesRepository: CategoriesRepository,
		private servicesRepository: ServicesRepository,
	) {}

	async execute({
		createdBy,
		categoryId,
		name,
		price,
	}: CreateServiceUseCaseRequest): Promise<CreateServiceUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			createdBy,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(isAdmin.value)
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
