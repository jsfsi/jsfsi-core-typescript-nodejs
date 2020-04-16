import { Request } from 'express'

export interface JWTRequest<U> extends Request {
    user: U
}
