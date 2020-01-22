import { Resolver, Mutation, Arg } from 'type-graphql'
import { Inject } from 'typescript-ioc'
import { Login } from '../types/Login'
import { LoginService } from '../../../../services/LoginService'
import { AuthenticationError } from 'apollo-server'

@Resolver()
export class LoginResolver<U> {
    @Inject
    private loginService: LoginService<U>

    @Mutation(_ => Login)
    async loginWithGoogle(@Arg('accessToken') accessToken: string): Promise<Login> {
        try {
            return await this.loginService.loginWithGoogle(accessToken)
        } catch (error) {
            throw new AuthenticationError(error.message)
        }
    }
}
