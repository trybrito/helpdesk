import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { UpdateAdminProfileUseCaseRequest } from '@api/domain/application/use-cases/sessions/authorized/admin/update-admin-profile'
import { User } from './user'
import { Email } from './value-objects/email'
import { Password } from './value-objects/password'

export interface AdminProps {
	user: User
	lastUpdateLogId?: UniqueEntityId | null
	firstName: string
	lastName: string
}

type UpdateProfileRequest = Omit<
	UpdateAdminProfileUseCaseRequest,
	'adminId' | 'requesterId'
>

type UpdateProfileResponse = Either<InvalidInputDataError, { newAdmin: Admin }>

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
		user: { email, password },
		firstName,
		lastName,
	}: UpdateProfileRequest): Promise<UpdateProfileResponse> {
		const newEmailOrError = Email.create(email)

		if (newEmailOrError.isLeft()) {
			return left(new InvalidInputDataError([email]))
		}

		const validatedNewEmail = newEmailOrError.value
		const newPassword = await Password.createFromPlainText(password)

		this.props.user.email = validatedNewEmail
		this.props.user.password = newPassword
		this.props.firstName = firstName
		this.props.lastName = lastName

		return right({ newAdmin: this })
	}
}
