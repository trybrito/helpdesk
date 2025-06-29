import { Either, left, right } from '@api/core/either'
import { Entity } from '@api/core/entities/entity'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { InvalidInputDataError } from '@api/core/errors/invalid-input-data-error'
import { UpdateServiceUseCaseRequest } from '@api/domain/application/use-cases/sessions/authorized/admin/update-service'
import { Money } from './value-objects/money'

export interface ServiceProps {
	createdBy: UniqueEntityId
	categoryId: UniqueEntityId // verify
	name: string
	price: Money
	updatedAt?: Date | null
	deletedAt?: Date | null
}

type UpdateServiceRequest = Omit<
	UpdateServiceUseCaseRequest,
	'actorRole' | 'targetId'
> // Coupling!!!

type UpdateServiceResponse = Either<
	InvalidInputDataError,
	{ updatedService: Service }
>

export class Service extends Entity<ServiceProps> {
	get createdBy() {
		return this.props.createdBy
	}

	get categoryId() {
		return this.props.categoryId
	}

	get name() {
		return this.props.name
	}

	get price() {
		return this.props.price.getValue()
	}

	get updatedAt() {
		return this.props.updatedAt ?? null
	}

	get deletedAt() {
		return this.props.deletedAt ?? null
	}

	set name(name: string) {
		this.props.name = name
		this.touch()
	}

	public changePrice(price: Money) {
		this.props.price = price
		this.touch()
	}

	private touch() {
		this.props.updatedAt = new Date()
	}

	softDelete() {
		this.props.deletedAt = new Date()
		this.touch()
	}

	static create(props: ServiceProps, id?: UniqueEntityId) {
		const name = new Service(props, id)

		return name
	}

	async update({
		categoryId,
		name,
		price,
	}: UpdateServiceRequest): Promise<UpdateServiceResponse> {
		const priceOrError = Money.create(price, true)

		if (priceOrError.isLeft()) {
			return left(priceOrError.value)
		}

		const priceInCents = priceOrError.value

		this.props.categoryId = new UniqueEntityId(categoryId)
		this.props.name = name
		this.props.price = priceInCents

		this.touch()

		return right({ updatedService: this })
	}
}
