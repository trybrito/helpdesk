export class TicketNotAssignedToATechnician extends Error {
	constructor() {
		super('This ticket is not assigned to a technician yet')
	}
}
