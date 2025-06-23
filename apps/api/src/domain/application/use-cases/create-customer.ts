import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { User } from '@api/domain/enterprise/entities/user'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { CustomersRepository } from '../repositories/customers-repository'

export interface CreateCustomerUseCaseRequest {
	firstName: string
	lastName: string
	email: string
	password: string
}

export type CreateCustomerUseCaseResponse = Either<
	InvalidInputDataError,
	{
		customer: Customer
	}
>

export class CreateCustomerUseCase {
	constructor(private customersRepository: CustomersRepository) {}

	async execute({
		firstName,
		lastName,
		email,
		password,
	}: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
		const emailOrError = Email.create(email)

		if (emailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedEmail = emailOrError.value

		const user = new User({
			email: validatedEmail,
			password: await Password.createFromPlainText(password),
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
