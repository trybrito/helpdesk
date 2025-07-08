import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { User, UserProps } from '@api/domain/enterprise/entities/user'
import { Email } from '@api/domain/enterprise/entities/value-objects/email'
import { Password } from '@api/domain/enterprise/entities/value-objects/password'
import { faker } from '@faker-js/faker'

export async function makeUser(
	overrides: Partial<UserProps> = {},
	id?: UniqueEntityId,
) {
	const user = User.create(
		{
			email: unwrapOrThrow(Email.create(faker.internet.email())),
			password: unwrapOrThrow(
				await Password.createFromPlainText(faker.internet.password()),
			),
			role: Role.Customer,
			...overrides,
		},
		id,
	)

	return user
}
