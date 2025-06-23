import { Admin } from '@api/domain/enterprise/entities/admin'

export abstract class AdminsRepository {
	abstract findById(id: string): Promise<Admin | null>
}
