import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Login<U> {
    @Field()
    user: U

    @Field()
    token: string
}
