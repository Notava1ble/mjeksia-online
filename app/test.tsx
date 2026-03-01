import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { OverviewModal } from "@/components/modals/OverviewModal";
import { NavigationButtons } from "@/components/NavigationButtons";
import { QuestionDisplay } from "@/components/QuestionDisplay";
import { TimerHeader } from "@/components/TimerHeader";
import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useDrizzle } from "@/hooks/useDrizzle";
import { loadNQuestions } from "@/services/db/questions";
import { questions } from "@/services/db/schema";
import { insertTestSession } from "@/services/db/testSessions";
import { getSetting } from "@/services/settings/settings";
import { InferSelectModel } from "drizzle-orm";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 16;

const Test = () => {
  // Read config once on mount using lazy initializer
  const [numberOfQuestions] = useState(() =>
    parseInt(getSetting("test_question_amount"), 10),
  );
  const [totalTime] = useState(() => parseFloat(getSetting("test_time")) * 60);

  const { drizzleDb } = useDrizzle();
  const { scheme, theme } = useAppTheme();

  const [error, setError] = useState(false);
  const [allQuestions, setAllQuestions] = useState<
    InferSelectModel<typeof questions>[] | undefined
  >(undefined);
  const [guesses, setGuesses] = useState<("A" | "B" | "C" | "D" | undefined)[]>(
    () => new Array(numberOfQuestions).fill(undefined),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);

  const writeToDatabase = useCallback(
    async (completed: boolean, timeLeft: number) => {
      if (!allQuestions) {
        return;
      }

      const score = guesses.filter(
        (g, i) => g === allQuestions[i].answer,
      ).length;

      const questionsObject = guesses.map((guess, i) => {
        const question = allQuestions[i];

        return {
          questionId: question.id,
          selected_option: guess ? guess : null,
          is_correct: guess === question.answer,
        };
      });

      await insertTestSession(
        drizzleDb,
        {
          score: score,
          time_left: timeLeft,
          total_questions: allQuestions.length,
          is_completed: completed,
        },
        questionsObject,
      );
    },
    [allQuestions, guesses, drizzleDb],
  );

  // Handle time up
  const handleTimeUp = useCallback(
    (timeLeft: number) => {
      setIsFinished(true);
      setIsConfirmModalOpen(false);
      setIsOverviewModalOpen(true);

      writeToDatabase(false, timeLeft);
    },
    [writeToDatabase],
  );

  // Use the custom timer hook
  const {
    remainingSeconds,
    restart: restartTimer,
    stop: stopTimer,
  } = useCountdownTimer({
    totalSeconds: totalTime,
    hapticCountdownSeconds: 5,
    onTimeUp: handleTimeUp,
  });

  const loadNewQuestion = useCallback(async () => {
    setError(false);
    try {
      const result = await loadNQuestions(drizzleDb, numberOfQuestions);
      if (result.length > 0) {
        setAllQuestions(result);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setError(true);
    }
  }, [drizzleDb, numberOfQuestions]);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const onGuess = useCallback(
    (letter: "A" | "B" | "C" | "D", index: number) => {
      if (!isFinished) {
        setGuesses((prev) => {
          if (prev[index] === letter) return prev;
          if (remainingSeconds >= 6) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          const newGuesses = [...prev];
          newGuesses[index] = letter;
          return newGuesses;
        });
      }
    },
    [isFinished, remainingSeconds],
  );

  const onPrev = useCallback(() => {
    if (currentIndex !== 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const onNext = useCallback(() => {
    if (currentIndex !== numberOfQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    if (remainingSeconds >= 6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsConfirmModalOpen(true);
  }, [currentIndex, numberOfQuestions, remainingSeconds]);

  const restartTest = useCallback(() => {
    setIsOverviewModalOpen(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setGuesses(new Array(numberOfQuestions).fill(undefined));
    setAllQuestions(undefined);
    setError(false);
    restartTimer();
    loadNewQuestion();
  }, [loadNewQuestion, numberOfQuestions, restartTimer]);

  const handleConfirmFinish = useCallback(async () => {
    writeToDatabase(true, remainingSeconds);

    stopTimer();
    setIsFinished(true);
    setIsConfirmModalOpen(false);
    setIsOverviewModalOpen(true);
  }, [stopTimer, writeToDatabase, remainingSeconds]);

  const handleViewResults = useCallback(() => {
    setIsOverviewModalOpen(false);
    setCurrentIndex(0);
  }, []);

  // Calculate stats
  const correctCount = allQuestions
    ? guesses.filter((g, i) => g === allQuestions[i]?.answer).length
    : 0;
  const unansweredCount = guesses.filter((g) => g === undefined).length;

  if (!allQuestions) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <TimerHeader remainingSeconds={remainingSeconds} title="Test" />
        {error ? (
          <>
            <Text className="text-foreground text-lg mb-2">
              Ndodhi nje gabim
            </Text>
            <Pressable
              className="bg-primary p-3 rounded-md active:opacity-80 mt-2"
              onPress={() => {
                setError(false);
                loadNewQuestion();
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

  const currentQuestion = allQuestions[currentIndex];
  const currentGuess = guesses[currentIndex];
  const isLastQuestion = currentIndex === allQuestions.length - 1;

  return (
    <View className="flex-1 bg-background justify-between">
      <TimerHeader title={"Test"} remainingSeconds={remainingSeconds} />
      <OverviewModal
        visible={isOverviewModalOpen}
        correctCount={correctCount}
        totalCount={numberOfQuestions}
        onNewTest={restartTest}
        onViewResults={handleViewResults}
      />
      <ConfirmModal
        visible={isConfirmModalOpen}
        unansweredCount={unansweredCount}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmFinish}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 24,
        }}
      >
        <QuestionDisplay
          question={currentQuestion}
          selectedOption={currentGuess}
          onOptionPress={(letter) => onGuess(letter, currentIndex)}
          isRevealed={isFinished}
          disabled={isFinished}
          indexInfo={`Pyetja ${currentIndex + 1} / ${numberOfQuestions}`}
          horizontalPadding={HORIZONTAL_PADDING}
        />
      </ScrollView>
      <NavigationButtons
        onPrev={onPrev}
        onNext={onNext}
        prevDisabled={currentIndex === 0}
        nextDisabled={isFinished && isLastQuestion}
        nextLabel={isLastQuestion && !isFinished ? "Perfundo" : "Perpara"}
        isNextPrimary={isLastQuestion}
      />
    </View>
  );
};

export default Test;
