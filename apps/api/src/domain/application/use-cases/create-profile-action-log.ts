import { ProfileActionsLogs, Role } from 'apps/api/src/core/@types/enums'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'
import { ProfileActionLog } from '../../enterprise/entities/profile-action-log'
import { ProfileActionLogsRepository } from '../repositories/logs/profile-action-logs-repository'

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
	constructor(
		private profileActionLogsRepository: ProfileActionLogsRepository,
	) {}

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

		await this.profileActionLogsRepository.create(profileActionLog)

		return { id: profileActionLog.id.toString() }
	}
}
