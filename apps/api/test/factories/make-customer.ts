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
	overrides?: {
		user?: Partial<UserProps>
		customer?: Partial<CustomerProps>
	},
	id?: UniqueEntityId,
) {
	const user = await makeUser({
		...overrides?.user,
		role: Role.Customer,
	})

	const customer = new Customer(
		{
			user,
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...overrides?.customer,
		},
		id,
	)

	return customer
}
