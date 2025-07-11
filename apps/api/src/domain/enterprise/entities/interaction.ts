import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InteractionAlreadyClosedError } from '@api/domain/application/use-cases/errors/interaction-already-closed-error'
import { TicketStatus } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'

export interface InteractionProps {
	ticketId: UniqueEntityId
	technicianId: UniqueEntityId
	status: TicketStatus.BeingHandled
	startedAt: Date
	closedAt?: Date | null
}

export class Interaction extends Entity<InteractionProps> {
	get ticketId() {
		return this.props.ticketId
	}

	get technicianId() {
		return this.props.technicianId
	}

	get status() {
		return this.props.status
	}

	get startedAt() {
		return this.props.startedAt
	}

	get closedAt() {
		return this.props.closedAt
	}

	set status(status: TicketStatus.BeingHandled) {
		this.props.status = status
	}

	static create(
		props: Optional<InteractionProps, 'startedAt' | 'status'>,
		id?: UniqueEntityId,
	) {
		const interaction = new Interaction(
			{
				...props,
				startedAt: props.startedAt ?? new Date(),
				status: TicketStatus.BeingHandled,
			},
			id,
		)

		return interaction
	}

	close() {
		if (this.closedAt) {
			throw new InteractionAlreadyClosedError()
		}

		this.props.closedAt = new Date()
	}

	isOpen() {
		return !this.closedAt
	}
}
