import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	TicketAssignmentStatus,
	TicketStatus,
} from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'

export interface TicketProps {
	technicianId: UniqueEntityId
	costumerId: UniqueEntityId
	description: string
	status: TicketStatus
	assignmentStatus: TicketAssignmentStatus
	createdAt: Date
	updatedAt?: Date | null
}

export class Ticket extends Entity<TicketProps> {
	get technicianId() {
		return this.props.technicianId
	}

	get costumerId() {
		return this.props.costumerId
	}

	get description() {
		return this.props.description
	}

	get status() {
		return this.props.status
	}

	get assignmentStatus() {
		return this.props.assignmentStatus
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	set description(description: string) {
		this.props.description = description
		this.touch()
	}

	set status(status: TicketStatus) {
		this.props.status = status
		this.touch()
	}

	set assignmentStatus(assignmentStatus: TicketAssignmentStatus) {
		this.props.assignmentStatus = assignmentStatus
		this.touch()
	}

	touch() {
		this.props.updatedAt = new Date()
	}

	static create(
		props: Optional<TicketProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const ticket = new Ticket(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return ticket
	}
}
