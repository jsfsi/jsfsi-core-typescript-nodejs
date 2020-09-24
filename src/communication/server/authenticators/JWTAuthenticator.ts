import { ServiceAuthenticator } from 'typescript-rest'
import { Request, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenGenerator } from '../../../TokenGenerator'
import { Logger } from '../../../Logger'
import { JWTRequest } from './JWTRequest'
import { parseJWTToken } from './AuthenticationHeaderParser'
import { ForbiddenError } from '@jsfsi-core/typescript-cross-platform'

export interface UserToken {
    roles: string[]
}

export class JWTAuthenticator<U extends UserToken> implements ServiceAuthenticator {
    constructor(
        private publicKeyBase64: string,
        private algorithm: string,
        private cookie?: string,
    ) {}

    getRoles(request: Request<ParamsDictionary>) {
        return (request && (request as JWTRequest<U>).user?.roles) || []
    }

    initialize() {
        // NOTE: nothing to do
    }

    getMiddleware(): RequestHandler<ParamsDictionary> {
        return async (request, __, next) => {
            Logger.debug('Process authorization header in JWTAuthenticator')
            const jwt = parseJWTToken(request, this.cookie)

            if (jwt) {
                try {
                    request.user = await TokenGenerator.verifyJWT<U>(jwt, {
                        publicKey: Buffer.from(this.publicKeyBase64, 'base64'),
                        algorithms: [this.algorithm],
                    })
                } catch (error) {
                    Logger.warn('Failed to verify JWT', error)
                    throw new ForbiddenError('Failed to verify JWT')
                }
            }

            next()
        }
    }
}
