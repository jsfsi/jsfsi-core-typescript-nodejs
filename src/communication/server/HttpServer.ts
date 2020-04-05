import { OptionsJson } from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { Server } from 'typescript-rest'
import { Logger } from '../../Logger'
import { errorHandler as defaultErrorHandler, ErrorHandler } from './ErrorHandler'
import { SwaggerOptions, buildSwaggerOptions, setupSwagger } from './Swagger'
import { setupGraphQL, GraphqlOptions } from './GraphQL'
import { HateoasRules, setupHateoasRules } from './Hateoas'

const DEFAULT_PORT = 8080

export type HttpRequest = Request
export type HttpResponse = Response

interface CookieParserOptions {
    secret?: string
}

export class HttpServerBuilder {
    private _port: number
    private _corsDomains: string
    private _swaggerOptions: SwaggerOptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _controllers: Array<any>
    private _errorHandler: ErrorHandler
    private _jsonOptions: OptionsJson
    private _cookieParserOptions: CookieParserOptions
    private _graphqlOptions: GraphqlOptions
    private _hateoasRules: HateoasRules

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    public withHateoasRules(rules: HateoasRules) {
        this._hateoasRules = rules
        return this
    }

    public build() {
        return new HttpServer(this)
    }
}

export class HttpServer {
    private _application: Application
    private builder: HttpServerBuilder

    constructor(builder: HttpServerBuilder) {
        this.builder = builder
        this._application = express()
    }

    public get application() {
        return this._application
    }

    private setupCors() {
        if (!this.builder.corsDomains) {
            return
        }

        this._application.use(
            cors({
                origin: (this.builder.corsDomains || '')
                    .split(',')
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
        if (this.builder.hateoasRules && Object.keys(this.builder.hateoasRules).length) {
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

    public async start(): Promise<void> {
        this.setupCookieParser()
        this.setupCors()
        this.setupJsonParse()
        this.setupSwagger()
        this.setupHateoasRules()
        this.setupControllers()
        this.setupErrorHandler()
        this.setupGraphql()

        this._application.set('trust proxy', true)

        return new Promise<void>(resolve => {
            this._application.listen(this.builder.port, () => {
                Logger.info(`Server listening on port ${this.builder.port}`)
                resolve()
            })
        })
    }
}
