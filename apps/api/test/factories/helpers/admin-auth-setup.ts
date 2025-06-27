import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InMemoryAdminsRepository } from '../../repositories/in-memory-admins-repository'
import { makeAdmin } from '../make-admin'

export async function adminAuthSetup(adminId: string) {
	const admin = await makeAdmin({}, new UniqueEntityId(adminId))
	const adminsRepository = new InMemoryAdminsRepository([admin])

	return { admin, adminsRepository }
}
