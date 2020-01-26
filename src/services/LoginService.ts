import { UnauthorizedError } from '@jsfsi-core/typescript-cross-platform'
import { Inject } from 'typescript-ioc'
import { UserRepository } from '../repositories/UserRepository'
import { TokenGenerator } from '../TokenGenerator'
import { Logger } from '../Logger'
import { Google } from '../Google'
import { Storage } from '../storage'
import { md5 } from '../Hash'

export abstract class LoginServiceConfiguration {
    google: {
        tokenInfoURL: string
    }

    jwt: {
        algorithm: string
        privateKey: string
        duration: number

        refreshToken: {
            duration: number
        }
    }
}

export class LoginService<U extends object> {
    @Inject
    private tokenStorage: Storage<string, string>

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
            const { jwt } = this.configuration

            const googleUser = await this.google.userInfo(accessToken)

            const user = await this.userRepository.getUserByGoogleUser(googleUser)
            const expirationDate = (new Date().getTime() + (jwt.duration || 0)) / 1000
            const privateKey = this.privateKey

            const token = await TokenGenerator.generateJWT<U>(user, {
                expirationDate,
                privateKey,
                algorithm: jwt.algorithm,
            })

            const refreshToken = md5(user)
            await this.tokenStorage.set(refreshToken, JSON.stringify(user))
            await this.tokenStorage.expireIn(refreshToken, jwt.refreshToken.duration)

            return {
                user,
                token,
                refreshToken: {
                    token: refreshToken,
                    duration: jwt.refreshToken.duration,
                },
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
