import { and, asc, eq, isNull } from 'drizzle-orm';
import { getDb } from '../../shared/db/client';
import { facilities } from '../../shared/db/schema';

export type Facility = typeof facilities.$inferSelect;

const notDeleted = isNull(facilities.deletedAt);

export const facilitiesRepository = {
  findAll(): Promise<Facility[]> {
    return getDb().select().from(facilities).where(notDeleted).orderBy(asc(facilities.name));
  },

  async findById(id: string): Promise<Facility | undefined> {
    const [row] = await getDb()
      .select()
      .from(facilities)
      .where(and(eq(facilities.id, id), notDeleted));
    return row;
  },

  /** Includes soft-deleted rows because the unique index on name still covers them. */
  async findByName(name: string): Promise<Facility | undefined> {
    const [row] = await getDb().select().from(facilities).where(eq(facilities.name, name));
    return row;
  },

  async create(name: string): Promise<Facility> {
    const [row] = await getDb().insert(facilities).values({ name }).returning();
    return row;
  },

  async update(id: string, data: { name?: string }): Promise<Facility> {
    const [row] = await getDb().update(facilities).set(data).where(eq(facilities.id, id)).returning();
    return row;
  },

  async softDelete(id: string): Promise<Facility> {
    const [row] = await getDb()
      .update(facilities)
      .set({ deletedAt: new Date() })
      .where(eq(facilities.id, id))
      .returning();
    return row;
  },
};
