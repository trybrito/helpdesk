import { TicketStatus } from '@api/core/@types/enums'

export class ImpossibleToCreateTicketWithThisStatusError extends Error {
	constructor(status: TicketStatus) {
		super(`Is not possible to create a ticket with this status: [${status}]`)
	}
}
