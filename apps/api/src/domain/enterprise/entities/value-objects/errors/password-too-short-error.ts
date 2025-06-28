export class PasswordTooShortError extends Error {
	constructor() {
		super('Password must have, at least, 6 characters')
	}
}
