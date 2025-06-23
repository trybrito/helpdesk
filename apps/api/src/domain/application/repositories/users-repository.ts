import { User } from '@api/domain/enterprise/entities/user'

export abstract class UsersRepository {
	abstract findByEmail(email: string): Promise<User | null>
}
