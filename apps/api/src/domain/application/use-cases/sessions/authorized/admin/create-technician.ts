import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Role } from 'apps/api/src/core/@types/enums'
import { Technician } from '../../../../../enterprise/entities/technician'
import { User } from '../../../../../enterprise/entities/user'
import { Email } from '../../../../../enterprise/entities/value-objects/email'
import { Password } from '../../../../../enterprise/entities/value-objects/password'
import { TechniciansRepository } from '../../../../repositories/technicians-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'
import { verifyAdminPermission } from '../../../utils/verify-admin-permission'

export interface CreateTechnicianUseCaseRequest {
	requesterId: string
	user: {
		email: string
		password: string
	}
	firstName: string
	lastName: string
	scheduleAvailability: string[]
}

export type CreateTechnicianUseCaseResponse = Either<
	InvalidInputDataError | UserWithSameEmailError | NotAllowedError,
	{
		technician: Technician
	}
>

export class CreateTechnicianUseCase {
	constructor(
		private adminsRepository: AdminsRepository,
		private usersRepository: UsersRepository,
		private techniciansRepository: TechniciansRepository,
	) {}

	async execute({
		requesterId,
		user: { email, password },
		firstName,
		lastName,
		scheduleAvailability,
	}: CreateTechnicianUseCaseRequest): Promise<CreateTechnicianUseCaseResponse> {
		const isAdmin = await verifyAdminPermission(
			requesterId,
			this.adminsRepository,
		)

		if (isAdmin.isLeft()) {
			return left(new NotAllowedError())
		}

		const MUST_UPDATE_PASSWORD = true

		const emailOrError = Email.create(email)

		if (emailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedEmail = emailOrError.value

		const userWithSameEmail = await this.usersRepository.findByEmail(
			validatedEmail.getValue(),
		)

		if (userWithSameEmail) {
			return left(new UserWithSameEmailError())
		}

		const passwordOrError = await Password.createFromPlainText(password)

		if (passwordOrError.isLeft()) {
			return left(new InvalidInputDataError([password]))
		}

		const validatedPassword = passwordOrError.value

		const user = new User({
			email: validatedEmail,
			password: validatedPassword,
			role: Role.Technician,
		})

		const technician = new Technician({
			firstName,
			lastName,
			user,
			mustUpdatePassword: MUST_UPDATE_PASSWORD,
			scheduleAvailability,
		})

		await this.techniciansRepository.create(technician)

		return right({ technician })
	}
}
