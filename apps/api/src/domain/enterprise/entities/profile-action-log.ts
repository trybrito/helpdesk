import { ProfileActionsLogs, Role } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface ProfileActionLogProps {
	actorEntityId: UniqueEntityId
	actorEntityRole: Role
	targetEntityId: UniqueEntityId
	targetEntityRole: Role
	action: ProfileActionsLogs
	createdAt: Date
}

export class ProfileActionLog extends Entity<ProfileActionLogProps> {
	get targetEntityRole() {
		return this.props.targetEntityRole
	}

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
		props: Optional<ProfileActionLogProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const actionLog = new ProfileActionLog(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return actionLog
	}
}
