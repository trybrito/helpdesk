import { Either, left, right } from '@api/core/either'
import { compare, hash } from 'bcrypt'
import { PasswordTooShortError } from './errors/password-too-short-error'

type CreateFromPlainTextReturn = Either<PasswordTooShortError, Password>

export class Password {
	private constructor(private readonly hashed: string) {}

	static async createFromPlainText(
		plainText: string,
		rounds = 8,
	): Promise<CreateFromPlainTextReturn> {
		if (plainText.length < 6) {
			return left(new PasswordTooShortError())
		}

		const hashed = await hash(plainText, rounds)

		return right(new Password(hashed))
	}

	// static createFromHash(hash: string) {
	// 	return new Password(hash)
	// }

	getValue() {
		return this.hashed
	}

	async compare(plainText: string) {
		return await compare(plainText, this.hashed)
	}
}
