import { ServiceAuthenticator } from 'typescript-rest'
import { Request, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ForbiddenError, UserTenantToken } from '@jsfsi-core/typescript-cross-platform'
import { HttpError } from 'typescript-rest/dist/server/model/errors'
import { TokenGenerator } from '../../../TokenGenerator'
import { Logger } from '../../../Logger'
import { errorHandler } from '..'
import { JWTRequest } from './JWTRequest'
import { parseJWTToken } from './AuthenticationHeaderParser'

export const TENANT_HEADER = 'X-Api-Tenant'
export const ADMIN_ROLE = 'admin'

export class JWTTenantAuthenticator<U extends UserTenantToken>
  implements ServiceAuthenticator
{
  constructor(
    private publicKeyBase64: string,
    private algorithm: string,
    private cookie?: string,
  ) {}

  private publicKey: Buffer

  getRoles(request: Request<ParamsDictionary>) {
    Logger.debug('Process roles in JWTTenantAuthenticator')
    const user = request && (request as JWTRequest<U>).user

    let roles: string[] = []

    if (user?.tenant?.roles) {
      roles = roles.concat(user.tenant.roles)
    }

    if (user?.isAdmin) {
      roles.push(ADMIN_ROLE)
    }

    return roles
  }

  initialize() {
    // NOTE: nothing to do
  }

  getMiddleware(): RequestHandler<ParamsDictionary> {
    return async (request, response, next) => {
      Logger.debug('Process authorization header in JWTTenantAuthenticator')
      let error: HttpError
      const jwt = parseJWTToken(request, this.cookie)

      if (!this.publicKey) {
        this.publicKey = Buffer.from(this.publicKeyBase64, 'base64')
      }

      try {
        request.user = await TokenGenerator.verifyJWT<U>(jwt, {
          publicKey: this.publicKey,
          algorithms: [this.algorithm],
        })
      } catch (validationError) {
        Logger.warn('Failed to verify JWT', validationError)
        error = new ForbiddenError('Failed to verify JWT') as HttpError
      }

      if (error) {
        errorHandler(error, request, response, next)
      } else {
        next()
      }
    }
  }
}
