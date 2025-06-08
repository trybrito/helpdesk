import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface CategoryProps {
	createdBy: UniqueEntityId
	category: string
}

export class Category extends Entity<CategoryProps> {
	get createdBy() {
		return this.props.createdBy
	}

	get category() {
		return this.props.category
	}

	set category(category: string) {
		this.props.category = category
	}

	static create(props: CategoryProps, id?: UniqueEntityId) {
		const category = new Category(props, id)

		return category
	}
}
