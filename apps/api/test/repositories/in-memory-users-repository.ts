import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { User } from '@api/domain/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
	constructor(
		private techniciansRepository: TechniciansRepository,
		private customersRepository: CustomersRepository,
	) {}

	async findByEmail(email: string): Promise<User | null> {
		const technician = await this.techniciansRepository.findByEmail(email)

		if (technician) {
			return technician.user
		}

		const customer = await this.customersRepository.findByEmail(email)

		if (customer) {
			return customer.user
		}

		return null
	}
}
