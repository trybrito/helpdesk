import { Entity } from 'apps/api/src/core/entity'
import { UniqueEntityId } from 'apps/api/src/core/unique-entity-id'
import { Password } from './value-objects/password'

enum Role {
	Customer = 'customer',
	Technician = 'technician',
	Admin = 'admin',
}

export interface UserProps {
	email: string
	password: Password
	role: Role
	profileImageUrl?: string | null
}

export class User extends Entity<UserProps> {
	get email() {
		return this.props.email
	}

	get password() {
		return this.props.password.value
	}

	get role() {
		return this.props.role
	}

	get profileImageUrl() {
		return this.props.profileImageUrl ?? ''
	}

	set email(email: string) {
		this.props.email = email
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
}
