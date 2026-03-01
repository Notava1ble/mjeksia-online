import { QuestionDisplay } from "@/components/QuestionDisplay";
import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDrizzle } from "@/hooks/useDrizzle";
import { getRandomQuestion } from "@/services/db/questions";
import { questions } from "@/services/db/schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { type InferSelectModel } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 16;

export default function Arena() {
  const { scheme, theme } = useAppTheme();
  const { drizzleDb } = useDrizzle();

  const [currentQuestion, setCurrentQuestion] = useState<
    InferSelectModel<typeof questions> | undefined
  >(undefined);

  const [guess, setGuess] = useState<"A" | "B" | "C" | "D" | undefined>(
    undefined,
  );

  const loadNewQuestion = useCallback(async () => {
    try {
      const result = await getRandomQuestion(drizzleDb);
      if (result.length > 0) {
        setCurrentQuestion(result[0]);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  }, [drizzleDb]);

  // Load a question when the screen opens
  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const onGuess = (letter: "A" | "B" | "C" | "D") => {
    if (!guess) {
      setGuess(letter);
    }
  };

  const onNext = () => {
    setGuess(undefined);
    loadNewQuestion();
  };

  // Show loading state while DB is fetching the first question
  if (!currentQuestion) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator
          size="large"
          color={getThemeColor("--muted-foreground", scheme, theme)}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background justify-between">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 24,
        }}
      >
        <QuestionDisplay
          question={currentQuestion}
          selectedOption={guess}
          onOptionPress={onGuess}
          isRevealed={!!guess}
          disabled={!!guess}
          indexInfo={`Pyetja ${currentQuestion.subId}`}
          horizontalPadding={HORIZONTAL_PADDING}
        />
      </ScrollView>

      <View className="p-6 border-t border-border bg-background">
        <Pressable
          className="bg-primary p-4 w-full rounded-lg active:bg-primary/90 flex-row justify-between items-center"
          onPress={onNext}
        >
          <Text className="font-semibold text-lg text-primary-foreground">
            Continue
          </Text>
          <Ionicons name="arrow-forward" size={22} color="black" />
        </Pressable>
      </View>
    </View>
  );
}
