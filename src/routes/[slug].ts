import { cache } from 'hono/cache'
import { createFactory } from 'hono/factory'
import { logger } from 'hono/logger'

import { middleware as methodRestrMiddleware } from '@/middlewares/method_restrict'

import { createRfcHttpError } from '@/errors/http_error'

const factory = createFactory<{ Bindings: { DB: D1Database } }>()

export const handlers = factory.createHandlers(
  logger(),
  methodRestrMiddleware(['GET']),
  cache({
    cacheName: 'shortened_url',
    cacheControl: 'max-age=172800', // 48 hours
    keyGenerator: (ctxt) => ctxt.req.path,
  }),
  async (ctxt) => {
    const db = ctxt.env.DB

    // should've been checked in route with regexp
    const { slug } = ctxt.req.param()

    const { success, results } = await db
      .prepare(`SELECT destination FROM URLs WHERE slug = ?;`)
      .bind(slug)
      .all()

    if (!success || results.length > 1) {
      throw createRfcHttpError(500, 'Error reading data from the database')
    }
    if (results.length === 0) {
      throw createRfcHttpError(
        404,
        'The requested page may have been removed or renamed',
      )
    }

    return ctxt.body(null, {
      status: 301,
      headers: new Headers({
        'Location': results[0].destination as string,
        'Cache-Control': 'max-age=3600',
      }),
    })
  },
)
