import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from '../env';

let client: S3Client | undefined;

/**
 * Credentials come from the default provider chain (the Lambda execution role on AWS,
 * test keys on LocalStack) - never pass keys explicitly or the session token is lost.
 */
export function getS3(): S3Client {
  if (!client) {
    const { AWS_REGION, AWS_ENDPOINT_URL } = getEnv();
    client = new S3Client({
      region: AWS_REGION,
      // LocalStack serves buckets by path (http://host:4566/bucket/key), not by subdomain
      ...(AWS_ENDPOINT_URL && { endpoint: AWS_ENDPOINT_URL, forcePathStyle: true }),
    });
  }
  return client;
}

export function objectUrl(key: string): string {
  const { S3_PUBLIC_URL, S3_BUCKET, AWS_REGION } = getEnv();
  const base = S3_PUBLIC_URL ?? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;
  return `${base}/${key}`;
}
