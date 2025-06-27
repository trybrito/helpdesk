import { Either, left, right } from '@api/core/either'
import { Category } from '@api/domain/enterprise/entities/category'
import { AdminsRepository } from '../../../../repositories/admins-repository'
import { CategoriesRepository } from '../../../../repositories/categories-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface CreateCategoryUseCaseRequest {
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
	constructor(
		private adminsRepository: AdminsRepository,
		private categoriesRepository: CategoriesRepository,
	) {}

	async execute({
		createdBy,
		name,
	}: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			createdBy,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(isAdmin.value)
		}

		const { admin } = isAdmin.value

		const category = Category.create({
			createdBy: admin.id,
			name,
		})

		await this.categoriesRepository.create(category)

		return right({ category })
	}
}
