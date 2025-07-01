import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { NotAllowedError } from '../../../errors/not-allowed-error'

export interface FetchCustomersUseCaseRequest {
	actorRole: Role
	page: number
}

export type FetchCustomersUseCaseResponse = Either<
	NotAllowedError,
	{ customers: Customer[] }
>

export class FetchCustomersUseCase {
	constructor(private customersRepository: CustomersRepository) {}

	async execute({
		actorRole,
		page,
	}: FetchCustomersUseCaseRequest): Promise<FetchCustomersUseCaseResponse> {
		if (actorRole !== Role.Admin) {
			return left(new NotAllowedError())
		}

		const customers = await this.customersRepository.findMany({ page })

		return right({ customers })
	}
}
