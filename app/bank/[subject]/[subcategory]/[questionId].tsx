import { BankHeader } from "@/components/BankHeader";
import { NavigationButtons } from "@/components/NavigationButtons";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDrizzle } from "@/hooks/useDrizzle";
import {
  getNextQuestionInSubcategory,
  getPreviousQuestionInSubcategory,
  getQuestionById,
} from "@/services/db/questions";
import { questions as questionsSchema } from "@/services/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function InteractiveQuestion() {
  const router = useRouter();
  const { scheme, theme } = useAppTheme();
  const { drizzleDb } = useDrizzle();
  const { subject, subcategory, questionId } = useLocalSearchParams<{
    subject: string;
    subcategory: string;
    questionId: string;
  }>();

  const [question, setQuestion] = useState<InferSelectModel<
    typeof questionsSchema
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [guess, setGuess] = useState<"A" | "B" | "C" | "D" | undefined>(
    undefined,
  );
  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(true);

  const fetchQuestion = useCallback(
    async (id: string) => {
      if (!drizzleDb) return;
      setLoading(true);
      try {
        const q = await getQuestionById(drizzleDb, parseInt(id));
        if (q) {
          setQuestion(q);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    },
    [drizzleDb],
  );

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId);
      setGuess(undefined);
    }
  }, [questionId, fetchQuestion]);

  useEffect(() => {
    const checkSiblings = async () => {
      if (!drizzleDb || !question || !subcategory) return;
      const next = await getNextQuestionInSubcategory(
        drizzleDb,
        question.subId,
        subcategory,
      );
      const prev = await getPreviousQuestionInSubcategory(
        drizzleDb,
        question.subId,
        subcategory,
      );
      setHasNext(!!next);
      setHasPrev(!!prev);
    };
    checkSiblings();
  }, [drizzleDb, question, subcategory]);

  const onGuess = (letter: "A" | "B" | "C" | "D") => {
    if (!guess) {
      setGuess(letter);
    }
  };

  const onNext = async () => {
    if (!drizzleDb || !question || !subcategory) return;

    try {
      const nextQ = await getNextQuestionInSubcategory(
        drizzleDb,
        question.subId,
        subcategory,
      );

      if (nextQ) {
        router.replace({
          pathname: "/bank/[subject]/[subcategory]/[questionId]",
          params: {
            subject,
            subcategory,
            questionId: nextQ.id.toString(),
          },
        });
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Error fetching next question:", error);
    }
  };

  const onPrev = async () => {
    if (!drizzleDb || !question || !subcategory) return;

    try {
      const prevQ = await getPreviousQuestionInSubcategory(
        drizzleDb,
        question.subId,
        subcategory,
      );

      if (prevQ) {
        router.replace({
          pathname: "/bank/[subject]/[subcategory]/[questionId]",
          params: {
            subject,
            subcategory,
            questionId: prevQ.id.toString(),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching previous question:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator
          size="large"
          color={getThemeColor("--info", scheme, theme)}
        />
      </View>
    );
  }
  if (!question) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-lg font-semibold text-foreground">
          Pyetja nuk u gjet
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <BankHeader
        title={`Pyetja ${question.subId}`}
        subtitle={subcategory}
        onBack={() => router.back()}
      />
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            paddingTop: 16,
          }}
        >
          <QuestionDisplay
            question={question}
            selectedOption={guess}
            onOptionPress={onGuess}
            isRevealed={!!guess}
            disabled={!!guess}
            horizontalPadding={16}
          />
        </ScrollView>
      </View>

      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevDisabled={!hasPrev}
        nextDisabled={false}
        nextLabel={hasNext ? "Perpara" : "Perfundo"}
        isNextPrimary={false}
      />
    </View>
  );
}
