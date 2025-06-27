import { Either, left, right } from '@api/core/either'
import { Encrypter } from '../../../crypto/encrypter'
import { UsersRepository } from '../../../repositories/users-repository'
import { WrongCredentialsError } from '../../errors/wrong-credentials-error'

export interface AuthenticateUseCaseRequest {
	email: string
	password: string
}

export type AuthenticateUseCaseResponse = Either<
	WrongCredentialsError,
	{
		accessToken: string
	}
>

export class AuthenticateUseCase {
	constructor(
		private usersRepository: UsersRepository,
		private encrypter: Encrypter,
	) {}

	async execute({ email, password }: AuthenticateUseCaseRequest) {
		const genericUser = await this.usersRepository.findByEmail(email)

		if (!genericUser) {
			return left(new WrongCredentialsError())
		}

		const doesPasswordMatches = await genericUser.user.comparePassword(password)

		if (!doesPasswordMatches) {
			return left(new WrongCredentialsError())
		}

		const accessToken = await this.encrypter.encrypt({
			sub: genericUser.id.toString(),
		})

		return right({ accessToken })
	}
}
