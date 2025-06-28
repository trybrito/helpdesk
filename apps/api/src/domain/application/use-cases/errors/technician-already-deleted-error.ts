export class TechnicianAlreadyDeletedError extends Error {
	constructor() {
		super('Technician already deleted')
	}
}
