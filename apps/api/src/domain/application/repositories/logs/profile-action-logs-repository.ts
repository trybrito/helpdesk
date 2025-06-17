import { ProfileActionLog } from '../../../enterprise/entities/profile-action-log'

export abstract class ProfileActionLogsRepository {
	abstract create(actionLog: ProfileActionLog): Promise<void>
}
