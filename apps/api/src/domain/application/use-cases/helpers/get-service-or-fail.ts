import { Either, left, right } from '@api/core/either'
import { Service } from '@api/domain/enterprise/entities/service'
import { ServicesRepository } from '../../repositories/services-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

export async function getServiceByIdOrFail(
	id: string,
	repository: ServicesRepository,
): Promise<Either<ResourceNotFoundError, Service>> {
	const service = await repository.findById(id)

	if (!service) {
		return left(new ResourceNotFoundError())
	}

	return right(service)
}
