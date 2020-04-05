import { HateoasRules, HateoasParser } from '../../src'
import { Link, HttpMethods } from '@jsfsi-core/typescript-cross-platform'
import { ValidationError } from '@jsfsi-core/typescript-cross-platform'

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
            return {
                rel: entity.constructor.name,
                method: HttpMethods.GET,
                href: `${request.protocol}://${request.get('Host')}/test/${entity.id}`,
            } as Link
        },
        SubTestEntity: (entity: SubTestEntity, request) => {
            return {
                rel: entity.constructor.name,
                method: HttpMethods.GET,
                href: `${request.protocol}://${request.get('Host')}/subtest/${entity.id}`,
                target: entity.action,
            } as Link
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
                test: {
                    rel: 'TestEntity',
                    href: 'http://testdomain/test/124',
                    method: 'get',
                },
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
                test: {
                    rel: 'TestEntity',
                    href: 'https://testdomain/test/124',
                    method: 'get',
                },
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
                    subtest: {
                        rel: 'SubTestEntity',
                        href: 'http://testdomain/subtest/421',
                        method: 'get',
                        target: 'something',
                    },
                },
            },
            _links: {
                test: {
                    rel: 'TestEntity',
                    href: 'http://testdomain/test/124',
                    method: 'get',
                },
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
        ).toThrow(ValidationError)
    })
})
