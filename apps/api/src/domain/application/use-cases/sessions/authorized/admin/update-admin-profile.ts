import { Either, left, right } from '@api/core/either'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { AdminsRepository } from '../../../../repositories/admins-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'

export interface UpdateAdminProfileUseCaseRequest {
	actorId: string
	targetId: string
	user: {
		email: string
		password: string
		profileImageUrl?: string | null
	}
	firstName: string
	lastName: string
}

export type UpdateAdminProfileUseCaseResponse = Either<
	NotAllowedError | UserWithSameEmailError | ResourceNotFoundError,
	{ admin: Admin }
>

export class UpdateAdminProfileUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		actorId,
		targetId,
		user,
		firstName,
		lastName,
	}: UpdateAdminProfileUseCaseRequest): Promise<UpdateAdminProfileUseCaseResponse> {
		if (actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const admin = await this.adminsRepository.findById(actorId)

		if (!admin) {
			return left(new ResourceNotFoundError())
		}

		const userWithSameEmail = await this.usersRepository.findByEmail(user.email)

		if (userWithSameEmail && userWithSameEmail.id.toString() !== actorId) {
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
