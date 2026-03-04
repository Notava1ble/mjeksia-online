import { InferSelectModel } from "drizzle-orm";
import { questions } from "./schema";
import { insertTestSession } from "./testSessions";
import { DbType } from "./types";

type Question = InferSelectModel<typeof questions>;
type Guess = "A" | "B" | "C" | "D" | undefined;

export async function saveTestResult(
  db: DbType,
  allQuestions: Question[],
  guesses: Guess[],
  completed: boolean,
  timeLeft: number,
  answeredAt: (number | null)[],
  timeSpent: number[],
  topic: string | null = null,
  testType: "focus" | "mock" = "mock",
) {
  const score = guesses.filter((g, i) => g === allQuestions[i].answer).length;

  const questionsObject = guesses.map((guess, i) => {
    const question = allQuestions[i];

    return {
      questionId: question.id,
      selected_option: guess ? (guess as "A" | "B" | "C" | "D") : null,
      is_correct: guess === question.answer,
      answered_at: answeredAt[i],
      seconds_spend: timeSpent[i] ?? 0,
      correct_option: question.answer,
    };
  });

  return await insertTestSession(
    db,
    {
      score: score,
      time_left: timeLeft,
      total_questions: allQuestions.length,
      is_completed: completed,
      topic,
      test_type: testType,
    },
    questionsObject,
  );
}
