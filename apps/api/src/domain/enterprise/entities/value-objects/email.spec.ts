import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Email } from './email'

describe('Email [Value Object]', () => {
	it('should be able to create an Email instance', () => {
		const emailOrError = Email.create('example@example.com')

		expect(emailOrError.isRight()).toBeTruthy()

		const email = unwrapOrThrow(emailOrError)

		expect(email).toBeInstanceOf(Email)
		expect(email.getValue()).toBe('example@example.com')
	})

	it('should not be able to create an Email instance using an invalid e-mail', () => {
		const email = Email.create('invalid-email')

		expect(email.isLeft()).toBeTruthy()
		expect(email.value).toBeInstanceOf(InvalidInputDataError)
	})
})
