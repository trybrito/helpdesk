import { Billing } from '@api/domain/enterprise/entities/billing'

export abstract class BillingsRepository {
	abstract create(billing: Billing): Promise<void>
}
