import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'

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
