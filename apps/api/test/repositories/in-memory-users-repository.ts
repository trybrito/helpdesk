import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { TechniciansRepository } from '@api/domain/application/repositories/technicians-repository'
import { UsersRepository } from '@api/domain/application/repositories/users-repository'
import { Admin } from '@api/domain/enterprise/entities/admin'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { Technician } from '@api/domain/enterprise/entities/technician'

export class InMemoryUsersRepository implements UsersRepository {
	constructor(
		private adminsRepository: AdminsRepository,
		private techniciansRepository: TechniciansRepository,
		private customersRepository: CustomersRepository,
	) {}

	async findByEmail(
		email: string,
	): Promise<Admin | Technician | Customer | null> {
		const admin = await this.adminsRepository.findByEmail(email)

		if (admin) {
			return admin
		}

		const technician = await this.techniciansRepository.findByEmail(email)

		if (technician) {
			return technician
		}

		const customer = await this.customersRepository.findByEmail(email)

		if (customer) {
			return customer
		}

		return null
	}
}
