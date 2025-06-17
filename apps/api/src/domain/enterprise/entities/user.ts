import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Role } from 'apps/api/src/core/@types/enums'
import { Email } from './value-objects/email'
import { Password } from './value-objects/password'

export interface UserProps {
	email: Email
	password: Password
	role: Role
	profileImageUrl?: string | null
}

export class User extends Entity<UserProps> {
	get email() {
		return this.props.email.getValue()
	}

	get password() {
		return this.props.password.getValue()
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

	static create(props: UserProps, id?: UniqueEntityId) {
		const user = new User(props, id)

		return user
	}

	public async updatePassword(plainText: string) {
		this.props.password = await Password.createFromPlainText(plainText)
	}

	public async changeEmail(email: string) {
		this.props.email = await Email.create(email)
	}
}
