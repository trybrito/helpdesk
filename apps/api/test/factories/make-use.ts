import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/unique-entity-id'
import { User, UserProps } from '@api/domain/enterprise/entities/user'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { faker } from '@faker-js/faker'

export async function makeUser(
	override: Partial<UserProps> = {},
	id?: UniqueEntityId,
) {
	const user = new User(
		{
			email: Email.create(faker.internet.email()),
			password: await Password.createFromPlainText(faker.internet.password()),
			role: Role.Customer,
			...override,
		},
		id,
	)

	return user
}
