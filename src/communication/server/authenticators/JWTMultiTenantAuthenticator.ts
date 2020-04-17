import { ServiceAuthenticator } from 'typescript-rest'
import { Request, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenGenerator } from '../../../TokenGenerator'
import { Logger } from '../../../Logger'
import { JWTRequest } from './JWTRequest'

const BEARER_LENGTH = 'Bearer '.length

export const TENANT_HEADER = 'X-Api-Tenant'
export const ADMIN_ROLE = 'admin'

export interface TenantToken {
    isAdmin: boolean
    roles: string[]
}

export interface UserTenantsToken {
    tenants: { [key: string]: TenantToken }
}

export class JWTMultiTenantAuthenticator<U extends UserTenantsToken>
    implements ServiceAuthenticator {
    constructor(private publicKeyBase64: string, private algorithm: string) {}

    getRoles(request: Request<ParamsDictionary>) {
        const tenantId = request.get(TENANT_HEADER)
        const user = request && (request as JWTRequest<U>).user
        const tenant = user?.tenants?.[tenantId]

        let roles: string[] = []

        if (tenant) {
            roles = tenant.roles
            tenant.isAdmin && roles.push(ADMIN_ROLE)
        }

        return roles
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
