import { knex as setupKnex } from 'knex'
import type { Knex } from 'knex'
import { env } from '../src/env'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './infra/migrations'
  }
}

export const knex = setupKnex(config)
