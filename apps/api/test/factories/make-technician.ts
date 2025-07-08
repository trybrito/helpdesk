import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	Technician,
	TechnicianProps,
} from '@api/domain/enterprise/entities/technician'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { WorkScheduleProps } from '@api/domain/enterprise/entities/work-schedule'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user'
import { makeWorkSchedule } from './make-work-schedule'

export async function makeTechnician(
	overrides?: {
		user?: Partial<UserProps>
		workSchedule?: Partial<WorkScheduleProps>
		technician?: Partial<TechnicianProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...overrides?.user,
		role: Role.Technician,
	})

	const workSchedule = await makeWorkSchedule({ ...overrides?.workSchedule })

	const technician = Technician.create(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			mustUpdatePassword: true,
			availability: workSchedule,
			...overrides?.technician,
		},
		id,
	)

	return technician
}
