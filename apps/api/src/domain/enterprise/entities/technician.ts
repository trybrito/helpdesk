import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface TechnicianProps {
	createdBy: string
	userId: string
	firstName: string
	lastName: string
	mustUpdatePassword: boolean
}

export class Technician extends Entity<TechnicianProps> {
	get firstName() {
		return this.props.firstName
	}

	get lastName() {
		return this.props.lastName
	}

	get userId() {
		return this.props.userId
	}

	get createdBy() {
		return this.props.createdBy
	}

	get mustUpdatePassword() {
		return this.props.mustUpdatePassword
	}

	set firstName(name: string) {
		this.props.firstName = name
	}

	set lastName(name: string) {
		this.props.lastName = name
	}

	static create(props: TechnicianProps, id?: UniqueEntityId) {
		const technician = new Technician(props, id)

		return technician
	}
}
