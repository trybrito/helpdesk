export class InvalidInputDataError extends Error {
	constructor(private readonly input: unknown[]) {
		super(`Invalid input data for: ${input.join(' AND ')}`)
	}
}
