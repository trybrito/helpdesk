import { BillingStatus } from '@api/core/@types/enums'
import { unwrapOrThrow } from '@api/core/helpers/unwrap-or-throw'
import { makeAdmin } from 'apps/api/test/factories/make-admin'
import { makeBilling } from 'apps/api/test/factories/make-billing'
import { makeCustomer } from 'apps/api/test/factories/make-customer'
import { makeTechnician } from 'apps/api/test/factories/make-technician'
import { makeTicket } from 'apps/api/test/factories/make-ticket'
import { InMemoryBillingsRepository } from 'apps/api/test/repositories/in-memory-billings-repository'
import { InMemoryCustomersRepository } from 'apps/api/test/repositories/in-memory-customers-repository'
import { InMemoryTicketsRepository } from 'apps/api/test/repositories/in-memory-tickets-repository'
import { CustomerHasUnpaidBillings } from '../../../errors/customer-has-unpaid-billings'
import { NotAllowedError } from '../../../errors/not-allowed-error'
import { ResourceNotFoundError } from '../../../errors/resource-not-found-error'
import { DeleteCustomerUseCase } from './soft-delete-customer'

let inMemoryCustomersRepository: InMemoryCustomersRepository
let inMemoryTicketsRepository: InMemoryTicketsRepository
let inMemoryBillingsRepository: InMemoryBillingsRepository
let sut: DeleteCustomerUseCase

describe('Delete customer', () => {
	beforeEach(async () => {
		inMemoryCustomersRepository = new InMemoryCustomersRepository()
		inMemoryTicketsRepository = new InMemoryTicketsRepository()
		inMemoryBillingsRepository = new InMemoryBillingsRepository()

		sut = new DeleteCustomerUseCase(
			inMemoryCustomersRepository,
			inMemoryTicketsRepository,
			inMemoryBillingsRepository,
		)
	})

	it('should allow an admin to soft delete a customer with no tickets', async () => {
		const admin = await makeAdmin()
		const customer = await makeCustomer()

		inMemoryCustomersRepository.create(customer)

		const sutEitherResult = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { customer: resultCustomer } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryCustomersRepository.items[0]).toBe(resultCustomer)
		expect(inMemoryCustomersRepository.items[0].deletedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should allow an admin to soft delete a customer with tickets and no pendent billing', async () => {
		const admin = await makeAdmin()

		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const ticket = await makeTicket({ ticket: { customerId: customer.id } })
		inMemoryTicketsRepository.create(ticket)

		const billing = await makeBilling({
			billing: { ticketId: ticket.id, status: BillingStatus.Closed },
		})
		inMemoryBillingsRepository.create(billing)

		const sutEitherResult = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { customer: resultCustomer } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryCustomersRepository.items[0]).toBe(resultCustomer)
		expect(inMemoryCustomersRepository.items[0].deletedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should not allow an admin to soft delete a customer with tickets and pendent billing(s)', async () => {
		const admin = await makeAdmin()

		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const ticket = await makeTicket({ ticket: { customerId: customer.id } })
		inMemoryTicketsRepository.create(ticket)

		const billing = await makeBilling({
			billing: { ticketId: ticket.id },
		})
		inMemoryBillingsRepository.create(billing)

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(CustomerHasUnpaidBillings)
	})

	it('should allow a customer to soft delete its own customer profile (with no tickets)', async () => {
		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const sutEitherResult = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { customer: resultCustomer } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryCustomersRepository.items[0]).toBe(resultCustomer)
		expect(inMemoryCustomersRepository.items[0].deletedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should allow a customer to soft delete its own customer profile (with tickets and no pendent billing)', async () => {
		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const ticket = await makeTicket({ ticket: { customerId: customer.id } })
		inMemoryTicketsRepository.create(ticket)

		const billing = await makeBilling({
			billing: { ticketId: ticket.id, status: BillingStatus.Closed },
		})
		inMemoryBillingsRepository.create(billing)

		const sutEitherResult = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
		})

		expect(sutEitherResult.isRight()).toBeTruthy()

		const { customer: resultCustomer } = unwrapOrThrow(sutEitherResult)

		expect(inMemoryCustomersRepository.items[0]).toBe(resultCustomer)
		expect(inMemoryCustomersRepository.items[0].deletedAt).toEqual(
			expect.any(Date),
		)
	})

	it('should not allow a customer to soft delete its own customer profile (with tickets and pendent billing(s))', async () => {
		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const ticket = await makeTicket({ ticket: { customerId: customer.id } })
		inMemoryTicketsRepository.create(ticket)

		const billing = await makeBilling({
			billing: { ticketId: ticket.id },
		})
		inMemoryBillingsRepository.create(billing)

		const result = await sut.execute({
			actorId: customer.id.toString(),
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(CustomerHasUnpaidBillings)
	})

	it('should not allow a technician to delete a customer', async () => {
		const technician = await makeTechnician()

		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorId: technician.id.toString(),
			actorRole: technician.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not allow a customer to delete another customer profile', async () => {
		const customer = await makeCustomer()
		inMemoryCustomersRepository.create(customer)

		const result = await sut.execute({
			actorId: 'another-customer',
			actorRole: customer.user.role,
			targetId: customer.id.toString(),
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})

	it('should not be able to delete a non-existent customer', async () => {
		const admin = await makeAdmin()

		const result = await sut.execute({
			actorId: admin.id.toString(),
			actorRole: admin.user.role,
			targetId: 'non-existent',
		})

		expect(result.isLeft()).toBeTruthy()
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})
})
