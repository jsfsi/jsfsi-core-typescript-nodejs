import {
  Link,
  HttpMethods,
  InternalServerError,
  Page,
} from '@jsfsi-core/typescript-cross-platform'
import { HateoasRules, HateoasParser, Logger } from '../../src'

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
      return new Link({
        rel: entity.constructor.name,
        method: HttpMethods.GET,
        href: `${request.protocol}://${request.get('Host')}/test/${entity.id}`,
      })
    },
    SubTestEntity: (entity: SubTestEntity, request) => {
      return new Link({
        rel: entity.constructor.name,
        method: HttpMethods.GET,
        href: `${request.protocol}://${request.get('Host')}/subtest/${entity.id}`,
        target: entity.action,
      })
    },
  }

  const hateoasParser = new HateoasParser(hateoasRules)

  beforeAll(() => {
    Logger.configure('info')
  })

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
        test: new Link({
          rel: 'TestEntity',
          href: 'http://testdomain/test/124',
          method: HttpMethods.GET,
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
        test: new Link({
          rel: 'TestEntity',
          href: 'https://testdomain/test/124',
          method: HttpMethods.GET,
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
          subtest: new Link({
            rel: 'SubTestEntity',
            href: 'http://testdomain/subtest/421',
            method: HttpMethods.GET,
            target: 'something',
          }),
        },
      },
      _links: {
        test: new Link({
          rel: 'TestEntity',
          href: 'http://testdomain/test/124',
          method: HttpMethods.GET,
        }),
      },
    })
  })

  it('Entity of type Link should not raise an exception', () => {
    const hateoasEntity = hateoasParser.parseLinks(
      {
        test: 'test',
        _links: {
          test: new Link({
            rel: 'test',
            href: 'http://testdomain/test/124',
            method: HttpMethods.GET,
          }),
        },
      },
      mockedHttpRequest,
    )

    expect(hateoasEntity).toStrictEqual({
      test: 'test',
      _links: {
        test: new Link({
          rel: 'test',
          href: 'http://testdomain/test/124',
          method: HttpMethods.GET,
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

  it('Entity within a page with simple hateoas must be parsed', () => {
    const hateoasEntity = hateoasParser.parseLinks(
      new Page<unknown>({
        pages: 1,
        nextPage: 1,
        totalElements: 1,
        currentPage: 1,
        pageSize: 1,
        elements: [
          {
            test: 'test',
            _links: {
              test: new Link({
                rel: 'TestEntity',
                href: 'https://testdomain/test/124',
                method: HttpMethods.GET,
              }),
            },
          },
        ],
      }),
      mockedHttpsRequest,
    )

    expect(hateoasEntity).toStrictEqual({
      pages: 1,
      nextPage: 1,
      totalElements: 1,
      currentPage: 1,
      pageSize: 1,
      elements: [
        {
          test: 'test',
          _links: {
            test: new Link({
              rel: 'TestEntity',
              href: 'https://testdomain/test/124',
              method: HttpMethods.GET,
            }),
          },
        },
      ],
    })
  })
})
