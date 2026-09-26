import { z } from 'zod';

const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;

// Validates YYYY-MM-DD and rejects non-existent dates like 2026-02-30
const dateString = z.string().refine(
  (s) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00+07:00`);
    // If the month overflows (e.g. Feb 30 → Mar 2), the parsed month will differ
    return d.getFullYear() === Number(s.slice(0, 4)) &&
      d.getMonth() + 1 === Number(s.slice(5, 7)) &&
      d.getDate() === Number(s.slice(8, 10));
  },
  { message: 'Must be a date in YYYY-MM-DD format' },
);

// CSV helper for status — splits, trims, validates each value
function csvStatus() {
  return z.preprocess(
    (val) =>
      typeof val === 'string' ? val.split(',').map((v) => v.trim()) : val,
    z.array(
      z.enum(BOOKING_STATUSES, {
        error: 'Must be one of PENDING, APPROVED, REJECTED, CANCELLED',
      }),
    ),
  );
}

export const listQuery = z
  .object({
    from: z.string({ error: 'Required' }).pipe(dateString),
    to: z.string({ error: 'Required' }).pipe(dateString),
    room_id: z.string().optional(),
    status: csvStatus().default(['PENDING', 'APPROVED']),
  })
  .superRefine((data, ctx) => {
    // Both dates must be valid before comparing
    if (!data.from || !data.to) return;

    const fromMs = new Date(`${data.from}T00:00:00+07:00`).getTime();
    const toMs = new Date(`${data.to}T00:00:00+07:00`).getTime();

    if (toMs < fromMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be on or after from',
        path: ['to'],
      });
      return;
    }

    // Inclusive day count: to - from in days
    const diffDays = (toMs - fromMs) / (1000 * 60 * 60 * 24);
    if (diffDays > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Range must not exceed 31 days',
        path: ['to'],
      });
    }
  });

export type ListQuery = z.infer<typeof listQuery>;
