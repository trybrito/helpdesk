import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { ResourceAlreadyDeletedError } from '@api/domain/application/use-cases/errors/resource-already-deleted-error'
import { User } from './user'
import { Email } from './value-objects/email'
import { PasswordTooShortError } from './value-objects/errors/password-too-short-error'
import { Password } from './value-objects/password'

export type CustomerProps = {
	user: User
	lastUpdateLogId?: UniqueEntityId | null
	firstName: string
	lastName: string
	deletedAt?: Date | null
}

type UpdateProfileRequest = {
	user: {
		email: string
		password: string
		profileImageUrl?: string | null
	}
	firstName: string
	lastName: string
}

type UpdateProfileResponse = Either<
	InvalidInputDataError | PasswordTooShortError,
	{ newCustomer: Customer }
>

export class Customer extends Entity<CustomerProps> {
	get user() {
		return this.props.user
	}

	get lastUpdateLogId() {
		return this.props.lastUpdateLogId
	}

	get firstName() {
		return this.props.firstName
	}

	get lastName() {
		return this.props.lastName
	}

	get deletedAt() {
		return this.props.deletedAt
	}

	static create(props: CustomerProps, id?: UniqueEntityId) {
		const customer = new Customer(props, id)

		return customer
	}

	async updateProfile({
		user: { email, password, profileImageUrl },
		firstName,
		lastName,
	}: UpdateProfileRequest): Promise<UpdateProfileResponse> {
		const emailOrError = Email.create(email)

		if (emailOrError.isLeft()) {
			return left(emailOrError.value)
		}

		const validatedEmail = emailOrError.value
		const passwordOrError = await Password.createFromPlainText(password)

		if (passwordOrError.isLeft()) {
			return left(passwordOrError.value)
		}

		const validatedPassword = passwordOrError.value

		this.props.user.email = validatedEmail
		this.props.user.password = validatedPassword
		this.props.user.profileImageUrl = profileImageUrl ?? null
		this.props.firstName = firstName
		this.props.lastName = lastName

		return right({ newCustomer: this })
	}

	softDelete() {
		if (this.props.deletedAt) {
			throw new ResourceAlreadyDeletedError()
		}

		this.props.deletedAt = new Date()
	}
}
