import { compare, hash } from 'bcrypt'

export class Password {
	private constructor(private readonly hashed: string) {}

	static async createFromPlainText(plainText: string, rounds = 8) {
		const hashed = await hash(plainText, rounds)

		return new Password(hashed)
	}

	static createFromHash(hash: string) {
		return new Password(hash)
	}

	getValue() {
		return this.hashed
	}

	async compare(plainText: string) {
		return await compare(plainText, this.hashed)
	}
}
