import { Either, left, right } from '@api/core/either'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { AdminsRepository } from '../../repositories/admins-repository'
import { NotAllowedError } from '../errors/not-allowed-error'

type VerifyAdminPermissionResponse = Either<NotAllowedError, { admin: Admin }>

export async function verifyAdminPermission(
	userId: string,
	adminsRepository: AdminsRepository,
): Promise<VerifyAdminPermissionResponse> {
	const admin = await adminsRepository.findById(userId)

	if (!admin) {
		return left(new NotAllowedError())
	}

	return right({ admin })
}
