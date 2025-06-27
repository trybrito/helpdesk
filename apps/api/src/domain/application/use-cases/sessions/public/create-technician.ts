import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Role } from 'apps/api/src/core/@types/enums'
import { Technician } from '../../../../enterprise/entities/technician'
import { User } from '../../../../enterprise/entities/user'
import { Email } from '../../../../enterprise/entities/value-objects/email'
import { Password } from '../../../../enterprise/entities/value-objects/password'
import { TechniciansRepository } from '../../../repositories/technicians-repository'
import { UserWithSameEmailError } from '../../errors/user-with-same-email-error'

export interface CreateTechnicianUseCaseRequest {
	user: {
		email: string
		password: string
	}
	firstName: string
	lastName: string
	scheduleAvailability: string[]
}

export type CreateTechnicianUseCaseResponse = Either<
	InvalidInputDataError | UserWithSameEmailError,
	{
		technician: Technician
	}
>

export class CreateTechnicianUseCase {
	constructor(private techniciansRepository: TechniciansRepository) {}

	async execute({
		user: { email, password },
		firstName,
		lastName,
		scheduleAvailability,
	}: CreateTechnicianUseCaseRequest): Promise<CreateTechnicianUseCaseResponse> {
		const MUST_UPDATE_PASSWORD = true

		const emailOrError = Email.create(email)

		if (emailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedEmail = emailOrError.value

		const userWithSameEmail = await this.techniciansRepository.findByEmail(
			validatedEmail.getValue(),
		)

		if (userWithSameEmail) {
			return left(new UserWithSameEmailError())
		}

		const user = new User({
			email: validatedEmail,
			password: await Password.createFromPlainText(password),
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
