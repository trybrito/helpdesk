import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	Technician,
	TechnicianProps,
} from '@api/domain/enterprise/entities/technician'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user'

export async function makeTechnician(
	overrides?: {
		user?: Partial<UserProps>
		technician?: Partial<TechnicianProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...overrides?.user,
		role: Role.Technician,
	})

	const technician = new Technician(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			mustUpdatePassword: true,
			scheduleAvailability: [''],
			...overrides?.technician,
		},
		id,
	)

	return technician
}
