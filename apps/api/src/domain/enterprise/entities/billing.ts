import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { BillingStatus } from 'apps/api/src/core/@types/enums'
import { Optional } from 'apps/api/src/core/@types/optional'
import { BillingItem } from './billing-item'
import { Money } from './value-objects/money'

export interface BillingProps {
	ticketId: UniqueEntityId
	status: BillingStatus
	totalPrice: Money
	createdAt: Date
	updatedAt?: Date | null
}

export class Billing extends Entity<BillingProps> {
	get ticketId() {
		return this.props.ticketId
	}

	get status() {
		return this.props.status
	}

	get totalPrice() {
		return this.props.totalPrice.getValue()
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

	recalculateTotal(items: BillingItem[]) {
		const newTotal = items.reduce((acc, curr) => acc + curr.price.getValue(), 0)

		this.props.totalPrice = Money.create(newTotal)
	}
}
