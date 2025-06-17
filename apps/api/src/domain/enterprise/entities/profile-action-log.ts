import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { ProfileActionTypes, Role } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'

export interface ProfileActionLogProps {
	actorEntityId: UniqueEntityId
	actorEntityRole: Role
	targetEntityId: UniqueEntityId
	targetEntityRole: Role
	action: ProfileActionTypes
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
