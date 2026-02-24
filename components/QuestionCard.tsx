import { questions as questionsSchema } from "@/db/schema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { InferSelectModel } from "drizzle-orm";
import React from "react";
import { Text, View } from "react-native";

interface QuestionCardProps {
  question: InferSelectModel<typeof questionsSchema>;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
}) => {
  return (
    <View className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <View className="bg-secondary/60 px-5 py-3 flex-row items-center justify-between border-b border-border/50">
        <View className="flex-row items-center">
          <View className="w-7 h-7 rounded-full bg-background items-center justify-center mr-3 border border-border">
            <Text className="text-xs font-bold text-foreground">
              {index + 1}
            </Text>
          </View>
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Pyetja #{question.id}
          </Text>
        </View>
        <Ionicons name="help-circle" size={18} color="#a1a1aa" />
      </View>
      <View className="p-5">
        <Text className="text-base text-foreground font-medium leading-relaxed">
          {question.question_text}
        </Text>
      </View>
    </View>
  );
};
