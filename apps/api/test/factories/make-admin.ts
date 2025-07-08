import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Admin, AdminProps } from '@api/domain/enterprise/entities/admin'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user'

export async function makeAdmin(
	overrides?: {
		user?: Partial<UserProps>
		admin?: Partial<AdminProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...overrides?.user,
		role: Role.Admin,
	})

	const admin = Admin.create(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...overrides?.admin,
		},
		id,
	)

	return admin
}
