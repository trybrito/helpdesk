import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { Money } from './money'

describe('Money [Value Object]', () => {
	it('should be able to create a Money instance', () => {
		const moneyOrError = Money.create('39,99') // or 39.99

		expect(moneyOrError.isRight()).toBeTruthy()

		const money = unwrapOrThrow(moneyOrError)

		expect(money.getValue()).toBe(39.99)
		expect(money).toBeInstanceOf(Money)
	})

	it('should be able to create a Money instance with value in cents', () => {
		const moneyOrError = Money.create('39,99', true)

		expect(moneyOrError.isRight()).toBeTruthy()

		const money = unwrapOrThrow(moneyOrError)

		expect(money.getValue()).toBe(3999)
		expect(money).toBeInstanceOf(Money)
	})

	it('should not be able to create a Money instance using invalid values', () => {
		const money = Money.create('invalid-value')

		expect(money.isLeft()).toBeTruthy()
		expect(money.value).toBeInstanceOf(InvalidInputDataError)
	})
})
