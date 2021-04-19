import { ServiceAuthenticator } from 'typescript-rest'
import { Request, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ForbiddenError } from '@jsfsi-core/typescript-cross-platform'
import { HttpError } from 'typescript-rest/dist/server/model/errors'
import { TokenGenerator } from '../../../TokenGenerator'
import { Logger } from '../../../Logger'
import { errorHandler } from '../ErrorHandler'
import { JWTRequest } from './JWTRequest'
import { parseJWTToken } from './AuthenticationHeaderParser'

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
    Logger.debug('Process roles in JWTAuthenticator')
    return (request && (request as JWTRequest<U>).user?.roles) || []
  }

  initialize() {
    // NOTE: nothing to do
  }

  getMiddleware(): RequestHandler<ParamsDictionary> {
    return async (request, response, next) => {
      Logger.debug('Process authorization header in JWTAuthenticator')
      let error: HttpError
      const jwt = parseJWTToken(request, this.cookie)

      try {
        request.user = await TokenGenerator.verifyJWT<U>(jwt, {
          publicKey: Buffer.from(this.publicKeyBase64, 'base64'),
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
