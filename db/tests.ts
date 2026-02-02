import { desc } from "drizzle-orm";
import { testSessions } from "./schema";
import { DbType } from "./types";

export async function getRecentTests(db: DbType, amount: number) {
  const result = await db.query.testSessions.findMany({
    orderBy: desc(testSessions.createdAt),
    limit: amount,
  });
  return result;
}
