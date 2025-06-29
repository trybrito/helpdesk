import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Role } from 'apps/api/src/core/@types/enums'
import { Email } from './value-objects/email'
import { PasswordTooShortError } from './value-objects/errors/password-too-short-error'
import { Password } from './value-objects/password'

export interface UserProps {
	email: Email
	password: Password
	role: Role
	profileImageUrl?: string | null
}

type UpdatePasswordReturn = Either<PasswordTooShortError, undefined>

export class User extends Entity<UserProps> {
	get email() {
		return this.props.email
	}

	get password() {
		return this.props.password
	}

	get role() {
		return this.props.role
	}

	get profileImageUrl() {
		return this.props.profileImageUrl ?? ''
	}

	set profileImageUrl(imageUrl: string) {
		this.props.profileImageUrl = imageUrl
	}

	set email(value: Email) {
		this.props.email = value
	}

	set password(value: Password) {
		this.props.password = value
	}

	static create(props: UserProps, id?: UniqueEntityId) {
		const user = new User(props, id)

		return user
	}

	public async updatePassword(
		plainText: string,
	): Promise<UpdatePasswordReturn> {
		const passwordOrError = await Password.createFromPlainText(plainText)

		if (passwordOrError.isLeft()) {
			return left(passwordOrError.value)
		}

		const password = passwordOrError.value

		this.props.password = password

		return right(undefined)
	}

	public async comparePassword(password: string) {
		return await this.props.password.compare(password)
	}

	public async changeEmail(email: Email) {
		this.props.email = email
	}
}
