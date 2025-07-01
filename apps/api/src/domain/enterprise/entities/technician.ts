import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { User } from './user'
import { Email } from './value-objects/email'
import { PasswordTooShortError } from './value-objects/errors/password-too-short-error'
import { Password } from './value-objects/password'

export interface TechnicianProps {
	lastUpdateLogId?: UniqueEntityId | null
	user: User
	firstName: string
	lastName: string
	mustUpdatePassword: boolean
	scheduleAvailability: string[]
	updatedAt?: Date | null
	deletedAt?: Date | null
}

type UpdateProfileRequest = {
	user: {
		email: string
		password: string
	}
	firstName: string
	lastName: string
	scheduleAvailability: string[]
}

type UpdateProfileResponse = Either<
	InvalidInputDataError | PasswordTooShortError,
	{ newTechnician: Technician }
>

export class Technician extends Entity<TechnicianProps> {
	get firstName() {
		return this.props.firstName
	}

	get user() {
		return this.props.user
	}

	get lastName() {
		return this.props.lastName
	}

	get lastUpdateLogId() {
		return this.props.lastUpdateLogId ?? null
	}

	get mustUpdatePassword() {
		return this.props.mustUpdatePassword
	}

	get scheduleAvailability() {
		return this.props.scheduleAvailability
	}

	get deletedAt() {
		return this.props.deletedAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	static create(props: TechnicianProps, id?: UniqueEntityId) {
		const technician = new Technician(props, id)

		return technician
	}

	setMustUpdatePasswordToFalse() {
		this.props.mustUpdatePassword = false
	}

	touch() {
		this.props.updatedAt = new Date()
	}

	softDelete() {
		this.props.deletedAt = new Date()
		this.touch()
	}

	async updateProfile({
		user: { email, password },
		firstName,
		lastName,
		scheduleAvailability,
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
		this.props.firstName = firstName
		this.props.lastName = lastName
		this.props.scheduleAvailability = scheduleAvailability

		this.touch()

		return right({ newTechnician: this })
	}
}
