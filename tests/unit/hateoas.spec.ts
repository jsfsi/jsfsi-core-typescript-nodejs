import { HateoasRules, HateoasParser } from '../../src'
import {
    Link,
    HttpMethods,
    InternalServerError,
} from '@jsfsi-core/typescript-cross-platform'

class TestEntity {
    constructor(public name: string, public id: string) {}
}

class SubTestEntity extends TestEntity {
    public action = 'something'
}

const mockedHttpRequest = {
    get: jest.fn().mockReturnValue('testdomain'),
    protocol: 'http',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const mockedHttpsRequest = {
    get: jest.fn().mockReturnValue('testdomain'),
    protocol: 'https',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

describe('Parse hateoas', () => {
    const hateoasRules: HateoasRules = {
        TestEntity: (entity: TestEntity, request) => {
            return Object.assign(new Link(), {
                rel: entity.constructor.name,
                method: HttpMethods.GET,
                href: `${request.protocol}://${request.get('Host')}/test/${entity.id}`,
            })
        },
        SubTestEntity: (entity: SubTestEntity, request) => {
            return Object.assign(new Link(), {
                rel: entity.constructor.name,
                method: HttpMethods.GET,
                href: `${request.protocol}://${request.get('Host')}/subtest/${entity.id}`,
                target: entity.action,
            })
        },
    }

    const hateoasParser = new HateoasParser(hateoasRules)

    it('Entity with 1 level fields and http protocol with success', () => {
        const hateoasEntity = hateoasParser.parseLinks(
            {
                test: 'test',
                _links: {
                    test: new TestEntity('link test', '124'),
                },
            },
            mockedHttpRequest,
        )

        expect(hateoasEntity).toStrictEqual({
            test: 'test',
            _links: {
                test: Object.assign(new Link(), {
                    rel: 'TestEntity',
                    href: 'http://testdomain/test/124',
                    method: 'get',
                }),
            },
        })
    })

    it('Entity with 1 level fields and https protocol with success', () => {
        const hateoasEntity = hateoasParser.parseLinks(
            {
                test: 'test',
                _links: {
                    test: new TestEntity('link test', '124'),
                },
            },
            mockedHttpsRequest,
        )

        expect(hateoasEntity).toStrictEqual({
            test: 'test',
            _links: {
                test: Object.assign(new Link(), {
                    rel: 'TestEntity',
                    href: 'https://testdomain/test/124',
                    method: 'get',
                }),
            },
        })
    })

    it('Entity with multi level fields and http protocol with success', () => {
        const hateoasEntity = hateoasParser.parseLinks(
            {
                test: 'test',
                subTest: {
                    name: 'subtest',
                    _links: {
                        subtest: new SubTestEntity('link subtest', '421'),
                    },
                },
                _links: {
                    test: new TestEntity('link test', '124'),
                },
            },
            mockedHttpRequest,
        )

        expect(hateoasEntity).toStrictEqual({
            test: 'test',
            subTest: {
                name: 'subtest',
                _links: {
                    subtest: Object.assign(new Link(), {
                        rel: 'SubTestEntity',
                        href: 'http://testdomain/subtest/421',
                        method: 'get',
                        target: 'something',
                    }),
                },
            },
            _links: {
                test: Object.assign(new Link(), {
                    rel: 'TestEntity',
                    href: 'http://testdomain/test/124',
                    method: 'get',
                }),
            },
        })
    })

    it('Entity of type Link should not raise an exception', () => {
        const hateoasEntity = hateoasParser.parseLinks(
            {
                test: 'test',
                _links: {
                    test: Object.assign(new Link(), {
                        rel: 'test',
                    }),
                },
            },
            mockedHttpRequest,
        )

        expect(hateoasEntity).toStrictEqual({
            test: 'test',
            _links: {
                test: Object.assign(new Link(), {
                    rel: 'test',
                }),
            },
        })
    })

    it('Entity without hateoas rule defined', () => {
        expect(() =>
            hateoasParser.parseLinks(
                {
                    test: 'test',
                    _links: {
                        test: {},
                    },
                },
                mockedHttpRequest,
            ),
        ).toThrow(InternalServerError)
    })
})
