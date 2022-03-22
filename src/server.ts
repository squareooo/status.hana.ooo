import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import http from 'http'
import https from 'https'
import { env } from 'process'
import { ApolloServer } from 'apollo-server-koa'
import Hana from 'hana.js'

import typeDefs from '@/graphql/typeDefs'
import resolvers from '@/graphql/resolvers'

export const start = (): void => {
  const app = new Koa()
  app.use(bodyParser())

  app.use(
    cors({
      credentials: true
    })
  )

  const apollo = new ApolloServer({
    context: async ({ ctx }) => {
      try {
        if (
          ctx.request.body.query
            .trim()
            .startsWith('query IntrospectionQuery') === true
        ) {
          if (env.NODE_ENV !== 'production') return { ctx }

          const authorization = ctx.req.headers.authorization.split(' ')

          if (authorization[1] !== env.TOKEN) throw new Error()
        }

        if (ctx.req.headers.authorization == null) return { ctx }

        const authorization = ctx.req.headers.authorization.split(' ')

        if (authorization[0] !== 'Bearer') return { ctx }

        const payload = await Hana.Auth.tokenInfo({
          accessToken: authorization[1]
        })

        return { ctx, payload }
      } catch {
        return { ctx }
      }
    },
    typeDefs,
    resolvers
  })

  apollo.applyMiddleware({
    app,
    cors: {
      origin: (ctx) => {
        return ctx.headers.origin as string
      }
    }
  })

  const httpPort = env.HTTP != null && env.HTTP !== '' ? Number(env.HTTP) : 80
  http.createServer(app.callback()).listen(httpPort, () => {
    console.log(`🚀  Server ready at http://localhost:${httpPort}/graphql`)
  })

  const httpsPort = env.HTTPS != null && env.HTTPS !== '' ? Number(env.HTTPS) : 443
  https
    .createServer(
      {
        key: env.KEY ?? undefined,
        cert: env.CERT ?? undefined
      },
      app.callback()
    )
    .listen(httpsPort, () => {
      console.log(`🚀  Server ready at https://localhost:${httpsPort}/graphql`)
    })
}
