// hooks/useDrizzle.ts
import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

/**
 * Provide a memoized Drizzle ORM client bound to the current Expo SQLite context.
 *
 * @returns A Drizzle ORM database instance configured with the project schema and tied to the current SQLite context
 */
export function useDrizzle() {
  const db = useSQLiteContext();

  const drizzleDb = useMemo(() => {
    return drizzle(db, { schema });
  }, [db]);

  return drizzleDb;
}