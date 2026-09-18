import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';
import { errorResponse } from './response';

/** zValidator that answers 400 with the standard envelope, one message per issue. */
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const messages = result.error.issues.map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message));
      return c.json(errorResponse(messages), 400);
    }
  });
