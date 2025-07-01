import { PaginationParams } from '@api/core/repositories/pagination-params'
import { Customer } from '@api/domain/enterprise/entities/customer'

export abstract class CustomersRepository {
	abstract create(customer: Customer): Promise<void>
	abstract findByEmail(email: string): Promise<Customer | null>
	abstract findMany(params: PaginationParams): Promise<Customer[]>
}
