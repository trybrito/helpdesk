import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { Money } from './value-objects/money'

export interface BillingItemProps {
	billingId: UniqueEntityId
	serviceId: UniqueEntityId
	price: Money
}

export class BillingItem extends Entity<BillingItemProps> {
	get billingId() {
		return this.props.billingId
	}

	get serviceId() {
		return this.props.serviceId
	}

	get price() {
		return this.props.price
	}
}
