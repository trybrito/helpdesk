import { TicketAssignmentStatus, TicketStatus } from '@api/core/@types/enums'
import { UniqueEntityId } from '@api/core/entities/unique-entity-id'
import { AdminProps } from '@api/domain/enterprise/entities/admin'
import { CategoryProps } from '@api/domain/enterprise/entities/category'
import { CustomerProps } from '@api/domain/enterprise/entities/customer'
import { ServiceProps } from '@api/domain/enterprise/entities/service'
import { Ticket, TicketProps } from '@api/domain/enterprise/entities/ticket'
import { faker } from '@faker-js/faker'
import { makeAdmin } from './make-admin'
import { makeCategory } from './make-category'
import { makeCustomer } from './make-customer'
import { makeService } from './make-service'

export async function makeTicket(
	overrides?: {
		admin?: Partial<AdminProps>
		customer?: Partial<CustomerProps>
		category?: Partial<CategoryProps>
		services?: Partial<ServiceProps>
		ticket?: Partial<TicketProps>
	},
	id?: UniqueEntityId,
) {
	const admin = await makeAdmin({ ...overrides?.admin })
	const customer = await makeCustomer({ ...overrides?.customer })
	const category = await makeCategory({ ...overrides?.category })
	const service = await makeService(admin.id, { service: overrides?.services })

	const ticket = Ticket.create(
		{
			customerId: customer.id,
			category,
			description: faker.lorem.paragraph(),
			services: [service, service],
			assignmentStatus: TicketAssignmentStatus.Pendent,
			status: TicketStatus.Open,
			...overrides?.ticket,
		},
		id,
	)

	return ticket
}
