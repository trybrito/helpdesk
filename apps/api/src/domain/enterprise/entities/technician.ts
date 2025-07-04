import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { WorkScheduleRequest } from '@api/domain/application/use-cases/@types/work-schedule-request'
import { buildWorkScheduleOrFail } from '@api/domain/application/use-cases/helpers/build-work-schedule-or-fail'
import { deconstructWorkScheduleEitherList } from '@api/domain/application/use-cases/helpers/deconstruct-work-schedule-either-list'
import { User } from './user'
import { Email } from './value-objects/email'
import { PasswordTooShortError } from './value-objects/errors/password-too-short-error'
import { Password } from './value-objects/password'
import { WorkSchedule } from './work-schedule'

export interface TechnicianProps {
	lastUpdateLogId?: UniqueEntityId | null
	user: User
	firstName: string
	lastName: string
	mustUpdatePassword: boolean
	availability: WorkSchedule[]
	updatedAt?: Date | null
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
	availability: WorkScheduleRequest[]
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

	get availability() {
		return this.props.availability
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
		user: { email, password, profileImageUrl },
		firstName,
		lastName,
		availability,
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

		const workSchedulesEitherList = availability.map(buildWorkScheduleOrFail)
		const workSchedulesOrError = deconstructWorkScheduleEitherList(
			workSchedulesEitherList,
		)

		if (workSchedulesOrError.isLeft()) {
			return left(workSchedulesOrError.value)
		}

		const workSchedules = workSchedulesOrError.value

		this.props.user.email = validatedEmail
		this.props.user.password = validatedPassword
		this.props.user.profileImageUrl = profileImageUrl ?? null
		this.props.firstName = firstName
		this.props.lastName = lastName
		this.props.availability = workSchedules

		this.touch()

		return right({ newTechnician: this })
	}
}
