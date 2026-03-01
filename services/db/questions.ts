import * as schema from "@/services/db/schema";
import { sql } from "drizzle-orm";
import { DbType } from "./types";

export async function getRandomQuestion(db: DbType) {
  const result = await db
    .select()
    .from(schema.questions)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  return result;
}

export async function loadNQuestions(db: DbType, number: number) {
  const result = await db
    .select()
    .from(schema.questions)
    .orderBy(sql`RANDOM()`)
    .limit(number);

  return result;
}

export async function getQuestionById(db: DbType, id: number) {
  const result = await db
    .select()
    .from(schema.questions)
    .where(sql`${schema.questions.id} = ${id}`)
    .limit(1);

  return result[0];
}

export async function getNextQuestionInSubcategory(
  db: DbType,
  currentSubId: number,
  examTitle: string,
) {
  const result = await db
    .select()
    .from(schema.questions)
    .where(
      sql`${schema.questions.exam_title} = ${examTitle} AND ${schema.questions.subId} > ${currentSubId}`,
    )
    .orderBy(schema.questions.subId)
    .limit(1);

  return result[0];
}
export async function getPreviousQuestionInSubcategory(
  db: DbType,
  currentSubId: number,
  examTitle: string,
) {
  const result = await db
    .select()
    .from(schema.questions)
    .where(
      sql`${schema.questions.exam_title} = ${examTitle} AND ${schema.questions.subId} < ${currentSubId}`,
    )
    .orderBy(sql`${schema.questions.subId} DESC`)
    .limit(1);

  return result[0];
}
