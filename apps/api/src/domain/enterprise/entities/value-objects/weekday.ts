import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'

const validWeekdays = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
] as const

export type WeekdayType = (typeof validWeekdays)[number]

type WeekdayValueObjectReturn = Either<InvalidInputDataError, Weekday>

export class Weekday {
	private constructor(private readonly value: WeekdayType) {}

	static create(value: string): WeekdayValueObjectReturn {
		if (!validWeekdays.includes(value as WeekdayType)) {
			return left(new InvalidInputDataError([value]))
		}

		return right(new Weekday(value as WeekdayType))
	}

	getValue() {
		return this.value
	}

	isWeekend() {
		return this.value === 'Saturday' || this.value === 'Sunday'
	}

	equals(other: Weekday) {
		return this.value === other.value
	}
}
