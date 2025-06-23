import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'

export interface CategoryProps {
	createdBy: UniqueEntityId
	name: string
}

export class Category extends Entity<CategoryProps> {
	get createdBy() {
		return this.props.createdBy
	}

	get name() {
		return this.props.name
	}

	set name(name: string) {
		this.props.name = name
	}

	static create(props: CategoryProps, id?: UniqueEntityId) {
		const name = new Category(props, id)

		return name
	}
}
