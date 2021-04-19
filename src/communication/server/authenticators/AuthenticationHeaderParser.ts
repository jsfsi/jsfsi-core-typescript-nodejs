import { Request } from 'express'

const BEARER_LENGTH = 'Bearer '.length

export const parseJWTToken = (request: Request, cookie: string) =>
  parseAuthorizationHeader(request) || parseCookieHeader(request, cookie)

const parseAuthorizationHeader = (request: Request) => {
  const authorizationHeader = request.headers?.authorization
  return authorizationHeader?.substring(BEARER_LENGTH, authorizationHeader.length)
}

const parseCookieHeader = (request: Request, cookie: string) => {
  return request.cookies[cookie] as string
}
