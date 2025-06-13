import { Technician } from '../../enterprise/entities/technician'

export abstract class TechniciansRepository {
	abstract create(technician: Technician): Promise<void>
	abstract update(technician: Technician): Promise<void>
}
