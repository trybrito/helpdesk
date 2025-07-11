import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { TicketStatusCannotBeChangedWhenClosedError } from '@api/domain/application/use-cases/errors/ticket-status-cannot-be-changed-when-closed-error.ts'
import {
	TicketAssignmentStatus,
	TicketStatus,
} from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { Category } from './category'
import { Observation } from './observation'
import { Service } from './service'

export interface TicketProps {
	technicianId?: UniqueEntityId | null
	customerId: UniqueEntityId
	description: string
	category: Category
	services: Service[]
	observations: Observation[]
	status: TicketStatus
	assignmentStatus: TicketAssignmentStatus
	createdAt: Date
	updatedAt?: Date | null
}

export class Ticket extends Entity<TicketProps> {
	get technicianId() {
		return this.props.technicianId
	}

	get customerId() {
		return this.props.customerId
	}

	get description() {
		return this.props.description
	}

	get services() {
		return this.props.services
	}

	get observations() {
		return this.props.observations
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

	changeTicketStatus() {
		switch (this.props.status) {
			case TicketStatus.Open:
				this.props.status = TicketStatus.BeingHandled
				break
			case TicketStatus.BeingHandled:
				this.props.status = TicketStatus.Closed
				break
			default:
				throw new TicketStatusCannotBeChangedWhenClosedError()
		}
	}

	static create(
		props: Optional<TicketProps, 'createdAt' | 'observations'>,
		id?: UniqueEntityId,
	) {
		const ticket = new Ticket(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
				observations: props.observations ?? [],
			},
			id,
		)

		return ticket
	}
}
