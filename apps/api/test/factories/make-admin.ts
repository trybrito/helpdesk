import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/unique-entity-id'
import { Admin, AdminProps } from '@api/domain/enterprise/entities/admin'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-use'

export async function makeAdmin(
	override: Partial<AdminProps> = {},
	id?: UniqueEntityId,
) {
	const admin = new Admin(
		{
			user: await makeUser({
				role: Role.Admin,
			}),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...override,
		},
		id,
	)

	return admin
}
