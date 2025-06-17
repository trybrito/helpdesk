import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	Technician,
	TechnicianProps,
} from '@api/domain/enterprise/entities/technician'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-use'

export async function makeTechnician(
	override: Partial<TechnicianProps> = {},
	id?: UniqueEntityId,
) {
	const technician = new Technician(
		{
			user: await makeUser({
				role: Role.Technician,
			}),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			mustUpdatePassword: true,
			scheduleAvailability: [''],
			...override,
		},
		id,
	)

	return technician
}
