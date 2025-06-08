import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface AdminProps {
	userId: string
	firstName: string
	lastName: string
}

export class Admin extends Entity<AdminProps> {
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

	static create(props: AdminProps, id?: UniqueEntityId) {
		const admin = new Admin(props, id)

		return admin
	}
}
