import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { User } from './user'

export type CustomerProps = {
	user: User
	lastUpdateLogId?: UniqueEntityId | null
	firstName: string
	lastName: string
}

export class Customer extends Entity<CustomerProps> {
	get user() {
		return this.props.user
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

	static create(props: CustomerProps, id?: UniqueEntityId) {
		const customer = new Customer(props, id)

		return customer
	}
}
