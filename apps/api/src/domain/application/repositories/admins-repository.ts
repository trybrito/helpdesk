import { Admin } from '@api/domain/enterprise/entities/admin'

export abstract class AdminsRepository {
	abstract findByEmail(email: string): Promise<Admin | null>
	abstract findById(id: string): Promise<Admin | null>
	abstract update(admin: Admin): Promise<void>
}
