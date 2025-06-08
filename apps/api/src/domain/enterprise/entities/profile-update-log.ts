import { Role } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'

export interface ProfileUpdateLogProps {
	updatedEntityType: Role
	updatedEntityId: UniqueEntityId
	updatedBy: UniqueEntityId
	updatedByRole: Role
	createdAt: Date
}

export class ProfileUpdateLog extends Entity<ProfileUpdateLogProps> {
	get updatedEntityType() {
		return this.props.updatedEntityType
	}

	get updatedEntityId() {
		return this.props.updatedEntityId
	}

	get updatedBy() {
		return this.props.updatedBy
	}

	get updatedByRole() {
		return this.props.updatedByRole
	}

	get createdAt() {
		return this.props.createdAt
	}

	static create(
		props: Optional<ProfileUpdateLogProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const updateLog = new ProfileUpdateLog(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		return updateLog
	}
}
