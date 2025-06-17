import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { Customer } from '@api/domain/enterprise/entities/customer'

export class InMemoryCustomersRepository implements CustomersRepository {
	public items: Customer[] = []

	async create(customer: Customer): Promise<void> {
		this.items.push(customer)
	}
}
