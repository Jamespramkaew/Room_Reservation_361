import { z } from 'zod';

const csv = z
  .string()
  .default('')
  .transform((s) =>
    s
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  );

const envSchema = z.object({
  STAGE: z.string().default('local'),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: csv,
  AWS_REGION: z.string().default('ap-southeast-1'),
  // Set only when running against LocalStack; unset on real AWS
  AWS_ENDPOINT_URL: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Env vars come from the Lambda configuration (or `--env-file` in dev); validated once per container. */
export function getEnv(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment: ${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}
