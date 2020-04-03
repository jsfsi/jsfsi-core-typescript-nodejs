import { HttpServerBuilder } from './communication'
import { Link } from '@jsfsi-core/typescript-cross-platform'
import { Logger } from './Logger'
import { Path, GET } from 'typescript-rest'

Logger.configure('debug')

@Path('/')
class TestController {
    @GET
    public test() {
        console.log('Test controller')
        return { test: 'test' }
    }
}

const server = new HttpServerBuilder()
    .withPort(8081)
    .withControllers([TestController])
    .withHATEOASRules({
        test: () => {
            return {
                rel: 'test',
            } as Link
        },
    })
    .build()

server.start()
