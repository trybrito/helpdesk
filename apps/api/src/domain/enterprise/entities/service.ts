import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Money } from './value-objects/money'

export interface ServiceProps {
	createdBy: UniqueEntityId
	categoryId: UniqueEntityId // verify
	name: string
	price: Money
	updatedAt?: Date | null
	deletedAt?: Date | null
}

export class Service extends Entity<ServiceProps> {
	get createdBy() {
		return this.props.createdBy
	}

	get categoryId() {
		return this.props.categoryId
	}

	get name() {
		return this.props.name
	}

	get price() {
		return this.props.price.getValue()
	}

	get updatedAt() {
		return this.props.updatedAt ?? null
	}

	get deletedAt() {
		return this.props.deletedAt ?? null
	}

	set name(name: string) {
		this.props.name = name
		this.touch()
	}

	public changePrice(price: number) {
		this.props.price = Money.create(price)
		this.touch()
	}

	protected softDelete() {
		this.props.deletedAt = new Date()
		this.touch()
	}

	private touch() {
		this.props.updatedAt = new Date()
	}

	static create(props: ServiceProps, id?: UniqueEntityId) {
		const name = new Service(props, id)

		return name
	}
}
