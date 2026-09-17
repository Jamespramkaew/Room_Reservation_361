import { getDb } from '../../db/client';
import { example, type Example, type NewExample } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all examples
 */
export async function getAllExamples(): Promise<Example[]> {
  const db = getDb();
  return await db.select().from(example).orderBy(example.author);
}

/**
 * Get example by ID
 */
export async function getExampleById(id: string): Promise<Example | null> {
  const db = getDb();
  const result = await db.select().from(example).where(eq(example.id, id));
  return result[0] || null;
}

/**
 * Get example by author
 */
export async function getExampleByAuthor(author: string): Promise<Example | null> {
  const db = getDb();
  const result = await db.select().from(example).where(eq(example.author, author));
  return result[0] || null;
}

/**
 * Create new example
 */
export async function createExample(data: NewExample): Promise<Example> {
  const db = getDb();
  const result = await db.insert(example).values(data).returning();
  return result[0];
}

/**
 * Update example
 */
export async function updateExample(id: string, data: Partial<NewExample>): Promise<Example | null> {
  const db = getDb();
  const result = await db.update(example).set(data).where(eq(example.id, id)).returning();
  return result[0] || null;
}

/**
 * Delete example
 */
export async function deleteExample(id: string): Promise<Example | null> {
  const db = getDb();
  const result = await db.delete(example).where(eq(example.id, id)).returning();
  return result[0] || null;
}

/**
 * Count examples
 */
export async function countExamples(): Promise<number> {
  const db = getDb();
  const result = await db.select().from(example);
  return result.length;
}
