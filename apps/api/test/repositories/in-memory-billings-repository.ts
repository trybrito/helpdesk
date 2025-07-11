import { BillingsRepository } from '@api/domain/application/repositories/billings-repository'
import { Billing } from '@api/domain/enterprise/entities/billing'

export class InMemoryBillingsRepository implements BillingsRepository {
	public items: Billing[] = []

	async create(billing: Billing): Promise<void> {
		this.items.push(billing)
	}
}
