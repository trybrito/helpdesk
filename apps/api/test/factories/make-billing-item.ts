import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { AdminProps } from '@api/domain/enterprise/entities/admin'
import { BillingItem } from '@api/domain/enterprise/entities/billing-item'
import { Service } from '@api/domain/enterprise/entities/service'

export async function makeBillingItem(
	service: Service,
	overrides?: {
		admin?: Partial<AdminProps>
		billingItem?: Partial<BillingItem>
	},
	id?: UniqueEntityId,
) {
	const billingItem = BillingItem.create(
		{
			serviceId: service.id,
			price: service.price,
			...overrides?.billingItem,
		},
		id,
	)

	return billingItem
}
