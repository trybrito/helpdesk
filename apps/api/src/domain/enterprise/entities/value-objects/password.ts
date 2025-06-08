import { compare, hash } from 'bcrypt'

export class Password {
	private constructor(private readonly hashed: string) {}

	static async createFromPlainText(plainText: string) {
		const hashed = await hash(plainText, 8)

		return new Password(hashed)
	}

	static createFromHash(hash: string) {
		return new Password(hash)
	}

	get value() {
		return this.hashed
	}

	async compare(plainText: string) {
		return await compare(plainText, this.hashed)
	}
}
