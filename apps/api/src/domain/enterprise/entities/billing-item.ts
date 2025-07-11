import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Money } from './value-objects/money'

export interface BillingItemProps {
	serviceId: UniqueEntityId
	price: Money
}

export class BillingItem extends Entity<BillingItemProps> {
	get serviceId() {
		return this.props.serviceId
	}

	get price() {
		return this.props.price
	}

	static create(props: BillingItemProps, id?: UniqueEntityId) {
		const billingItem = new BillingItem(props, id)

		return billingItem
	}
}
