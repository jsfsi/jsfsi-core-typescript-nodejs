import { ServiceAuthenticator } from 'typescript-rest'
import { Request, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenGenerator } from '../../TokenGenerator'
import { Logger } from '../../Logger'

const BEARER_LENGTH = 'Bearer '.length

export interface UserToken {
    roles: string[]
}

export interface JWTRequest<U> extends Request {
    user: U
}

export class JWTAuthenticator<U extends UserToken> implements ServiceAuthenticator {
    constructor(private publicKeyBase64: string, private algorithm: string) {}

    getRoles(request: Request<ParamsDictionary>) {
        return (request && (request as JWTRequest<U>).user?.roles) || []
    }

    initialize() {
        // NOTE: nothing to do
    }

    getMiddleware(): RequestHandler<ParamsDictionary> {
        return async (request, __, next) => {
            const authorizationHeader = request.headers?.authorization

            if (authorizationHeader) {
                const jwt = authorizationHeader.substring(
                    BEARER_LENGTH,
                    authorizationHeader.length,
                )

                try {
                    request.user =
                        jwt &&
                        (await TokenGenerator.verifyJWT<U>(jwt, {
                            publicKey: Buffer.from(this.publicKeyBase64, 'base64'),
                            algorithms: [this.algorithm],
                        }))
                } catch (error) {
                    Logger.warn('Failed to verify JWT', error)
                }
            }

            next()
        }
    }
}
