import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { TimeRange } from './value-objects/time-range'
import { Weekday } from './value-objects/weekday'

export interface WorkScheduleProps {
	technicianId: UniqueEntityId
	weekDay: Weekday
	beforeLunchWorkingHours: TimeRange
	afterLunchWorkingHours: TimeRange
}

export class WorkSchedule extends Entity<WorkScheduleProps> {
	get technicianId() {
		return this.props.technicianId
	}

	get weekDay() {
		return this.props.weekDay
	}

	get beforeLunchWorkingHours() {
		return this.beforeLunchWorkingHours
	}

	get afterLunchWorkingHours() {
		return this.afterLunchWorkingHours
	}

	static create(props: WorkScheduleProps, id?: UniqueEntityId) {
		const workSchedule = new WorkSchedule(props, id)

		return workSchedule
	}

	// isAvailableAt()
}
