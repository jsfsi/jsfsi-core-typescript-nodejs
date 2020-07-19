import mung from 'express-mung'
import { Request, Response, Application } from 'express'
import { Link, InternalServerError } from '@jsfsi-core/typescript-cross-platform'
import { Logger } from '../../Logger'

// TODO: Improve this file to use types instead of any

let hateoasParser: HateoasParser

export type HateoasRules = {
    [entityType: string]: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entity: any,
        request?: Request,
        response?: Response,
    ) => Link | Link[]
}

export class SimpleHateoasRule extends Link {}

export const setupHateoasRules = (application: Application, rules: HateoasRules) => {
    const rulesCollection = {
        ...rules,
        SimpleHateoasRule: (entity: SimpleHateoasRule, request: Request) => {
            return {
                ...entity,
                href: `${request.protocol}://${request.get('Host')}${entity.href}`,
            } as Link
        },
    }
    hateoasParser = new HateoasParser(rulesCollection)
    application.use(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mung.json((body: any, request, response) => {
            return hateoasParser.parseLinks(body, request, response)
        }),
    )
}

export class HateoasParser {
    constructor(private rules: HateoasRules) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public parseLinks = (body: any, request?: Request, response?: Response) => {
        if (body) {
            Object.keys(body).forEach(key => {
                if (key === '_links') {
                    this.parseBodyLinks(body._links, request, response)
                } else {
                    if (typeof body[key] === 'object') {
                        body[key] = this.parseLinks(body[key], request, response)
                    }
                }
            })
        }

        return body
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parseBodyLinks = (links: any, request?: Request, response?: Response) => {
        Object.keys(links).forEach(key => {
            const entity = links[key]
            Logger.debug(`Hateoas process body link: ${key}`)
            links[key] = this.processEntity(entity, request, response)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processEntity = (entity: any, request?: Request, response?: Response) => {
        const entityClass = entity?.constructor?.name
        if (!this.rules[entityClass] && entityClass !== Link.name) {
            throw new InternalServerError(
                `The entity class ${entityClass} doesn't have a HateoasRule defined: ${JSON.stringify(
                    entity || {},
                )}`,
            )
        }

        return this.rules[entityClass]
            ? this.rules[entityClass](entity, request, response)
            : entity
    }
}
