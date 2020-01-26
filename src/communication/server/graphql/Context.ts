import { Response, Request } from 'express'

export interface Context {
    request: Request
    response: Response
}
