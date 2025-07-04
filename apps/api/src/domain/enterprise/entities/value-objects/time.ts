import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'

type TimeValueObjectReturn = Either<InvalidInputDataError, Time>

export class Time {
	private constructor(private readonly value: string) {}

	static create(value: string): TimeValueObjectReturn {
		if (!Time.isValid(value)) {
			return left(new InvalidInputDataError([value]))
		}

		return right(new Time(value))
	}

	static isValid(value: string) {
		const twentyFourHourPatternMatches = /(?:(?:([01]?\d|2[0-3]):[0-5]?\d))/

		return twentyFourHourPatternMatches.test(value)
	}

	public getValue() {
		return this.value
	}

	public toMinutes() {
		const [hours, minutes] = this.value.split(':').map(Number)

		return hours * 60 + minutes
	}
}
