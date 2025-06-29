import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Category } from '@api/domain/enterprise/entities/category'
import { CategoriesRepository } from '../../../../repositories/categories-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface CreateCategoryUseCaseRequest {
	actorRole: Role
	createdBy: string
	name: string
}

export type CreateCategoryUseCaseResponse = Either<
	NotAllowedError,
	{
		category: Category
	}
>

export class CreateCategoryUseCase {
	constructor(private categoriesRepository: CategoriesRepository) {}

	async execute({
		actorRole,
		createdBy,
		name,
	}: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const category = Category.create({
			createdBy: new UniqueEntityId(createdBy),
			name,
		})

		await this.categoriesRepository.create(category)

		return right({ category })
	}
}
