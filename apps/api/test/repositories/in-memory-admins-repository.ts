import { AdminsRepository } from '@api/domain/application/repositories/admins-repository'
import { Admin } from '@api/domain/enterprise/entities/admin'

export class InMemoryAdminsRepository implements AdminsRepository {
	constructor(public items: Admin[]) {}

	async findById(id: string): Promise<Admin | null> {
		const admin = this.items.find((item) => item.id.toString() === id) ?? null

		return admin
	}

	async findByEmail(email: string): Promise<Admin | null> {
		const admin =
			this.items.find((item) => item.user.email.getValue() === email) ?? null

		return admin
	}

	async update(admin: Admin): Promise<void> {
		const adminToBeUpdatedIndex = this.items.findIndex(
			(item) => item.id === admin.id,
		)

		this.items[adminToBeUpdatedIndex] = admin
	}
}
