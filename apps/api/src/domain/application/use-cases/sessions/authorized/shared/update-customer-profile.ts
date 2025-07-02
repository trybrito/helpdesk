import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { UserWithSameEmailError } from '../../../errors/user-with-same-email-error'

export interface UpdateCustomerProfileUseCaseRequest {
	actorId: string
	actorRole: Role
	targetId: string
	user: {
		email: string
		password: string
		profileImageUrl?: string | null
	}
	firstName: string
	lastName: string
}

export type UpdateCustomerProfileUseCaseResponse = Either<
	NotAllowedError | UserWithSameEmailError | ResourceNotFoundError,
	{ customer: Customer }
>

export class UpdateCustomerProfileUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private customersRepository: CustomersRepository,
	) {}

	async execute({
		actorId,
		actorRole,
		targetId,
		user,
		firstName,
		lastName,
	}: UpdateCustomerProfileUseCaseRequest): Promise<UpdateCustomerProfileUseCaseResponse> {
		if (actorRole !== Role.Admin && actorRole !== Role.Customer) {
			return left(new NotAllowedError())
		}

		if (actorRole === Role.Customer && actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const userWithSameEmail = await this.usersRepository.findByEmail(user.email)

		if (userWithSameEmail) {
			return left(new UserWithSameEmailError())
		}

		const customer = await this.customersRepository.findById(targetId)

		if (!customer) {
			return left(new ResourceNotFoundError())
		}

		const resultOrError = await customer.updateProfile({
			user,
			firstName,
			lastName,
		})

		if (resultOrError.isLeft()) {
			return left(resultOrError.value)
		}

		const result = resultOrError.value
		const { newCustomer } = result

		await this.customersRepository.update(newCustomer)

		return right({ customer: newCustomer })
	}
}
