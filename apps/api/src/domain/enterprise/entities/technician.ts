import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'
import { User } from './user'

export interface TechnicianProps {
	lastUpdateLogId?: UniqueEntityId | null
	user: User
	firstName: string
	lastName: string
	mustUpdatePassword: boolean
	scheduleAvailability: string[]
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
}
