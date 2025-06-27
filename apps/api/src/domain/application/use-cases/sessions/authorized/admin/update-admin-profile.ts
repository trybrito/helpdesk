import { Either, left, right } from '@api/core/either'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { AdminsRepository } from '../../../../repositories/admins-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface UpdateAdminProfileUseCaseRequest {
	requesterId: string
	adminId: string
	user: {
		email: string
		password: string
		profileImageUrl?: string | null
	}
	firstName: string
	lastName: string
}

export type UpdateAdminProfileUseCaseResponse = Either<
	NotAllowedError | UserWithSameEmailError,
	{ admin: Admin }
>

export class UpdateAdminProfileUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		requesterId,
		adminId,
		user,
		firstName,
		lastName,
	}: UpdateAdminProfileUseCaseRequest): Promise<UpdateAdminProfileUseCaseResponse> {
		if (requesterId !== adminId) {
			return left(new NotAllowedError())
		}

		const isAdmin = await verifyAdminPermission(adminId, this.adminsRepository)

		if (isAdmin.isLeft()) {
			return left(isAdmin.value)
		}

		const { admin } = isAdmin.value

		const userWithSameEmail = await this.usersRepository.findByEmail(user.email)

		if (userWithSameEmail && userWithSameEmail.id.toString() !== requesterId) {
			return left(new UserWithSameEmailError())
		}

		const result = await admin.updateProfile({ user, firstName, lastName })

		if (result.isLeft()) {
			return left(result.value)
		}

		const { newAdmin } = result.value

		await this.adminsRepository.update(newAdmin)

		return right({ admin })
	}
}
