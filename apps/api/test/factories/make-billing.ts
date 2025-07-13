import { BillingStatus } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Billing, BillingProps } from '@api/domain/enterprise/entities/billing'
import { BillingItemProps } from '@api/domain/enterprise/entities/billing-item'
import { makeBillingItem } from './make-billing-item'
import { makeTicket } from './make-ticket'

export async function makeBilling(
	overrides?: {
		billingItem?: Partial<BillingItemProps>
		billing?: Partial<BillingProps>
	},
	id?: UniqueEntityId,
) {
	const ticket = await makeTicket()
	const billingItem = await makeBillingItem(ticket.services[0], {
		billingItem: overrides?.billingItem,
	})

	const billing = Billing.create(
		{
			items: [billingItem],
			ticketId: ticket.id,
			status: BillingStatus.Open,
			...overrides?.billing,
		},
		id,
	)

	return billing
}
