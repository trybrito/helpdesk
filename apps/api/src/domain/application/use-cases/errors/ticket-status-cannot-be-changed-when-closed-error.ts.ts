export class TicketStatusCannotBeChangedWhenClosedError extends Error {
	constructor() {
		super('This ticket is already closed, so its status can not be changed')
	}
}
