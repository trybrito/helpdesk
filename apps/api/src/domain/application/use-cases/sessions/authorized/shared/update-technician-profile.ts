import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'

export interface UpdateTechnicianProfileUseCaseRequest {
	actorId: string
	actorRole: Role
	targetId: string
	user: {
		email: string
		password: string
	}
	firstName: string
	lastName: string
	scheduleAvailability: string[]
}

export type UpdateTechnicianProfileUseCaseResponse = Either<
	NotAllowedError | UserWithSameEmailError,
	{ technician: Technician }
>

export class UpdateTechnicianProfileUseCase {
	constructor(
		private techniciansRepository: TechniciansRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({
		actorId,
		actorRole,
		targetId,
		user,
		firstName,
		lastName,
		scheduleAvailability,
	}: UpdateTechnicianProfileUseCaseRequest): Promise<UpdateTechnicianProfileUseCaseResponse> {
		if (actorRole !== Role.Admin && actorRole !== Role.Technician) {
			return left(new NotAllowedError())
		}

		if (actorRole === Role.Technician && actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const userWithSameEmail = await this.usersRepository.findByEmail(user.email)

		if (userWithSameEmail) {
			return left(new UserWithSameEmailError())
		}

		const technician = await this.techniciansRepository.findById(targetId)

		if (!technician) {
			return left(new ResourceNotFoundError())
		}

		if (
			!technician.updatedAt &&
			user.password !== technician.user.password.getValue()
		) {
			technician.setMustUpdatePasswordToFalse()
		}

		const resultOrError = await technician.update({
			user,
			firstName,
			lastName,
			scheduleAvailability,
		})

		if (resultOrError.isLeft()) {
			return left(resultOrError.value)
		}

		const result = resultOrError.value
		const { newTechnician } = result

		await this.techniciansRepository.update(newTechnician)

		return right({ technician: newTechnician })
	}
}
