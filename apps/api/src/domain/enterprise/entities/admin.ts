import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface AdminProps {
	userId: UniqueEntityId
	lastUpdateLogId: UniqueEntityId
	firstName: string
	lastName: string
}

export class Admin extends Entity<AdminProps> {
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

	static create(props: AdminProps, id?: UniqueEntityId) {
		const admin = new Admin(props, id)

		return admin
	}
}
