import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Technician } from '@api/domain/enterprise/entities/technician'

interface GetRandomAvailableTechnicianParams {
	availableTechnicians: Technician[]
}

export function getRandomAvailableTechnicianId({
	availableTechnicians,
}: GetRandomAvailableTechnicianParams): UniqueEntityId {
	const randomAvailableTechnicianId =
		availableTechnicians[
			Math.floor(Math.random() * availableTechnicians.length)
		].id

	return randomAvailableTechnicianId
}
