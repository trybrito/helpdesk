import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export type CustomerProps = {
	userId: UniqueEntityId
	firstName: string
	lastName: string
}

export class Customer extends Entity<CustomerProps> {
	get firstName() {
		return this.props.firstName
	}

	get lastName() {
		return this.props.lastName
	}

	get userId() {
		return this.props.userId
	}

	set firstName(name: string) {
		this.props.firstName = name
	}

	set lastName(name: string) {
		this.props.lastName = name
	}

	static create(props: CustomerProps, id?: UniqueEntityId) {
		const customer = new Customer(props, id)

		return customer
	}
}
