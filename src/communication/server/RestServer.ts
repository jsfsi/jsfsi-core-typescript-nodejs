import { OptionsJson } from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { Errors, Server } from 'typescript-rest'
import { Assets } from '@jsfsi-core/typescript-cross-platform'
import { Logger } from '../../Logger'
import { errorHandler as defaultErrorHandler } from './errors'

export type RestRequest = Request
export type RestResponse = Response

export type ErrorHandler = (
    error: Error & Errors.HttpError,
    request: RestRequest,
    response: RestResponse,
    next: NextFunction,
) => void

export interface SwaggerOptions {
    /** When specified overrides the value that exists in the generated swagger.json. */
    version?: string
    /** The path to the swagger file. Default is './dist/swagger.json'. */
    swaggerFilePath?: string
    /** Changes the label that shows up the the browser tab. Default is 'Focus-BC - Docs' */
    pageTitle?: string
    /** Changes the background color of the header bar. */
    headerColor?: string
    /** Changes the logo in the header bar. Default is the focus logo */
    logoFilePath?: string
    /** Changes the favicon. Default is the focus logo */
    faviconFilePath?: string
}

interface CookieParserOptions {
    secret?: string
}

export class RestServerBuilder {
    private static readonly defaultLogo = Assets.focusLogo
    private static readonly defaultFavicon = Assets.focusFavicon
    private static readonly defaultTitle = 'Focus-BC - Docs'
    private static readonly defaultHeaderColor = '#cccccc'
    private static readonly defaultSwaggerFile = './dist/swagger.json'
    private static readonly defaultPort = 8080

    private _port: number
    private _corsDomains: string
    private _swaggerOptions: SwaggerOptions
    private _controllers: Array<any>
    private _errorHandler: ErrorHandler
    private _jsonOptions: OptionsJson
    private _cookieParserOptions: CookieParserOptions

    public get port() {
        return this._port
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

    private encodeImgToBase64(imagePath: string) {
        const extension = path.extname(imagePath).substr(1)
        const content = fs.readFileSync(imagePath, 'base64')
        return `data:image/${extension};base64,${content}`
    }

    public withPort(port: number) {
        this._port = port || RestServerBuilder.defaultPort
        return this
    }

    public withCors(corsDomains: string) {
        this._corsDomains = corsDomains
        return this
    }

    public withSwagger(swaggerOptions?: SwaggerOptions) {
        let opts = swaggerOptions

        if (!opts) {
            opts = {}
        }

        this._swaggerOptions = {
            version: opts.version,
            swaggerFilePath: opts.swaggerFilePath || RestServerBuilder.defaultSwaggerFile,
            pageTitle: opts.pageTitle || RestServerBuilder.defaultTitle,
            headerColor: opts.headerColor || RestServerBuilder.defaultHeaderColor,
            faviconFilePath: opts.faviconFilePath
                ? this.encodeImgToBase64(opts.faviconFilePath)
                : RestServerBuilder.defaultFavicon,
            logoFilePath: opts.logoFilePath ? this.encodeImgToBase64(opts.logoFilePath) : RestServerBuilder.defaultLogo,
        }

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

    public build() {
        return new RestServer(this)
    }
}

export class RestServer {
    private _application: Application
    private builder: RestServerBuilder

    constructor(builder: RestServerBuilder) {
        this.builder = builder
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
                origin: (this.builder.corsDomains || '').split(',').map(regExp => new RegExp(regExp)),
                maxAge: 5,
                exposedHeaders: ['X-Api-Version', 'X-Request-Id', 'X-Response-Time'],
                credentials: true,
            }),
        )
    }

    private setupSwagger() {
        if (this.builder.swaggerOptions) {
            const opts = this.builder.swaggerOptions
            const favicon = opts.faviconFilePath
            const logo = opts.logoFilePath
            const pageTitle = opts.pageTitle
            const swaggerConfig = JSON.parse(fs.readFileSync(opts.swaggerFilePath, 'utf8'))
            const customCss = `.swagger-ui .topbar { background-color: ${opts.headerColor} }
                            .swagger-ui .topbar-wrapper img { content:url(\'${logo}\') }`

            if (opts.version) {
                swaggerConfig.info.version = opts.version
            }

            this._application.use(
                '/docs',
                swaggerUi.serve,
                swaggerUi.setup(swaggerConfig, null, null, customCss, favicon, null, pageTitle),
            )
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

    public async start(): Promise<void> {
        this._application = express()
        Server.useIoC()
        this.setupCookieParser()
        this.setupCors()
        this.setupJsonParse()
        this.setupSwagger()
        this.setupControllers()
        this.setupErrorHandler()

        return new Promise<void>(resolve => {
            this._application.listen(this.builder.port, () => {
                Logger.info(`Server listening on port ${this.builder.port}`)
                resolve()
            })
        })
    }
}
