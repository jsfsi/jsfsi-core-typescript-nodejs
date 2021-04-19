import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import { Application } from 'express'
import { Assets } from '@jsfsi-core/typescript-cross-platform'

import { encodeImgToBase64 } from '../../Images'
import { Logger } from '../../Logger'

const DEFAULT_LOGO = Assets.jsfsiLogo
const DEFAULT_FAVICON = Assets.jsfsiFavicon
const DEFAULT_TITLE = 'JSFSI - Docs'
const DEFAULT_HEADER_COLOR = '#FFFFFF'
const DEFAULT_SWAGGER_FILE = './dist/swagger.json'

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
  /** Set the endpoint path for swagger page */
  docsEndpoint?: string
}

export const buildSwaggerOptions = (options: SwaggerOptions = {}) => {
  return {
    version: options.version,
    swaggerFilePath: options.swaggerFilePath || DEFAULT_SWAGGER_FILE,
    pageTitle: options.pageTitle || DEFAULT_TITLE,
    headerColor: options.headerColor || DEFAULT_HEADER_COLOR,
    faviconFilePath: options.faviconFilePath
      ? encodeImgToBase64(options.faviconFilePath)
      : DEFAULT_FAVICON,
    logoFilePath: options.logoFilePath
      ? encodeImgToBase64(options.logoFilePath)
      : DEFAULT_LOGO,
    docsEndpoint: options.docsEndpoint,
  }
}

export const setupSwagger = (application: Application, options: SwaggerOptions) => {
  const favicon = options.faviconFilePath
  const logo = options.logoFilePath
  const pageTitle = options.pageTitle
  const swaggerConfig = JSON.parse(fs.readFileSync(options.swaggerFilePath, 'utf8'))
  const customCss = `.swagger-ui .topbar { background-color: ${options.headerColor} }
                  .swagger-ui .topbar-wrapper img { content:url(\'${logo}\') }`

  if (options.version) {
    swaggerConfig.info.version = options.version
  }

  const docsEndpoint = options.docsEndpoint || '/docs'
  Logger.info(`Swagger available in path: ${docsEndpoint}`)

  application.use(
    docsEndpoint,
    swaggerUi.serve,
    swaggerUi.setup(swaggerConfig, null, null, customCss, favicon, null, pageTitle),
  )
}
