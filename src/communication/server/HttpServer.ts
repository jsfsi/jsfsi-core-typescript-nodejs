/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as ExpressServer } from 'http'
import { OptionsJson } from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response, NextFunction } from 'express'
import { Server, ServiceAuthenticator } from 'typescript-rest'
import { StatusCode } from '@jsfsi-core/typescript-cross-platform'
import { Logger } from '../../Logger'
import { MemoryStorage, Storage } from '../..'
import { errorHandler as defaultErrorHandler, ErrorHandler } from './ErrorHandler'
import { SwaggerOptions, buildSwaggerOptions, setupSwagger } from './Swagger'
import { setupGraphQL, GraphqlOptions } from './GraphQL'
import { HateoasRules, setupHateoasRules } from './Hateoas'

const DEFAULT_PORT = 8080

export enum CUSTOM_MIDDLEWARE_ORDER {
  BEFORE_CONTROLLERS,
  AFTER_CONTROLLERS,
}

export type HttpRequest = Request
export type HttpResponse = Response
export type CustomMiddleware = (
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
) => any
type CustomMiddlewares = {
  [key: string]: CustomMiddleware[]
}

interface CookieParserOptions {
  secret?: string
}

export class HttpServerBuilder {
  private _port: number
  private _corsDomains: string
  private _swaggerOptions: SwaggerOptions
  private _controllers: Array<any>
  private _errorHandler: ErrorHandler
  private _jsonOptions: OptionsJson
  private _cookieParserOptions: CookieParserOptions
  private _graphqlOptions: GraphqlOptions
  private _hateoasRules: HateoasRules
  private _authenticator: ServiceAuthenticator
  private _cacheEtag: boolean
  private _customMiddlewares: CustomMiddlewares = {
    [CUSTOM_MIDDLEWARE_ORDER.BEFORE_CONTROLLERS]: [],
    [CUSTOM_MIDDLEWARE_ORDER.AFTER_CONTROLLERS]: [],
  }

  public get port() {
    return this._port || 8080
  }

  public get corsDomains() {
    return this._corsDomains
  }

  public get swaggerOptions() {
    return this._swaggerOptions
  }

  public get controllers() {
    return this._controllers
  }

  public get errorHandler() {
    return this._errorHandler
  }

  public get jsonOptions() {
    return this._jsonOptions
  }

  public get cookieParserOptions() {
    return this._cookieParserOptions
  }

  public get graphqlOptions() {
    return this._graphqlOptions
  }

  public get hateoasRules(): HateoasRules {
    return this._hateoasRules
  }

  public get authenticator(): ServiceAuthenticator {
    return this._authenticator
  }

  public get cacheEtag(): boolean {
    return this._cacheEtag
  }

  public get customMiddlewares(): CustomMiddlewares {
    return this._customMiddlewares
  }

  public withPort(port: number) {
    this._port = port || DEFAULT_PORT
    return this
  }

  public withCors(corsDomains: string) {
    this._corsDomains = corsDomains
    return this
  }

  public withSwagger(swaggerOptions?: SwaggerOptions) {
    this._swaggerOptions = buildSwaggerOptions(swaggerOptions)

    return this
  }

  public withControllers(controllers: Array<any>) {
    this._controllers = controllers
    return this
  }

  public withErrorHandler(errorHandler: ErrorHandler) {
    this._errorHandler = errorHandler
    return this
  }

  public withJsonParse(options: OptionsJson) {
    this._jsonOptions = options
    return this
  }

  public withCookieParser(options: CookieParserOptions) {
    this._cookieParserOptions = options
    return this
  }

  public withGraphql(options: GraphqlOptions) {
    this._graphqlOptions = options
    return this
  }

  public withHateoasRules(rules: HateoasRules = {}) {
    this._hateoasRules = rules
    return this
  }

  public withAuthenticator(authenticator: ServiceAuthenticator) {
    this._authenticator = authenticator
    return this
  }

  public withCacheEtag() {
    this._cacheEtag = true
    return this
  }

  public withCustomMiddleware(
    order: CUSTOM_MIDDLEWARE_ORDER,
    middleware: CustomMiddleware,
  ) {
    this._customMiddlewares[order].push(middleware)
    return this
  }

