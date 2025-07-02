import { PaginationParams } from '@api/core/repositories/pagination-params'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { Customer } from '@api/domain/enterprise/entities/customer'

export class InMemoryCustomersRepository implements CustomersRepository {
	public items: Customer[] = []

	async create(customer: Customer): Promise<void> {
		this.items.push(customer)
	}

	async update(customer: Customer): Promise<void> {
		const index = this.items.findIndex((item) => item.id === customer.id)

		this.items.splice(index, 1, customer)
	}

	async delete(customer: Customer): Promise<void> {
		const index = this.items.findIndex((item) => item.id === customer.id)

		this.items.splice(index, 1)
	}

	async findById(id: string): Promise<Customer | null> {
		const customer =
			this.items.find((item) => item.id.toString() === id) ?? null

		return customer
	}

	async findByEmail(email: string): Promise<Customer | null> {
		const customer =
			this.items.find((item) => item.user.email.getValue() === email) ?? null

		return customer
	}

	async findMany({ page }: PaginationParams): Promise<Customer[]> {
		const customers = this.items.slice((page - 1) * 20, page * 20)

		return customers
	}
}
