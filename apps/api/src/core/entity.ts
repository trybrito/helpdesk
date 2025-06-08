import { UniqueEntityId } from './unique-entity-id'

export abstract class Entity<Props> {
	private _id: UniqueEntityId
	protected props: Props

	constructor(props: Props, id?: UniqueEntityId) {
		this._id = id ?? new UniqueEntityId()
		this.props = props
	}

	get id() {
		return this._id
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	equals(entity: Entity<any>) {
		if (entity === this) {
			return true
		}

		if (entity._id === this._id) {
			return true
		}

		return false
	}
}
