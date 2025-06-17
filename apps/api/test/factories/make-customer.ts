import { Role } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/unique-entity-id'
import {
	Customer,
	CustomerProps,
} from '@api/domain/enterprise/entities/customer'
import { faker } from '@faker-js/faker'
import { makeUser } from './make-use'

export async function makeCustomer(
	override: Partial<CustomerProps> = {},
	id?: UniqueEntityId,
) {
	const customer = new Customer(
		{
			user: await makeUser({
				role: Role.Customer,
			}),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			...override,
		},
		id,
	)

	return customer
}
