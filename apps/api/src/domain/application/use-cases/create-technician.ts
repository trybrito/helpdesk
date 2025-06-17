import { Either, right } from '@api/core/either'
import { Role } from 'apps/api/src/core/@types/enums'
import { Technician } from '../../enterprise/entities/technician'
import { User } from '../../enterprise/entities/user'
import { Email } from '../../enterprise/entities/value-objects/email'
import { Password } from '../../enterprise/entities/value-objects/password'
import { TechniciansRepository } from '../repositories/technicians-repository'

export interface CreateTechnicianUseCaseRequest {
	firstName: string
	lastName: string
	email: string
	password: string
	scheduleAvailability: string[]
}

export type CreateTechnicianUseCaseResponse = Either<
	never,
	{
		technician: Technician
	}
>

export class CreateTechnicianUseCase {
	constructor(private technicians: TechniciansRepository) {}

	async execute({
		firstName,
		lastName,
		email,
		password,
		scheduleAvailability,
	}: CreateTechnicianUseCaseRequest): Promise<CreateTechnicianUseCaseResponse> {
		const MUST_UPDATE_PASSWORD = true

		const user = new User({
			email: Email.create(email),
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

		await this.technicians.create(technician)

		return right({ technician })
	}
}
