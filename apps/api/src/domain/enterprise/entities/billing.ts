import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { BillingStatus } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { BillingItem } from './billing-item'
import { Money } from './value-objects/money'

export interface BillingProps {
	ticketId: UniqueEntityId
	items: BillingItem[]
	status: BillingStatus
	createdAt: Date
	updatedAt?: Date | null
}

export class Billing extends Entity<BillingProps> {
	private _totalPrice: Money = unwrapOrThrow(Money.create('0'))

	get ticketId() {
		return this.props.ticketId
	}

	get item() {
		return this.props.items
	}

	get status() {
		return this.props.status
	}

	get totalPrice() {
		return this._totalPrice
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	touch() {
		this.props.updatedAt = new Date()
	}

	static create(
		props: Optional<BillingProps, 'createdAt'>,
		id?: UniqueEntityId,
	) {
		const billing = new Billing(
			{
				...props,
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		)

		billing.assignTotalPrice()

		return billing
	}

	protected close() {
		this.props.status = BillingStatus.Closed
		this.touch()
	}

	protected cancel() {
		this.props.status = BillingStatus.Cancelled
		this.touch()
	}

	protected assignTotalPrice() {
		const prices = this.props.items.map((item) => Number(item.price))

		this._totalPrice = Money.calculateTotal(prices)
	}
}
