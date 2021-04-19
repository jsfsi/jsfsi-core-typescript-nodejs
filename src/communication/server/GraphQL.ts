import { Response, Request, Application } from 'express'
import { BuildSchemaOptions, buildSchema } from 'type-graphql'
import { ApolloServerExpressConfig, ApolloServer } from 'apollo-server-express'
import { Logger } from '../../Logger'

export interface Context {
  request: Request
  response: Response
}

type ValueOrPromise<T> = T | Promise<T>

type GraphQLOptionsContext<T = object> = T

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContextFunction<FunctionParams = any, ProducedContext = object> = (
  context: FunctionParams,
) => ValueOrPromise<GraphQLOptionsContext<ProducedContext>>

export interface GraphqlOptions extends BuildSchemaOptions {
  path: string
  tracing?: boolean
  introspection?: boolean
  playground?: boolean
  context?: GraphQLOptionsContext | ContextFunction
}

export const setupGraphQL = async (application: Application, options: GraphqlOptions) => {
  const { path, tracing, playground, context, introspection } = options

  const schema = await buildSchema(options)

  const graphqlConfig: ApolloServerExpressConfig = {
    schema,
    tracing,
    playground,
    context,
    introspection,
  }

  const graphqlServer = new ApolloServer(graphqlConfig)

  Logger.info('Graphql playground available in path: /graphql')
  graphqlServer.applyMiddleware({ app: application, path })
}
