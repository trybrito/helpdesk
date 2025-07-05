import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { TimeRange } from './value-objects/time-range'
import { Weekday } from './value-objects/weekday'

export interface WorkScheduleProps {
	weekday: Weekday
	beforeLunchWorkingHours: TimeRange
	afterLunchWorkingHours: TimeRange
}

export class WorkSchedule extends Entity<WorkScheduleProps> {
	get weekday() {
		return this.props.weekday
	}

	get beforeLunchWorkingHours(): TimeRange {
		return this.beforeLunchWorkingHours
	}

	get afterLunchWorkingHours(): TimeRange {
		return this.afterLunchWorkingHours
	}

	static create(props: WorkScheduleProps, id?: UniqueEntityId) {
		const workSchedule = new WorkSchedule(props, id)

		return workSchedule
	}

	// isAvailableAt()
}
