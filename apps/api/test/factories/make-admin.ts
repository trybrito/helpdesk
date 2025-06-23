import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Admin, AdminProps } from '@api/domain/enterprise/entities/admin'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user'

export async function makeAdmin(
	override?: {
		user?: Partial<UserProps>
		admin?: Partial<AdminProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...override?.user,
		role: Role.Admin,
	})

	const admin = new Admin(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...override?.admin,
		},
		id,
	)

	return admin
}
