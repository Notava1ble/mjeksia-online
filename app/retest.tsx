import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { OverviewModal } from "@/components/modals/OverviewModal";
import { NavigationButtons } from "@/components/NavigationButtons";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { TimerHeader } from "@/components/TimerHeader";
import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDrizzle } from "@/hooks/useDrizzle";
import { useTestEngine } from "@/hooks/useTestEngine";
import {
  getTestSessionDetails,
  getUniqueUserMistakes,
} from "@/services/db/history";
import { questions } from "@/services/db/schema";
import { saveTestResult } from "@/services/db/tests";
import { getSetting } from "@/services/settings/settings";
import { InferSelectModel } from "drizzle-orm";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 16;

type Question = InferSelectModel<typeof questions>;
type TestType = "focus" | "mock";

const Retest = () => {
  const { mode: modeParam, sessionId } = useLocalSearchParams<{
    mode?: string;
    sessionId?: string;
  }>();
  const { drizzleDb } = useDrizzle();
  const { scheme, theme } = useAppTheme();

  const mode = modeParam === "session" ? "session" : "mistakes";
  const [error, setError] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [allQuestions, setAllQuestions] = useState<Question[] | undefined>();
  const [testType, setTestType] = useState<TestType>("mock");
  const [topic, setTopic] = useState<string | null>("Gabimet");

  const title = useMemo(() => {
    if (mode === "mistakes") {
      return "Test i Gabimeve";
    }

    return testType === "focus" ? "Retest i Fokusuar" : "Retest Modeli";
  }, [mode, testType]);

  const totalTime = useMemo(() => {
    const settingKey =
      mode === "session" && testType === "focus"
        ? "focus_test_time"
        : "test_time";

    return parseFloat(getSetting(settingKey)) * 60;
  }, [mode, testType]);

  const loadQuestions = useCallback(async () => {
    setError(false);
    setEmptyMessage("");

    try {
      if (mode === "mistakes") {
        const mistakes = await getUniqueUserMistakes(drizzleDb);
        setTestType("mock");
        setTopic("Gabimet");
        setAllQuestions(mistakes.map(({ question }) => question));
        setEmptyMessage(
          mistakes.length === 0
            ? "Nuk u gjetën gabime për t'u ritestuar."
            : "",
        );
        return;
      }

      const parsedSessionId = Number(sessionId);
      if (!Number.isFinite(parsedSessionId)) {
        setAllQuestions([]);
        setEmptyMessage("Testi nuk u gjet.");
        return;
      }

      const details = await getTestSessionDetails(drizzleDb, parsedSessionId);
      if (!details) {
        setAllQuestions([]);
        setEmptyMessage("Testi nuk u gjet.");
        return;
      }

      setTestType(details.test_type ?? "mock");
      setTopic(details.topic);
      setAllQuestions(details.answers.map(({ question }) => question));
      setEmptyMessage(
        details.answers.length === 0
          ? "Ky test nuk ka pyetje për t'u ritestuar."
          : "",
      );
    } catch (err) {
      console.error("Error loading retest questions:", err);
      setError(true);
    }
  }, [drizzleDb, mode, sessionId]);

  useEffect(() => {
    setAllQuestions(undefined);
    loadQuestions();
  }, [loadQuestions]);

  const onSaveResult = useCallback(
    async (
      questions: Question[],
      guesses: ("A" | "B" | "C" | "D" | undefined)[],
      completed: boolean,
      timeLeft: number,
      answeredAt: (number | null)[],
      timeSpent: number[],
    ) => {
      await saveTestResult(
        drizzleDb,
        questions,
        guesses,
        completed,
        timeLeft,
        answeredAt,
        timeSpent,
        mode === "mistakes" ? "Gabimet" : topic,
        mode === "mistakes" ? "mock" : testType,
      );
    },
    [drizzleDb, mode, testType, topic],
  );

  const handleRestart = useCallback(() => {
    setAllQuestions(undefined);
    loadQuestions();
  }, [loadQuestions]);

  const engine = useTestEngine({
    questions: allQuestions,
    totalTime,
    onSaveResult,
    onRestart: handleRestart,
  });

  if (!allQuestions) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <TimerHeader title={title} remainingSeconds={engine.remainingSeconds} />
        {error ? (
          <>
            <Text className="text-foreground text-lg mb-2 text-center">
              Ndodhi një gabim gjatë ngarkimit të testit.
            </Text>
            <Pressable
              className="bg-primary p-3 rounded-md active:opacity-80 mt-2"
              onPress={() => {
                setAllQuestions(undefined);
                loadQuestions();
              }}
            >
              <Text className="text-primary-foreground text-center font-semibold">
                Provo Përsëri
              </Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator
            size="large"
            color={getThemeColor("--muted-foreground", scheme, theme)}
          />
        )}
      </View>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <TimerHeader title={title} remainingSeconds={engine.remainingSeconds} />
        <Text className="text-foreground text-lg mb-2 text-center">
          {emptyMessage || "Nuk u gjetën pyetje për këtë test."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background justify-between">
      <TimerHeader title={title} remainingSeconds={engine.remainingSeconds} />
      <OverviewModal
        visible={engine.isOverviewModalOpen}
        correctCount={engine.correctCount}
        totalCount={engine.totalCount}
        onNewTest={engine.restartTest}
        onViewResults={engine.handleViewResults}
      />
      <ConfirmModal
        visible={engine.isConfirmModalOpen}
        unansweredCount={engine.unansweredCount}
        onCancel={() => engine.setIsConfirmModalOpen(false)}
        onConfirm={engine.handleConfirmFinish}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 24,
        }}
      >
        <QuestionDisplay
          question={engine.currentQuestion!}
          selectedOption={engine.currentGuess}
          onOptionPress={(letter) =>
            engine.onGuess(letter, engine.currentIndex)
          }
          isRevealed={engine.isFinished}
          disabled={engine.isFinished}
          indexInfo={`Pyetja ${engine.currentIndex + 1} / ${engine.totalCount}`}
          horizontalPadding={HORIZONTAL_PADDING}
        />
      </ScrollView>
      <NavigationButtons
        onPrev={engine.onPrev}
        onNext={engine.onNext}
        prevDisabled={engine.currentIndex === 0}
        nextDisabled={engine.isFinished && engine.isLastQuestion}
        nextLabel={
          engine.isLastQuestion && !engine.isFinished ? "Përfundo" : "Përpara"
        }
        isNextPrimary={engine.isLastQuestion}
      />
    </View>
  );
};

export default Retest;
