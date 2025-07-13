export class CustomerHasUnpaidBillings extends Error {
	constructor() {
		super(
			'Can not delete this customer because he has, at least, one unpaid billing',
		)
	}
}
