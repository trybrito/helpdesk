import { ProfileActionTypes } from '@api/core/@types/enums'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { InMemoryProfileActionLogsRepository } from 'apps/api/test/repositories/logs/in-memory-profile-action-logs-repository'
import { CreateProfileActionLogUseCase } from './create-profile-action-log'

let inMemoryProfileActionLogsRepository: InMemoryProfileActionLogsRepository
let sut: CreateProfileActionLogUseCase

describe('Create profile action log', () => {
	beforeEach(() => {
		inMemoryProfileActionLogsRepository =
			new InMemoryProfileActionLogsRepository()
		sut = new CreateProfileActionLogUseCase(inMemoryProfileActionLogsRepository)
	})

	it('should be able to create a profile action (create) log', async () => {
		const actor = await makeAdmin()
		const entity = await makeTechnician()

		const { actionLog } = await sut.execute({
			actorEntityId: actor.id.toString(),
			actorEntityRole: actor.user.role,
			targetEntityId: entity.id.toString(),
			targetEntityRole: entity.user.role,
			action: ProfileActionTypes.Create,
		})

		expect(inMemoryProfileActionLogsRepository.items[0]).toEqual(actionLog)
		expect(inMemoryProfileActionLogsRepository.items[0].action).toEqual(
			'create',
		)
	})

	it('should be able to create a profile action (update) log', async () => {
		const actor = await makeAdmin()
		const entity = await makeTechnician()

		const { actionLog } = await sut.execute({
			actorEntityId: actor.id.toString(),
			actorEntityRole: actor.user.role,
			targetEntityId: entity.id.toString(),
			targetEntityRole: entity.user.role,
			action: ProfileActionTypes.Update,
		})

		expect(inMemoryProfileActionLogsRepository.items[0]).toEqual(actionLog)
		expect(inMemoryProfileActionLogsRepository.items[0].action).toEqual(
			'update',
		)
	})
})
