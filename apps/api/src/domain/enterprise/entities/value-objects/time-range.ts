import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Time } from './time'

type TimeRangeVOReturn = Either<InvalidInputDataError, TimeRange>

interface TimeRangeVOCreateProps {
	start: Time
	end: Time
}

export class TimeRange {
	private constructor(
		private readonly start: Time,
		private readonly end: Time,
	) {}

	static create({ start, end }: TimeRangeVOCreateProps): TimeRangeVOReturn {
		if (!TimeRange.isValid(start, end)) {
			return left(new InvalidInputDataError([start, end]))
		}

		return right(new TimeRange(start, end))
	}

	static isValid(start: Time, end: Time) {
		return start.toMinutes() < end.toMinutes()
	}

	public isBetween(time: Time) {
		const isEqualOrAfterStart = time.toMinutes() >= this.start.toMinutes()
		const isEqualOrBeforeEnd = time.toMinutes() <= this.end.toMinutes()

		return isEqualOrAfterStart && isEqualOrBeforeEnd
	}

	public getStart() {
		return this.start.getValue()
	}

	public getEnd() {
		return this.end.getValue()
	}
}
