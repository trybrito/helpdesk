import { TicketStatus } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface InteractionProps {
	ticketId: UniqueEntityId
	technicianId: UniqueEntityId
	status: Exclude<TicketStatus, TicketStatus.Open>
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

	set status(status: Exclude<TicketStatus, TicketStatus.Open>) {
		this.props.status = status
	}

	static create(
		props: Optional<InteractionProps, 'startedAt'>,
		id?: UniqueEntityId,
	) {
		const interaction = new Interaction(
			{
				...props,
				startedAt: props.startedAt ?? new Date(),
			},
			id,
		)

		return interaction
	}

	protected close() {
		if (this.closedAt) {
			throw new Error('Interação já foi encerrada')
		}

		this.props.closedAt = new Date()
	}

	isOpen() {
		return !this.closedAt
	}
}
