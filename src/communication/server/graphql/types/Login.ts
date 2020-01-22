import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class Login {
    @Field()
    token: string
}
