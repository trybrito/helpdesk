import { Role } from '@api/core/@types/enums'
import { Either, left, right } from '@api/core/either'
import { BillingsRepository } from '@api/domain/application/repositories/billings-repository'
import { CustomersRepository } from '@api/domain/application/repositories/customers-repository'
import { TicketsRepository } from '@api/domain/application/repositories/tickets-repository'
import { Customer } from '@api/domain/enterprise/entities/customer'
import { CustomerHasUnpaidBillings } from '../../../errors/customer-has-unpaid-billings'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'

export interface SoftDeleteCustomerUseCaseRequest {
	actorId: string
	actorRole: Role
	targetId: string
}

export type DeleteCustomerUseCaseResponse = Either<
	NotAllowedError | ResourceNotFoundError,
	{ customer: Customer }
>

export class DeleteCustomerUseCase {
	constructor(
		private customersRepository: CustomersRepository,
		private ticketsRepository: TicketsRepository,
		private billingsRepository: BillingsRepository,
	) {}

	async execute({
		actorId,
		actorRole,
		targetId,
	}: SoftDeleteCustomerUseCaseRequest): Promise<DeleteCustomerUseCaseResponse> {
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

		const tickets = await this.ticketsRepository.findManyByCustomerId(targetId)
		const ticketsIds = tickets.map((ticket) => ticket.id.toString())

		const billings =
			await this.billingsRepository.findManyOpenByTicketsIds(ticketsIds)

		if (billings.length > 0) {
			return left(new CustomerHasUnpaidBillings())
		}

		customer.softDelete()
		await this.customersRepository.update(customer)

		return right({ customer })
	}
}
