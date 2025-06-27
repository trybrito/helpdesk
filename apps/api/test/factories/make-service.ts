import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { CategoryProps } from '@api/domain/enterprise/entities/category'
import { Service, ServiceProps } from '@api/domain/enterprise/entities/service'
import { Money } from '@api/domain/enterprise/entities/value-objects/money'
import { faker } from '@faker-js/faker'
import { makeCategory } from './make-category'

export async function makeService(
	creatorId: UniqueEntityId,
	overrides?: {
		category?: Partial<CategoryProps>
		service?: Partial<ServiceProps>
	},
	id?: UniqueEntityId,
) {
	const category = await makeCategory({ ...overrides?.category })

	const service = new Service(
		{
			categoryId: category.id,
			createdBy: creatorId,
			name: faker.lorem.word(),
			price: unwrapOrThrow(Money.create(faker.commerce.price())),
			...overrides?.service,
		},
		id,
	)

	return service
}
