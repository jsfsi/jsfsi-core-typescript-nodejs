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
    BadRequestError,
} from '@jsfsi-core/typescript-cross-platform'

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
        const statusCode =
            error.statusCode ||
            (error.name == ValidationError.name && StatusCode.BAD_REQUEST) ||
            (error.name == BadRequestError.name && StatusCode.BAD_REQUEST) ||
            (error.name == UnauthorizedError.name && StatusCode.UNAUTHORIZED) ||
            (error.name == ForbiddenError.name && StatusCode.FORBIDDEN) ||
            (error.name == NotFoundError.name && StatusCode.NOT_FOUND) ||
            (error.name == InternalServerError.name &&
                StatusCode.INTERNAL_SERVER_ERROR) ||
            (error.name == AuthenticationTimeoutError.name &&
                StatusCode.AUTHENTICATION_TIMEOUT) ||
            StatusCode.INTERNAL_SERVER_ERROR

        const location = (error as UnauthorizedError)?.location

        Logger.debug('Default error handler:', statusCode, error.name, error.message)

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
