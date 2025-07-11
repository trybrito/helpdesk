export class InteractionAlreadyClosedError extends Error {
	constructor() {
		super('Interaction already closed')
	}
}
