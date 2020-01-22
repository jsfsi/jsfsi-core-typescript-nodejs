import { UnauthorizedError } from '@jsfsi-core/typescript-cross-platform'
import { Inject } from 'typescript-ioc'
import { UserRepository } from '../repositories/UserRepository'
import { TokenGenerator } from '../TokenGenerator'
import { Logger } from '../Logger'
import { Google } from '../Google'

export abstract class LoginServiceConfiguration {
    google: {
        tokenInfoURL: string
    }

    jwt: {
        algorithm: string
        privateKey: string
        duration: number
    }
}

export class LoginService<U> {
    @Inject
    private configuration: LoginServiceConfiguration

    @Inject
    private userRepository: UserRepository<U>

    private privateKey: Buffer
    private google: Google

    constructor() {
        this.google = new Google(this.configuration.google.tokenInfoURL)
        this.privateKey = Buffer.from(this.configuration.jwt.privateKey, 'base64')
    }

    async loginWithGoogle(accessToken: string) {
        try {
            const googleUser = await this.google.userInfo(accessToken)

            const user = await this.userRepository.getUserByGoogleUser(googleUser)
            const expirationDate =
                (new Date().getTime() + (this.configuration.jwt.duration || 0)) / 1000
            const privateKey = this.privateKey

            const token = await TokenGenerator.generateJWT<U>(user, {
                expirationDate,
                privateKey,
                algorithm: this.configuration.jwt.algorithm,
            })

            // - Add long lived refresh token
            // - Return long lived refresh token in http only cookie
            return {
                token,
            }
        } catch (error) {
            Logger.debug(
                `Failed to authenticate with google access token: ${accessToken} | `,
                error,
            )
            throw new UnauthorizedError('Unable to authenticate with google')
        }
    }
}
