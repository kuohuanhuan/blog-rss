import { HTTPException } from 'hono/http-exception'
import type { StatusCode } from 'hono/utils/http-status'

const httpStatusList = [
  {
    code: 400,
    title: 'Bad Request',
    refSection: 'section-15.5.1',
  },
  {
    code: 404,
    title: 'Not Found',
    refSection: 'section-15.5.5',
  },
  {
    code: 418,
    title: '(Unused)',
    refSection: 'section-15.5.19',
  },
  {
    code: 429,
    title: 'Too Many Requests',
    rfc6585: true,
    refSection: 'section-4',
  },
  {
    code: 500,
    title: 'Internal Server Error',
    refSection: 'section-15.6.1',
  },
  {
    code: 501,
    title: 'Not Implemented',
    refSection: 'section-15.6.2',
  },
]

export function createRfcHttpError(
  code: StatusCode,
  detail: string,
): HTTPException {
  const match = httpStatusList.find((i) => code === i.code)

  const title = match?.title ?? 'UNKNOWN ERROR'
  const rfc6585 = match?.rfc6585 ?? false
  const refSection = match?.refSection ?? ''

  return new HTTPException(code, {
    res: new Response(
      JSON.stringify({
        code,
        title,
        type: rfc6585
          ? `https://datatracker.ietf.org/doc/html/rfc6585#${refSection}`
          : `https://datatracker.ietf.org/doc/html/rfc9110#${refSection}`,
        detail: `${detail} :(`,
      }),
      {
        headers: new Headers({
          'Content-Type': 'application/problem+json; charset=utf-8',
          'Cache-Control': 'max-age=0, no-store, must-revalidate',
        }),
      },
    ),
  })
}
