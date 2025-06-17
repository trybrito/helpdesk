import { ProfileActionTypes, Role } from 'apps/api/src/core/@types/enums'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'
import { ProfileActionLog } from '../../enterprise/entities/profile-action-log'
import { ProfileActionLogsRepository } from '../repositories/logs/profile-action-logs-repository'

export interface CreateProfileActionLogUseCaseRequest {
	actorEntityId: string
	actorEntityRole: Role
	targetEntityId: string
	targetEntityRole: Role
	action: ProfileActionTypes
}

export interface CreateProfileActionLogUseCaseResponse {
	actionLog: ProfileActionLog
}

export class CreateProfileActionLogUseCase {
	constructor(
		private profileActionLogsRepository: ProfileActionLogsRepository,
	) {}

	async execute({
		actorEntityId,
		actorEntityRole,
		targetEntityId,
		targetEntityRole,
		action,
	}: CreateProfileActionLogUseCaseRequest): Promise<CreateProfileActionLogUseCaseResponse> {
		const profileActionLog = ProfileActionLog.create({
			actorEntityId: new UniqueEntityId(actorEntityId),
			actorEntityRole: actorEntityRole,
			targetEntityId: new UniqueEntityId(targetEntityId),
			targetEntityRole: targetEntityRole,
			action: action,
		})

		await this.profileActionLogsRepository.create(profileActionLog)

		return { actionLog: profileActionLog }
	}
}
