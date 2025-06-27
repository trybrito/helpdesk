import { Either, left, right } from '@api/core/either'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'

type MoneyValueObjectReturn = Either<InvalidInputDataError, Money>

export class Money {
	private constructor(private readonly value: number) {}

	static create(value: string, inCents?: boolean): MoneyValueObjectReturn {
		const normalizedValue = value.replace(',', '.')

		if (Number.isNaN(Number(normalizedValue))) {
			return left(new InvalidInputDataError([normalizedValue]))
		}

		const price = Number(normalizedValue.replace(',', '.').trim())

		if (inCents) {
			return right(new Money(price * 100))
		}

		return right(new Money(price))
	}

	static calculateTotal(numbers: number[]): Money {
		return new Money(
			numbers.reduce((acc, curr) => {
				return acc + curr
			}, 0),
		)
	}

	getValue() {
		return this.value
	}

	toString() {
		return String(this.value)
	}

	formatTo(currency = 'BRL') {
		const formatter = new Intl.NumberFormat('pt-br', {
			style: 'currency',
			currency,
		})

		return formatter.format(this.value)
	}

	add(other: Money): Money {
		return new Money(this.value + other.value)
	}
}
