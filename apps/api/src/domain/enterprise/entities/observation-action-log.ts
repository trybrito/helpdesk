import { ObservationLogsActions, Role } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface ObservationActionLogProps {
	actorEntityId: UniqueEntityId
	actorEntityRole: Role
	targetEntityId: UniqueEntityId
	action: ObservationLogsActions
	createdAt: Date
}

export class ObservationActionLog extends Entity<ObservationActionLogProps> {
	get targetEntityId() {
		return this.props.targetEntityId
	}

	get actorEntityId() {
		return this.props.actorEntityId
	}

	get actorEntityRole() {
		return this.props.actorEntityRole
	}

	get action() {
		return this.props.action
	}

	get createdAt() {
		return this.props.createdAt
	}

	static create(
		props: Optional<ObservationActionLogProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const updateLog = new ObservationActionLog(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return updateLog
	}
}
