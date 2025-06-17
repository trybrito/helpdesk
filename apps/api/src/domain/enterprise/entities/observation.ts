import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Optional } from 'apps/api/src/core/@types/optional'

export interface ObservationProps {
	ticketId: UniqueEntityId
	lastActionLogId: UniqueEntityId
	content: string
	createdAt: Date
	updatedAt?: Date | null
}

export class Observation extends Entity<ObservationProps> {
	get ticketId() {
		return this.props.ticketId
	}

	get lastActionLogId() {
		return this.props.lastActionLogId
	}

	get content() {
		return this.props.content
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	set content(content: string) {
		this.props.content = content
		this.touch()
	}

	set lastActionLogId(id: UniqueEntityId) {
		this.props.lastActionLogId = id
		this.touch()
	}

	touch() {
		this.props.updatedAt = new Date()
	}

	static create(
		props: Optional<ObservationProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const observation = new Observation(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return observation
	}
}
