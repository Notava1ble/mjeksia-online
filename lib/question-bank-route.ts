import { CATEGORIES } from "@/constants/categories";

type HistoryQuestion = {
  id: number | string;
  exam_title: string;
};

export type QuestionBankHref = {
  pathname: "/bank/[subject]/[subcategory]/[questionId]";
  params: {
    subject: string;
    subcategory: string;
    questionId: string;
  };
};

export function buildQuestionBankHref(
  question: HistoryQuestion,
): QuestionBankHref | null {
  const subject = Object.entries(CATEGORIES).find(([, subcategories]) =>
    subcategories.includes(question.exam_title),
  )?.[0];

  if (!subject) return null;

  return {
    pathname: "/bank/[subject]/[subcategory]/[questionId]",
    params: {
      subject,
      subcategory: question.exam_title,
      questionId: question.id.toString(),
    },
  };
}
