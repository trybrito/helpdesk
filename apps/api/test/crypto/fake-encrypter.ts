import { Encrypter } from '@api/domain/application/crypto/encrypter'

export class FakeEncrypter implements Encrypter {
	async encrypt(payload: Record<string, unknown>): Promise<string> {
		return JSON.stringify(payload)
	}
}
