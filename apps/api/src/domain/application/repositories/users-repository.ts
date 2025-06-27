import { Admin } from '@api/domain/enterprise/entities/admin'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { Technician } from '@api/domain/enterprise/entities/technician'

export abstract class UsersRepository {
	abstract findByEmail(
		email: string,
	): Promise<Admin | Technician | Customer | null>
}
