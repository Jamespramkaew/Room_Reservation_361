import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly details: string | string[],
  ) {
    super(Array.isArray(details) ? details.join(', ') : details);
  }
}

export const badRequest = (message: string | string[]) => new HttpError(400, message);
export const notFound = (message: string) => new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);

/** Postgres error code for unique_violation, e.g. two requests creating the same name at once. */
export const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && 'code' in err && err.code === '23505';
