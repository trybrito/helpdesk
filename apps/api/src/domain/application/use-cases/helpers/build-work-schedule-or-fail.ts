import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'
import { TimeRange } from '@api/domain/enterprise/entities/value-objects/time-range'
import { Weekday } from '@api/domain/enterprise/entities/value-objects/weekday'
import { WorkSchedule } from '@api/domain/enterprise/entities/work-schedule'
import { WorkScheduleRequest } from '../sessions/authorized/admin/create-technician'

export function buildWorkScheduleOrFail(
	item: WorkScheduleRequest,
): Either<InvalidInputDataError, WorkSchedule> {
	const weekday = Weekday.create(item.weekday)

	if (weekday.isLeft()) {
		return left(weekday.value)
	}

	const beforeLunchStartTime = Time.create(item.beforeLunchWorkingHours.start)

	if (beforeLunchStartTime.isLeft()) {
		return left(beforeLunchStartTime.value)
	}

	const beforeLunchEndTime = Time.create(item.beforeLunchWorkingHours.end)

	if (beforeLunchEndTime.isLeft()) {
		return left(beforeLunchEndTime.value)
	}

	const afterLunchStartTime = Time.create(item.afterLunchWorkingHours.start)

	if (afterLunchStartTime.isLeft()) {
		return left(afterLunchStartTime.value)
	}

	const afterLunchEndTime = Time.create(item.afterLunchWorkingHours.end)

	if (afterLunchEndTime.isLeft()) {
		return left(afterLunchEndTime.value)
	}

	const beforeLunchWorkingHours = TimeRange.create({
		start: beforeLunchStartTime.value,
		end: beforeLunchEndTime.value,
	})

	if (beforeLunchWorkingHours.isLeft()) {
		return left(beforeLunchWorkingHours.value)
	}

	const afterLunchWorkingHours = TimeRange.create({
		start: afterLunchStartTime.value,
		end: afterLunchEndTime.value,
	})

	if (afterLunchWorkingHours.isLeft()) {
		return left(afterLunchWorkingHours.value)
	}

	const workSchedule = WorkSchedule.create({
		weekday: weekday.value,
		beforeLunchWorkingHours: beforeLunchWorkingHours.value,
		afterLunchWorkingHours: afterLunchWorkingHours.value,
	})

	return right(workSchedule)
}
