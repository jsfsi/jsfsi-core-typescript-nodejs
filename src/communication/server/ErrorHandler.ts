import { Errors } from 'typescript-rest'
import { HttpRequest, HttpResponse } from './HttpServer'
import { NextFunction } from 'express-serve-static-core'
import { Logger } from '../../Logger'
import {
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    AuthenticationTimeoutError,
    StatusCode,
    InternalServerError,
} from '@jsfsi-core/typescript-cross-platform'
import { BadRequestError } from 'typescript-rest/dist/server/model/errors'

export type ErrorHandler = (
    error: Error & Errors.HttpError,
    request: HttpRequest,
    response: HttpResponse,
    next: NextFunction,
) => void

export const errorHandler = (
    error: Error & Errors.HttpError,
    _: HttpRequest,
    response: HttpResponse,
    __: NextFunction,
) => {
    if (error) {
        Logger.debug('ValidationError', ValidationError.name)

        const statusCode =
            error.statusCode ||
            (error instanceof ValidationError && StatusCode.BAD_REQUEST) ||
            (error instanceof BadRequestError && StatusCode.BAD_REQUEST) ||
            (error instanceof UnauthorizedError && StatusCode.UNAUTHORIZED) ||
            (error instanceof ForbiddenError && StatusCode.FORBIDDEN) ||
            (error instanceof NotFoundError && StatusCode.NOT_FOUND) ||
            (error instanceof InternalServerError && StatusCode.INTERNAL_SERVER_ERROR) ||
            (error instanceof AuthenticationTimeoutError &&
                StatusCode.AUTHENTICATION_TIMEOUT) ||
            StatusCode.INTERNAL_SERVER_ERROR

        const location = (error as UnauthorizedError).location

        Logger.debug(
            'Default error handler:',
            statusCode,
            typeof error,
            error.name,
            error.message,
        )

        // Remove errors trace from the message that will be send to client
        const message =
            statusCode === StatusCode.INTERNAL_SERVER_ERROR
                ? 'Internal Server Error'
                : error.message

        if (statusCode >= 500) {
            Logger.error(error)
        }

        response.status(statusCode).send({ error: message, location })
    }
}
