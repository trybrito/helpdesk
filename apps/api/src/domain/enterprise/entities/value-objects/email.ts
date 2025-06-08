export class Email {
	private constructor(private readonly value: string) {}

	static create(email: string) {
		// biome-ignore lint/complexity/noThisInStatic: <explanation>
		if (!this.validate(email)) {
			throw new Error('Invalid e-mail')
		}

		return new Email(email)
	}

	getValue() {
		return this.value
	}

	private static validate(value: string) {
		const doesEmailMatchesPattern = /\S+@\S+\.\S+/

		return doesEmailMatchesPattern.test(value)
	}
}
