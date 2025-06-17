import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { User } from './user'

export interface AdminProps {
	user: User
	lastUpdateLogId?: UniqueEntityId | null
	firstName: string
	lastName: string
}

export class Admin extends Entity<AdminProps> {
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

	static create(props: AdminProps, id?: UniqueEntityId) {
		const admin = new Admin(props, id)

		return admin
	}
}
