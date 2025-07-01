import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { User } from './user'
import { Email } from './value-objects/email'
import { PasswordTooShortError } from './value-objects/errors/password-too-short-error'
import { Password } from './value-objects/password'

export interface AdminProps {
	user: User
	lastUpdateLogId?: UniqueEntityId | null
	firstName: string
	lastName: string
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
	{ newAdmin: Admin }
>

export class Admin extends Entity<AdminProps> {
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

	set firstName(name: string) {
		this.props.firstName = name
	}

	set lastName(name: string) {
		this.props.lastName = name
	}

	static create(props: AdminProps, id?: UniqueEntityId) {
		const admin = new Admin(props, id)

		return admin
	}

	async updateProfile({
		user: { email, password, profileImageUrl },
		firstName,
		lastName,
	}: UpdateProfileRequest): Promise<UpdateProfileResponse> {
		const newEmailOrError = Email.create(email)

		if (newEmailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedNewEmail = newEmailOrError.value
		const passwordOrError = await Password.createFromPlainText(password)

		if (passwordOrError.isLeft()) {
			return left(passwordOrError.value)
		}

		const newPassword = passwordOrError.value

		this.props.user.email = validatedNewEmail
		this.props.user.password = newPassword
		this.props.user.profileImageUrl = profileImageUrl ?? null
		this.props.firstName = firstName
		this.props.lastName = lastName

		return right({ newAdmin: this })
	}
}
