import { Errors } from 'typescript-rest'
import { RestRequest, RestResponse } from '../RestServer'
import { NextFunction } from 'express-serve-static-core'
import { Logger } from '../../../Logger'
import {
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    AuthenticationTimeoutError,
    StatusCode,
} from '@jsfsi-core/typescript-cross-platform'

export const errorHandler = (
    error: Error & Errors.HttpError,
    _: RestRequest,
    response: RestResponse,
    __: NextFunction,
) => {
    if (error) {
        const statusCode =
            error.statusCode ||
            (error instanceof ValidationError && StatusCode.BAD_REQUEST) ||
            (error instanceof UnauthorizedError && StatusCode.UNAUTHORIZED) ||
            (error instanceof ForbiddenError && StatusCode.FORBIDDEN) ||
            (error instanceof NotFoundError && StatusCode.NOT_FOUND) ||
            (error instanceof AuthenticationTimeoutError && StatusCode.AUTHENTICATION_TIMEOUT) ||
            StatusCode.INTERNAL_SERVER_ERROR

        const location = (error as UnauthorizedError).location

        // Remove errors trace from the message that will be send to client
        const message = statusCode === StatusCode.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : error.message

        if (statusCode >= 500) {
            Logger.error(error)
        }

        response.status(statusCode).send({ error: message, location })
    }
}
