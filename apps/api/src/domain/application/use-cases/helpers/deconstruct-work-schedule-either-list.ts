import { Either, left, right } from '@api/core/either'

export function deconstructWorkScheduleEitherList<L, R>(
	list: Either<L, R>[],
): Either<L, R[]> {
	const results: R[] = []

	for (const item of list) {
		if (item.isLeft()) {
			return left(item.value)
		}

		results.push(item.value)
	}

	return right(results)
}
