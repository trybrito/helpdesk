import { CategoriesRepository } from '@api/domain/application/repositories/categories-repository'
import { Category } from '@api/domain/enterprise/entities/category'

export class InMemoryCategoriesRepository implements CategoriesRepository {
	public items: Category[] = []

	async create(category: Category): Promise<void> {
		this.items.push(category)
	}
}
