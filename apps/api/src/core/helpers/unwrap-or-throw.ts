import { Either } from '../either'

export function unwrapOrThrow<L, R>(either: Either<L, R>): R {
	if (either.isLeft()) {
		throw new Error(`[Unwrap failed]: ${either.value}`)
	}

	return either.value
}
