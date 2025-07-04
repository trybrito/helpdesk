import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'
import { TimeRange } from '@api/domain/enterprise/entities/value-objects/time-range'
import { Weekday } from '@api/domain/enterprise/entities/value-objects/weekday'
import {
	WorkSchedule,
	WorkScheduleProps,
} from '@api/domain/enterprise/entities/work-schedule'

export async function makeWorkSchedule(
	overrides: Partial<WorkScheduleProps> = {},
	id?: UniqueEntityId,
) {
	const weekday = unwrapOrThrow(
		Weekday.create(overrides.weekday?.getValue() ?? 'Monday'),
	)

	const beforeLunchStartTime = unwrapOrThrow(
		Time.create(overrides.beforeLunchWorkingHours?.getStart() ?? '08:00'),
	)
	const beforeLunchEndTime = unwrapOrThrow(
		Time.create(overrides.beforeLunchWorkingHours?.getEnd() ?? '12:00'),
	)

	const beforeLunchWorkingHours = unwrapOrThrow(
		TimeRange.create({ start: beforeLunchStartTime, end: beforeLunchEndTime }),
	)

	const afterLunchStartTime = unwrapOrThrow(
		Time.create(overrides.afterLunchWorkingHours?.getStart() ?? '13:00'),
	)
	const afterLunchEndTime = unwrapOrThrow(
		Time.create(overrides.afterLunchWorkingHours?.getEnd() ?? '17:00'),
	)

	const afterLunchWorkingHours = unwrapOrThrow(
		TimeRange.create({ start: afterLunchStartTime, end: afterLunchEndTime }),
	)

	const workSchedule = WorkSchedule.create(
		{
			weekday,
			beforeLunchWorkingHours,
			afterLunchWorkingHours,
		},
		id,
	)

	return [workSchedule]
}
