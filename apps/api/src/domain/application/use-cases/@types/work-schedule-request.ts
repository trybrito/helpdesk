import { WeekdayType } from '@api/domain/enterprise/entities/value-objects/weekday'

export type WorkScheduleRequest = {
	weekday: WeekdayType
	beforeLunchWorkingHours: { start: string; end: string }
	afterLunchWorkingHours: { start: string; end: string }
}
