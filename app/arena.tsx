import DynamicImage from "@/components/DynamicImage";
import { imageMap } from "@/db/imageMap";
import questions, { questionType } from "@/db/questions";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Arena() {
  const [currentQuestion, setCurrentQuestion] = useState<questionType>(
    questions.at(Math.floor(Math.random() * questions.length))!
  );
  const [guess, setGuess] = useState<keyof questionType["options"] | undefined>(
    undefined
  );

  const onGuess = (
    letter: typeof guess,
    answer: typeof guess,
    explanation: string
  ) => {
    if (!guess) {
      setGuess(letter);
      return;
    }

    if (letter === answer) {
      alert(explanation);
    }
  };

  const onNext = () => {
    setGuess(undefined);
    setCurrentQuestion(
      questions.at(Math.floor(Math.random() * questions.length))!
    );
  };

  return (
    <View className="flex-1 bg-background p-6 justify-between">
      <View>
        <Text className="text-muted-foreground mb-2">
          Pyetja {currentQuestion.id} - {currentQuestion.subject}
        </Text>
        <Text className="text-foreground text-lg leading-6">
          {currentQuestion.question_text}
        </Text>

        <View className="mt-4 h-64 w-full border-2 border-muted rounded-md items-center justify-center">
          {currentQuestion.image ? (
            <View className="px-12">
              <DynamicImage
                source={
                  imageMap[currentQuestion.image as keyof typeof imageMap]
                }
              />
            </View>
          ) : (
            <Text className="text-muted-foreground">No Image</Text>
          )}
        </View>
        <View className="gap-3 mt-6">
          <Pressable
            className={cn(
              "border-border bg-secondary border px-4 py-2 rounded-md",
              guess === "A" && "bg-destructive border-destructive",
              guess &&
                currentQuestion.answer === "A" &&
                "bg-green-600 border-green-900"
            )}
            onPress={() =>
              onGuess("A", currentQuestion.answer, currentQuestion.explanation)
            }
          >
            <Text className="text-foreground">
              A: {currentQuestion.options.A}
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "border-border bg-secondary border px-4 py-2 rounded-md",
              guess === "B" && "bg-destructive border-destructive",
              guess &&
                currentQuestion.answer === "B" &&
                "bg-green-600 border-green-900"
            )}
            onPress={() =>
              onGuess("B", currentQuestion.answer, currentQuestion.explanation)
            }
          >
            <Text className="text-foreground">
              B: {currentQuestion.options.B}
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "border-border bg-secondary border px-4 py-2 rounded-md",
              guess === "C" && "bg-destructive border-destructive",
              guess &&
                currentQuestion.answer === "C" &&
                "bg-green-600 border-green-900"
            )}
            onPress={() =>
              onGuess("C", currentQuestion.answer, currentQuestion.explanation)
            }
          >
            <Text className="text-foreground">
              C: {currentQuestion.options.C}
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "border-border bg-secondary border px-4 py-2 rounded-md",
              guess === "D" && "bg-destructive border-destructive",
              guess &&
                currentQuestion.answer === "D" &&
                "bg-green-600 border-green-900"
            )}
            onPress={() =>
              onGuess("D", currentQuestion.answer, currentQuestion.explanation)
            }
          >
            <Text className="text-foreground">
              D: {currentQuestion.options.D}
            </Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        className="bg-primary p-4 w-full rounded-lg active:bg-primary/90 flex-row justify-between items-center"
        onPress={onNext}
      >
        <Text className="font-semibold text-lg">Next Question</Text>
        <Ionicons name="arrow-forward" size={22} />
      </Pressable>
    </View>
  );
}
