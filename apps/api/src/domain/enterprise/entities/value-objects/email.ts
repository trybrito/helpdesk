import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '../../../../core/errors/invalid-input-data-error'

type EmailValueObjectReturn = Either<InvalidInputDataError, Email>

export class Email {
	private constructor(private readonly value: string) {}

	static create(email: string): EmailValueObjectReturn {
		if (!Email.validate(email)) {
			return left(new InvalidInputDataError([email]))
		}

		return right(new Email(email))
	}

	getValue() {
		return this.value
	}

	private static validate(value: string) {
		const doesEmailMatchesPattern = /\S+@\S+\.\S+/

		return doesEmailMatchesPattern.test(value)
	}
}
