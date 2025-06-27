import { randomUUID } from 'node:crypto'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import {
	Category,
	CategoryProps,
} from '@api/domain/enterprise/entities/category'
import { faker } from '@faker-js/faker'

export async function makeCategory(
	overrides: Partial<CategoryProps> = {},
	id?: UniqueEntityId,
) {
	const category = new Category(
		{
			createdBy: new UniqueEntityId(randomUUID()),
			name: faker.lorem.word(),
			...overrides,
		},
		id,
	)

	return category
}
