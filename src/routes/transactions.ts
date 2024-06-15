import { FastifyInstance } from 'fastify'
import { knex } from '../../infra/database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function TransactionsRoutes (app: FastifyInstance) {
  // GET ALL
  app.get('/', {
    preHandler: [checkSessionIdExists]
  }, async function handler (request) {
    const sessionId = request.cookies.session_id

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')

    return {
      transactions
    }
  })

  // GET BY ID
  app.get('/:id', {
    preHandler: [checkSessionIdExists]
  }, async function handler (request) {
    const getTransactionParamSchema = z.object({
      id: z.string().uuid()
    })

    const { id } = getTransactionParamSchema.parse(request.params)

    const sessionId = request.cookies.session_id

    const transaction = await knex('transactions')
      .where('id', id)
      .andWhere('session_id', sessionId)
      .first()

    if (!transaction) {
      return {
        message: 'not found'
      }
    }

    return {
      transaction
    }
  })

  // GET SUMMARY

  app.get('/summary', {
    preHandler: [checkSessionIdExists]
  }, async function handler (request) {
    const sessionId = request.cookies.session_id

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()

    const totalTransactions = (await knex('transactions')
      .where('session_id', sessionId)
      .select('*')).length

    return {
      session_id: sessionId,
      total_transactions: totalTransactions,
      summary: {
        amount: Number(summary?.amount.toFixed(2) ?? 0)
      }
    }
  })

  // CREATE
  app.post('/', async function handler (request, response) {
    let sessionId = request.cookies.session_id

    if (!sessionId) {
      sessionId = randomUUID()
      response.cookie('session_id', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    const { title, amount, type } = createTransactionBodySchema.parse(request.body)

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })

    response.status(201).send()
  })
}
