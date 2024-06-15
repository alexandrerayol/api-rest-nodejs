import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env'
import { TransactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)
app.register(TransactionsRoutes, {
  prefix: 'transactions'
})

app
  .listen({ port: env.DATABASE_PORT })
  .then(() => {
    console.log('HTTP server running')
  })
  .catch((error) => {
    app.log.error(error)
    process.exit(1)
  })
