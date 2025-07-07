import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { Technician } from '@api/domain/enterprise/entities/technician'
import { Ticket } from '@api/domain/enterprise/entities/ticket'
import { Time } from '@api/domain/enterprise/entities/value-objects/time'

interface GetAvailableTechniciansParams {
	technicians: Technician[]
	openTickets: Ticket[]
	atNow?: Date
}

type getAvailableTechniciansReturn = Either<
	InvalidInputDataError,
	{ availableTechnicians: Technician[] }
>

export function getAvailableTechnicians({
	technicians,
	openTickets,
	atNow = new Date(),
}: GetAvailableTechniciansParams): getAvailableTechniciansReturn {
	const techniciansHandlingTicketsAtTime = openTickets.map(
		(ticket) => ticket.technicianId,
	)

	const techniciansNotHandlingTickets = technicians.filter(
		(technician) => !techniciansHandlingTicketsAtTime.includes(technician.id),
	)

	const localDay = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
	}).format(atNow)

	const hour = atNow.getHours().toString().padStart(2, '0')
	const minute = atNow.getMinutes().toString().padStart(2, '0')

	const formattedTime = `${hour}:${minute}`
	const localTimeOrError = Time.create(formattedTime)

	if (localTimeOrError.isLeft()) {
		return left(localTimeOrError.value)
	}

	const localTime = localTimeOrError.value

	const availableTechnicians = techniciansNotHandlingTickets.filter(
		(technician) => {
			return technician.availability.find((availability) => {
				const hasAvailabilityOnSameDay =
					availability.weekday.getValue() === localDay

				const localTimeIsBetweenTechnicianBeforeLunchWorkingHoursRange =
					availability.beforeLunchWorkingHours.isBetween(localTime)

				const localTimeIsBetweenTechnicianAfterLunchWorkingHoursRange =
					availability.beforeLunchWorkingHours.isBetween(localTime)

				return (
					hasAvailabilityOnSameDay &&
					(localTimeIsBetweenTechnicianBeforeLunchWorkingHoursRange ||
						localTimeIsBetweenTechnicianAfterLunchWorkingHoursRange)
				)
			})
		},
	)

	return right({ availableTechnicians })
}
