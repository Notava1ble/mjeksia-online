import DynamicImage from "@/components/DynamicImage";
import MathText from "@/components/MathText";
import { imageMap } from "@/constants/imageMap";
import { getThemeColor } from "@/constants/theme";
import { loadNQuestions } from "@/db/questions";
import { questions } from "@/db/schema";
import { useDrizzle } from "@/hooks/useDrizzle";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { InferSelectModel } from "drizzle-orm";
import * as Haptics from "expo-haptics";
import Storage from "expo-sqlite/kv-store";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const HORIZONTAL_PADDING = 16;

const Test = () => {
  const NUMBER_OF_QUESTIONS =
    Storage.getItemSync("test_question_amount") === "10" ? 10 : 40;

  const drizzleDb = useDrizzle();
  const { colorScheme } = useColorScheme();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const [error, setError] = useState(false);

  const [allQuestions, setAllQuestions] = useState<
    InferSelectModel<typeof questions>[] | undefined
  >(undefined);
  const [guesses, setGuesses] = useState<
    Array<"A" | "B" | "C" | "D" | undefined>
  >(new Array(NUMBER_OF_QUESTIONS).fill(undefined));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);

  const loadNewQuestion = useCallback(async () => {
    setError(false);
    try {
      const result = await loadNQuestions(drizzleDb, NUMBER_OF_QUESTIONS);
      if (result.length > 0) {
        setAllQuestions(result);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setError(true);
    }
  }, [drizzleDb]);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const onGuess = useCallback(
    (letter: "A" | "B" | "C" | "D", index: number) => {
      if (!isFinished) {
        setGuesses((prev) => {
          if (prev[index] === letter) return prev;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const newGuesses = [...prev];
          newGuesses[index] = letter;
          return newGuesses;
        });
      }
    },
    [isFinished],
  );

  const onPrev = useCallback(() => {
    if (currentIndex !== 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const onNext = useCallback(() => {
    if (currentIndex !== NUMBER_OF_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsConfirmModalOpen(true);
  }, [currentIndex]);

  if (!allQuestions) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
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
            color={getThemeColor("--muted-foreground", colorScheme)}
          />
        )}
      </View>
    );
  }

  const currentQuestion = allQuestions[currentIndex];
  const currentGuess = guesses[currentIndex];

  return (
    <View className="flex-1 bg-background justify-between">
      {/* Overview Popup */}
      <Modal
        visible={isOverviewModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOverviewModalOpen(false)}
      >
        <View className="flex-1 bg-card/50 justify-center items-center p-4">
          <View className="w-[90%] bg-background p-6 rounded-md">
            <Text className="text-2xl text-foreground font-bold mb-6">
              Rezultati i Testit
            </Text>

            <View className="bg-card p-4 rounded-lg mb-4">
              <View className="flex-row justify-between mb-3">
                <Text className="text-foreground">Përgjigje të sakta:</Text>
                <Text className="text-foreground font-bold">
                  {
                    guesses.filter((g, i) => g === allQuestions[i]?.answer)
                      .length
                  }{" "}
                  / {NUMBER_OF_QUESTIONS}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-foreground">Përqindja:</Text>
                <Text className="text-foreground font-bold">
                  {Math.round(
                    (guesses.filter((g, i) => g === allQuestions[i]?.answer)
                      .length /
                      NUMBER_OF_QUESTIONS) *
                      100,
                  )}
                  %
                </Text>
              </View>
            </View>

            <Pressable
              className="bg-primary p-3 rounded-md active:opacity-80"
              onPress={() => {
                setIsOverviewModalOpen(false);
                setIsFinished(false);
                setCurrentIndex(0);
                setGuesses(new Array(NUMBER_OF_QUESTIONS).fill(undefined));
                setAllQuestions(undefined);
                setError(false);
                loadNewQuestion();
              }}
            >
              <Text className="text-primary-foreground text-center font-semibold">
                Testi i Ri
              </Text>
            </Pressable>
            <Pressable
              className="bg-secondary p-3 rounded-md active:opacity-80 mt-2"
              onPress={() => {
                setIsOverviewModalOpen(false);
                setCurrentIndex(0);
              }}
            >
              <Text className="text-secondary-foreground text-center">
                Shiko rezultatet
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Confirm Popup */}
      <Modal
        visible={isConfirmModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsConfirmModalOpen(false)}
      >
        <View className="flex-1 bg-card/50 justify-center items-center p-4">
          <View className="w-[85%] bg-background p-4 rounded-md">
            <Text className="text-lg text-foreground">Perfundo testin?</Text>
            {guesses.includes(undefined) && (
              <Text className="text-foreground mt-2">
                {guesses.filter((g) => g === undefined).length} pyetje jane pa
                pergjigje
              </Text>
            )}
            <View className="flex-row gap-2 mt-4">
              <Pressable
                className="flex-1 bg-secondary p-3 rounded-md active:opacity-80"
                onPress={() => setIsConfirmModalOpen(false)}
              >
                <Text className="text-foreground text-center font-semibold">
                  Anulo
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary p-3 rounded-md active:opacity-80"
                onPress={() => {
                  setIsFinished(true);
                  setIsConfirmModalOpen(false);
                  setIsOverviewModalOpen(true);
                }}
              >
                <Text className="text-primary-foreground text-center font-semibold">
                  Konfirmo
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* --- IMAGE POPUP --- */}
      <Modal
        visible={isImageModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalOpen(false)}
      >
        <Pressable
          className="flex-1 bg-card/80 justify-center items-center p-4"
          onPress={() => setIsImageModalOpen(false)}
        >
          {/* Close Button */}
          <View className="absolute top-12 right-6 z-10">
            <Ionicons
              name="close-circle"
              size={40}
              color={getThemeColor("--foreground", colorScheme)}
            />
          </View>

          {/* Large Image */}
          {currentQuestion.image && (
            <View style={{ width: SCREEN_WIDTH - 40 }}>
              <DynamicImage
                source={
                  imageMap[currentQuestion.image as keyof typeof imageMap]
                }
              />
            </View>
          )}
        </Pressable>
      </Modal>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingBottom: 24,
        }}
      >
        <Text className="text-muted-foreground mb-2">
          Pyetja {currentIndex + 1} - {currentQuestion.exam_title}
        </Text>
        <MathText
          color={getThemeColor("--foreground", colorScheme)}
          text={currentQuestion.question_text}
          className="text-foreground text-lg leading-6 font-medium"
          paddingHorizontal={HORIZONTAL_PADDING * 2}
        />
        <Pressable
          onPress={() => currentQuestion.image && setIsImageModalOpen(true)}
          className={cn(
            "mt-4 h-52 w-full border-2 border-muted rounded-md items-center justify-center bg-card/50 overflow-hidden",
            !currentQuestion.image && "opacity-60",
          )}
        >
          {currentQuestion.image ? (
            <View className="px-4 py-2 w-full h-full items-center">
              <DynamicImage
                source={
                  imageMap[currentQuestion.image as keyof typeof imageMap]
                }
              />
              {/* Intentional black/white usage */}
              <View className="absolute bottom-2 right-2 bg-black/50 p-1 rounded">
                <Ionicons name="expand" size={16} color="white" />
              </View>
            </View>
          ) : (
            <Text className="text-muted-foreground italic">Pa figurë</Text>
          )}
        </Pressable>
        <View className="gap-3 mt-6">
          {(["A", "B", "C", "D"] as const).map((letter) => {
            const isCorrect = currentQuestion.answer === letter;
            const isSelected = currentGuess === letter;

            return (
              <Pressable
                key={letter}
                disabled={isFinished}
                className={cn(
                  "border-border bg-secondary border px-4 py-3 rounded-md active:opacity-80 justify-center",
                  !isFinished && isSelected && "bg-blue-600 border-blue-700",
                  isSelected &&
                    !isCorrect &&
                    isFinished &&
                    "bg-destructive border-destructive",
                  // Green background if this is the correct answer AND we have guessed
                  currentGuess &&
                    isCorrect &&
                    isFinished &&
                    "bg-green-600 border-green-700",
                )}
                onPress={() => onGuess(letter, currentIndex)}
              >
                <MathText
                  className={cn(
                    "text-foreground align-middle",
                    !isFinished && isSelected && "font-bold",
                    currentGuess && isCorrect && isFinished && "font-bold",
                  )}
                  text={`${
                    currentQuestion[
                      `option_${letter.toLowerCase()}` as keyof typeof currentQuestion
                    ]
                  }`}
                  color={getThemeColor("--foreground", colorScheme)}
                  // Account for ScrollView padding + button padding + border
                  paddingHorizontal={HORIZONTAL_PADDING * 2 + 16 * 2 + 1}
                />
              </Pressable>
            );
          })}
        </View>
        {isFinished && (
          <View className="mt-4 p-4 bg-accent rounded-lg border border-accent/30">
            <Text className="text-accent-foreground font-bold mb-1">
              Shpjegimi:
            </Text>
            <MathText
              color={getThemeColor("--accent-foreground", colorScheme, 0.9)}
              text={currentQuestion.explanation}
              className="text-accent-foreground/90 text-sm"
              fontSize={14}
              // Account for ScrollView padding + button padding + border
              paddingHorizontal={HORIZONTAL_PADDING * 2 + 16 * 2 + 1}
            />
          </View>
        )}
      </ScrollView>
      <View className="p-6 border-t border-border bg-background flex-row gap-2">
        <Pressable
          className={cn(
            "bg-secondary p-4 flex-1 rounded-lg active:bg-secondary/90 flex-row gap-2 items-center",
            currentIndex === 0 && "bg-muted ",
          )}
          onPress={onPrev}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={getThemeColor(
              currentIndex === 0 ? "--muted-foreground" : "--foreground",
              colorScheme,
            )}
          />
          <Text
            className={cn(
              "font-semibold text-lg text-foreground align-center",
              currentIndex === 0 && "text-muted-foreground",
            )}
          >
            Kthehu
          </Text>
        </Pressable>
        <Pressable
          className={cn(
            "bg-secondary p-4 flex-1 rounded-lg active:bg-secondary/90 flex-row gap-2 items-center justify-end",
            isFinished && currentIndex === allQuestions.length - 1
              ? "bg-muted active:bg-muted/90"
              : currentIndex === allQuestions.length - 1 &&
                  "bg-primary active:bg-primary/90",
          )}
          onPress={onNext}
          disabled={isFinished && currentIndex === allQuestions.length - 1}
        >
          <Text
            className={cn(
              "font-semibold text-lg text-foreground align-center",
              isFinished && currentIndex === allQuestions.length - 1
                ? "text-muted-foreground"
                : currentIndex === allQuestions.length - 1 &&
                    "text-primary-foreground",
            )}
          >
            {isFinished && currentIndex === allQuestions.length - 1
              ? "Perpara"
              : currentIndex === allQuestions.length - 1
                ? "Perfundo"
                : "Perpara"}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={22}
            color={getThemeColor(
              isFinished && currentIndex === allQuestions.length - 1
                ? "--muted-foreground"
                : currentIndex === allQuestions.length - 1
                  ? "--primary-foreground"
                  : "--foreground",
              colorScheme,
            )}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default Test;
