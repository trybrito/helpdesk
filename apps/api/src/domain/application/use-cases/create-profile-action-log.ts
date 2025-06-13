import { ProfileActionsLogs, Role } from 'apps/api/src/core/@types/enums'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'
import { ProfileActionLog } from '../../enterprise/entities/profile-action-log'

export interface CreateProfileLogUseCaseRequest {
	actorEntityId: string
	actorEntityRole: Role
	targetEntityId: string
	targetEntityRole: Role
}

export interface CreateProfileLogUseCaseResponse {
	id: string
}

export class CreateProfileLogUseCase {
	async execute({
		actorEntityId,
		actorEntityRole,
		targetEntityId,
		targetEntityRole,
	}: CreateProfileLogUseCaseRequest): Promise<CreateProfileLogUseCaseResponse> {
		const ACTION = ProfileActionsLogs.Create

		const profileActionLog = ProfileActionLog.create({
			actorEntityId: new UniqueEntityId(actorEntityId),
			actorEntityRole: actorEntityRole,
			targetEntityId: new UniqueEntityId(targetEntityId),
			targetEntityRole: targetEntityRole,
			action: ACTION,
		})

		return { id: profileActionLog.id.toString() }
	}
}
