import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { PasswordTooShortError } from './errors/password-too-short-error'
import { Password } from './password'

describe('Password [Value Object]', () => {
	it('should be able to hash a password', async () => {
		const password = '123456'

		const hashedPasswordOrError = await Password.createFromPlainText(password)

		expect(hashedPasswordOrError.isRight()).toBeTruthy()

		const hashedPassword = unwrapOrThrow(hashedPasswordOrError)

		expect(hashedPassword).toBeInstanceOf(Password)
		expect(hashedPassword.getValue()).not.toEqual(password)
	})

	it('should not be able to hash a too short password (less than 6 chars)', async () => {
		const password = '123'

		const hashedPassword = await Password.createFromPlainText(password)

		expect(hashedPassword.isLeft()).toBeTruthy()
		expect(hashedPassword.value).toBeInstanceOf(PasswordTooShortError)
	})

	it('should be able to compare passwords with hashed passwords', async () => {
		const password = '123456'

		const hashedPassword = unwrapOrThrow(
			await Password.createFromPlainText(password),
		)

		const isSame = await hashedPassword.compare(password)

		expect(isSame).toBeTruthy()
	})
})
