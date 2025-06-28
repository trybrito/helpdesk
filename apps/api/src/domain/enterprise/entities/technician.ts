import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { User } from './user'

export interface TechnicianProps {
	lastUpdateLogId?: UniqueEntityId | null
	user: User
	firstName: string
	lastName: string
	mustUpdatePassword: boolean
	scheduleAvailability: string[]
	deletedAt?: Date | null
}

export class Technician extends Entity<TechnicianProps> {
	get firstName() {
		return this.props.firstName
	}

	get user() {
		return this.props.user
	}

	get lastName() {
		return this.props.lastName
	}

	get lastUpdateLogId() {
		return this.props.lastUpdateLogId ?? null
	}

	get mustUpdatePassword() {
		return this.props.mustUpdatePassword
	}

	get scheduleAvailability() {
		return this.props.scheduleAvailability
	}

	get deletedAt() {
		return this.props.deletedAt
	}

	set firstName(name: string) {
		this.props.firstName = name
	}

	set lastName(name: string) {
		this.props.lastName = name
	}

	set scheduleAvailability(availability: string[]) {
		this.props.scheduleAvailability = availability
	}

	static create(props: TechnicianProps, id?: UniqueEntityId) {
		const technician = new Technician(props, id)

		return technician
	}

	softDelete() {
		this.props.deletedAt = new Date()
	}
}