  public build() {
    return new HttpServer(this)
  }
}

export class HttpServer {
  private _application: Application
  private _server: ExpressServer
  private builder: HttpServerBuilder
  private etagStorage: Storage<string, string> = new MemoryStorage()

  constructor(builder: HttpServerBuilder) {
    this.builder = builder
    this._application = express()
  }

  public get application() {
    return this._application
  }

  public get server(): ExpressServer {
    return this._server
  }

  private setupCors() {
    if (!this.builder.corsDomains) {
      return
    }

    this._application.use(
      cors({
        origin: (this.builder.corsDomains || '')
          .split(',')
          // eslint-disable-next-line security-node/non-literal-reg-expr
          .map(regExp => new RegExp(regExp)),
        maxAge: 5,
        exposedHeaders: ['X-Api-Version', 'X-Request-Id', 'X-Response-Time'],
        credentials: true,
      }),
    )
  }

  private setupSwagger() {
    if (this.builder.swaggerOptions) {
      setupSwagger(this._application, this.builder.swaggerOptions)
    }
  }

  private setupControllers() {
    if (this.builder.controllers) {
      Server.buildServices(this._application, ...this.builder.controllers)
    }
  }

  private setupErrorHandler() {
    this._application.use(this.builder.errorHandler || defaultErrorHandler)
  }

  private setupHateoasRules() {
    if (this.builder.hateoasRules) {
      setupHateoasRules(this._application, this.builder.hateoasRules)
    }
  }

  private setupJsonParse() {
    if (this.builder.jsonOptions) {
      this._application.use(express.json(this.builder.jsonOptions))
    }
  }

  private setupCookieParser() {
    if (this.builder.cookieParserOptions) {
      this._application.use(cookieParser(this.builder.cookieParserOptions.secret))
    }
  }

  private async setupGraphql() {
    if (this.builder.graphqlOptions) {
      await setupGraphQL(this._application, this.builder.graphqlOptions)
    }
  }

  private setupAuthenticator() {
    if (this.builder.authenticator) {
      Server.registerAuthenticator(this.builder.authenticator)
    }
  }

  private setupCacheEtag() {
    if (this.builder.cacheEtag) {
      this.builder
        .withCustomMiddleware(
          CUSTOM_MIDDLEWARE_ORDER.BEFORE_CONTROLLERS,
          async (request, response, next) => {
            const etag = request.header('if-none-match') as string
            const cachedEtag = await this.etagStorage.get(request.url)

            if (etag && cachedEtag === etag) {
              response.statusCode = StatusCode.NOT_MODIFIED
              response.setHeader('etag', etag)
              response.send()
            } else {
              next()
            }
          },
        )
        .withCustomMiddleware(
          CUSTOM_MIDDLEWARE_ORDER.AFTER_CONTROLLERS,
          async (request, response, next) => {
            const etag = response.getHeader('etag') as string
            if (etag) {
              await this.etagStorage.set(request.url, etag)
            }
            next()
          },
        )
    }
  }

  private setupCustomMiddlewares(order: CUSTOM_MIDDLEWARE_ORDER) {
    this.builder.customMiddlewares[order].forEach(middleware =>
      this._application.use(middleware),
    )
  }

  public async setup(): Promise<void> {
    this.setupCookieParser()
    this.setupCors()
    this.setupJsonParse()
    this.setupCacheEtag()
    this.setupCustomMiddlewares(CUSTOM_MIDDLEWARE_ORDER.BEFORE_CONTROLLERS)
    this.setupAuthenticator()
    this.setupSwagger()
    this.setupHateoasRules()
    this.setupControllers()
    this.setupErrorHandler()
    await this.setupGraphql()
    this.setupCustomMiddlewares(CUSTOM_MIDDLEWARE_ORDER.AFTER_CONTROLLERS)

    this._application.set('trust proxy', true)
  }

  public async start(): Promise<void> {
    await this.setup()
    return new Promise<void>(resolve => {
      this._server = this._application.listen(this.builder.port, () => {
        Logger.info(`Server listening on port ${this.builder.port}`)
        resolve()
      })
    })
  }
}
