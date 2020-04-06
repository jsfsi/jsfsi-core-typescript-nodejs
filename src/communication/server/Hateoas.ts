import mung from 'express-mung'
import { Request, Response, Application } from 'express'
import { Link, InternalServerError } from '@jsfsi-core/typescript-cross-platform'

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

export const setupHateoasRules = (application: Application, rules: HateoasRules) => {
    hateoasParser = new HateoasParser(rules)
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
            links[key] = this.processEntity(entity, request, response)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private processEntity = (entity: any, request?: Request, response?: Response) => {
        const entityClass = entity?.constructor?.name
        if (!this.rules[entityClass] && entityClass !== Link.name) {
            throw new InternalServerError(
                `The entity class ${entityClass} doesn't have a HateoasRule defined`,
            )
        }

        return this.rules[entityClass]
            ? this.rules[entityClass](entity, request, response)
            : entity
    }
}
