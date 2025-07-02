import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface DeleteCustomerUseCaseRequest {
	actorId: string
	actorRole: Role
	targetId: string
}

export type DeleteCustomerUseCaseResponse = Either<
	NotAllowedError | ResourceNotFoundError,
	undefined
>

export class DeleteCustomerUseCase {
	constructor(private customersRepository: CustomersRepository) {}

	async execute({
		actorId,
		actorRole,
		targetId,
	}: DeleteCustomerUseCaseRequest): Promise<DeleteCustomerUseCaseResponse> {
		if (actorRole !== Role.Admin && actorRole !== Role.Customer) {
			return left(new NotAllowedError())
		}

		if (actorRole === Role.Customer && actorId !== targetId) {
			return left(new NotAllowedError())
		}

		const customer = await this.customersRepository.findById(targetId)

		if (!customer) {
			return left(new ResourceNotFoundError())
		}

		await this.customersRepository.delete(customer)

		// TODO: delete all tickets related to the deleted customer

		return right(undefined)
	}
}
