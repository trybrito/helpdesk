import { Customer } from '@api/domain/enterprise/entities/customer'

export abstract class CustomersRepository {
	abstract create(customer: Customer): Promise<void>
}
