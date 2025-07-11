import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { User } from '@api/domain/enterprise/entities/user'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { CustomersRepository } from '../../../repositories/customers-repository'
import { UserWithSameEmailError } from '../../errors/user-with-same-email-error'

export interface CreateCustomerUseCaseRequest {
	user: {
		email: string
		password: string
	}
	firstName: string
	lastName: string
}

export type CreateCustomerUseCaseResponse = Either<
	InvalidInputDataError | UserWithSameEmailError,
	{
		customer: Customer
	}
>

export class CreateCustomerUseCase {
	constructor(private customersRepository: CustomersRepository) {}

	async execute({
		user: { email, password },
		firstName,
		lastName,
	}: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
		const emailOrError = Email.create(email)

		if (emailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedEmail = emailOrError.value

		const userWithSameEmail = await this.customersRepository.findByEmail(
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
			role: Role.Customer,
		})

		const customer = new Customer({
			firstName,
			lastName,
			user,
		})

		await this.customersRepository.create(customer)

		return right({ customer })
	}
}
