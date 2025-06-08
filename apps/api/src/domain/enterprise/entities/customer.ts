import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export type CustomerProps = {
	userId: UniqueEntityId
	lastUpdateLogId: UniqueEntityId
	firstName: string
	lastName: string
}

export class Customer extends Entity<CustomerProps> {
	get userId() {
		return this.props.userId
	}

	get lastUpdateLogId() {
		return this.props.lastUpdateLogId
	}

	get firstName() {
		return this.props.firstName
	}

	get lastName() {
		return this.props.lastName
	}

	set firstName(name: string) {
		this.props.firstName = name
	}

	set lastName(name: string) {
		this.props.lastName = name
	}

	set lastUpdateLogId(id: UniqueEntityId) {
		this.props.lastUpdateLogId = id
	}

	static create(props: CustomerProps, id?: UniqueEntityId) {
		const customer = new Customer(props, id)

		return customer
	}
}
