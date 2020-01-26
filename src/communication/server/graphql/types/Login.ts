import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Login {
    @Field()
    user: object

    @Field()
    token: string
}
