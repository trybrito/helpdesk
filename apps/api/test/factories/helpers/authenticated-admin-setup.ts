import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { AdminProps } from '@api/domain/enterprise/entities/admin'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { InMemoryAdminsRepository } from '../../repositories/in-memory-admins-repository'
import { makeAdmin } from '../make-admin'

export async function authenticatedAdminSetup(
	adminId: string,
	overrides?: {
		user?: Partial<UserProps>
		admin?: Partial<AdminProps>
	},
) {
	const admin = await makeAdmin({ ...overrides }, new UniqueEntityId(adminId))
	const adminsRepository = new InMemoryAdminsRepository([admin])

	return { admin, adminsRepository }
}
