import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	Customer,
	CustomerProps,
} from '@api/domain/enterprise/entities/customer'
import { UserProps } from '@api/domain/enterprise/entities/user'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-user'

export async function makeCustomer(
	override?: {
		user?: Partial<UserProps>
		customer?: Partial<CustomerProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...override?.user,
		role: Role.Customer,
	})

	const customer = new Customer(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...override?.customer,
		},
		id,
	)

	return customer
}
