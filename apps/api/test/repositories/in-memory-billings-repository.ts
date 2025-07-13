import { BillingStatus } from '@api/core/@types/enums'
import { BillingsRepository } from '@api/domain/application/repositories/billings-repository'
import { Billing } from '@api/domain/enterprise/entities/billing'

export class InMemoryBillingsRepository implements BillingsRepository {
	public items: Billing[] = []

	async create(billing: Billing): Promise<void> {
		this.items.push(billing)
	}

	async findManyOpenByTicketsIds(ids: string[]): Promise<Billing[]> {
		const billings = this.items.filter((item) => {
			return (
				ids.includes(item.ticketId.toString()) &&
				item.status === BillingStatus.Open
			)
		})

		return billings
	}
}
