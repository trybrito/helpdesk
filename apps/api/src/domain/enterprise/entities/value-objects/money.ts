export class Money {
	private constructor(private readonly value: number) {}

	static create(value: string, inCents?: boolean) {
		const price = Number(value.replace(',', '.'))

		if (inCents) {
			return new Money(price * 100)
		}

		return new Money(price)
	}

	getValue() {
		return this.value
	}

	getFormattedValue() {
		const formatter = new Intl.NumberFormat('pt-br', {
			style: 'currency',
			currency: 'BRL',
		})

		return formatter.format(this.value)
	}

	toString() {
		return String(this.value)
	}
}
