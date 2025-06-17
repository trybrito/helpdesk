import { ProfileActionLogsRepository } from '@api/domain/application/repositories/logs/profile-action-logs-repository'
import { ProfileActionLog } from '@api/domain/enterprise/entities/profile-action-log'

export class InMemoryProfileActionLogsRepository
	implements ProfileActionLogsRepository
{
	public items: ProfileActionLog[] = []

	async create(actionLog: ProfileActionLog): Promise<void> {
		this.items.push(actionLog)
	}
}
