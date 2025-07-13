import { Billing } from '@api/domain/enterprise/entities/billing'

export abstract class BillingsRepository {
	abstract create(billing: Billing): Promise<void>
	abstract findManyOpenByTicketsIds(ids: string[]): Promise<Billing[]>
}
