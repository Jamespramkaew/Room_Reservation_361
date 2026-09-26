import { z } from 'zod';

export const idParam = z.object({ id: z.string().min(1) });

export type IdParam = z.infer<typeof idParam>;

// ---- room_type values ----
const ROOM_TYPES = ['LAB', 'LECTURE', 'MEETING', 'COWORKING'] as const;

// ---- facility filter keys (API-facing names) ----
const FACILITY_KEYS = ['computers', 'projector', 'mic'] as const;

// ISO 8601 with mandatory UTC offset: ends with Z or ±HH:MM
const isoWithOffset = z
  .string()
  .refine((s) => /([+-]\d{2}:\d{2}|Z)$/.test(s) && !isNaN(Date.parse(s)), {
    message: 'Must be an ISO 8601 datetime with offset',
  });

// CSV helper — splits on comma, trims whitespace, then validates each item
function csv<T>(itemSchema: z.ZodType<T>) {
  return z.preprocess(
    (val) =>
      typeof val === 'string'
        ? val.split(',').map((v) => v.trim())
        : val,
    z.array(itemSchema),
  );
}

export const listQuery = z
  .object({
    q: z
      .string()
      .min(1, 'Must be 1-100 characters')
      .max(100, 'Must be 1-100 characters')
      .optional(),
    room_type: csv(
      z.enum(ROOM_TYPES, {
        error: 'Must be one of LAB, LECTURE, MEETING, COWORKING',
      }),
    ).optional(),
    facilities: csv(
      z.enum(FACILITY_KEYS, {
        error: 'Must be one of computers, projector, mic',
      }),
    ).optional(),
    start: isoWithOffset.optional(),
    end: isoWithOffset.optional(),
  })
  .superRefine((data, ctx) => {
    const hasStart = data.start !== undefined;
    const hasEnd = data.end !== undefined;

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'start and end must be sent together',
        path: [],
      });
      return;
    }

    if (hasStart && hasEnd && new Date(data.end!) <= new Date(data.start!)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be after start',
        path: ['end'],
      });
    }
  });

export type ListQuery = z.infer<typeof listQuery>;
