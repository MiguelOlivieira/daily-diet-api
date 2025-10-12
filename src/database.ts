import knex from 'knex'
import type { Knex } from 'knex'

export const config: Knex.Config = {
    client: 'pg',
      connection: {
    database: 'dailyDietNodejs',
    user: 'postgres',
    password: 'root',
    
  },
   migrations: {
    extension: 'ts',
    directory: './db/migrations',
   },
}


export const db = knex(config)