import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import { Inject } from 'typescript-ioc'
import { Login } from '../types/Login'
import { LoginService } from '../../../../services/LoginService'
import { AuthenticationError } from 'apollo-server'
import { Context } from '../Context'

export abstract class LoginResolverConfiguration {
    cookie: {
        domain: string
        secure: boolean
    }
}

@Resolver()
export class LoginResolver<U extends object> {
    @Inject
    private configuration: LoginResolverConfiguration

    @Inject
    private loginService: LoginService<U>

    @Mutation(_ => Login)
    async loginWithGoogle(
        @Arg('accessToken') accessToken: string,
        @Ctx() context: Context,
    ): Promise<Login<U>> {
        try {
            const loginInfo = await this.loginService.loginWithGoogle(accessToken)

            context &&
                context.response.cookie('', loginInfo.refreshToken.token, {
                    httpOnly: true,
                    maxAge: loginInfo.refreshToken.duration,
                    domain: this.configuration.cookie.domain,
                    secure: this.configuration.cookie.secure,
                })

            return { user: loginInfo.user, token: loginInfo.token }
        } catch (error) {
            throw new AuthenticationError(error.message)
        }
    }
}
