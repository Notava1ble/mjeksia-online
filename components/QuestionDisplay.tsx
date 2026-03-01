import MarkdownTable from "@/components/MarkdownTable";
import MathText from "@/components/MathText";
import { ImageModal } from "@/components/modals/ImageModal";
import { QuestionImage } from "@/components/QuestionImage";
import { OptionLetter, QuestionOptions } from "@/components/QuestionOptions";
import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { questions } from "@/services/db/schema";
import { useSetting } from "@/services/settings/settings";
import { type InferSelectModel } from "drizzle-orm";
import React, { useState } from "react";
import { Text, View } from "react-native";

interface QuestionDisplayProps {
  question: InferSelectModel<typeof questions>;
  selectedOption?: OptionLetter;
  onOptionPress: (letter: OptionLetter) => void;
  isRevealed: boolean;
  disabled?: boolean;
  indexInfo?: string;
  showExplanationHeader?: boolean;
  horizontalPadding?: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOption,
  onOptionPress,
  isRevealed,
  disabled,
  indexInfo,
  showExplanationHeader = true,
  horizontalPadding = 16,
}) => {
  const { scheme, theme } = useAppTheme();
  const [hideExplanation] = useSetting("hide_arena_explanation");
  const [showAdvancedReasoning] = useSetting(
    "show_reasoning_instead_of_explanation",
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <View>
      <ImageModal
        visible={isImageModalOpen}
        imageKey={question.image}
        onClose={() => setIsImageModalOpen(false)}
      />

      {indexInfo && (
        <Text className="text-muted-foreground mb-2">
          {indexInfo} - {question.exam_title}
        </Text>
      )}

      <MathText
        color={getThemeColor("--foreground", scheme, theme)}
        text={question.question_text}
        className="text-foreground text-lg leading-6 font-medium"
        paddingHorizontal={horizontalPadding * 2}
      />

      <MarkdownTable
        content={question.table_content}
        horizontalPadding={horizontalPadding * 2}
        className="mt-4"
      />

      <QuestionImage
        imageKey={question.image}
        onPress={() => setIsImageModalOpen(true)}
      />

      <QuestionOptions
        options={question}
        correctAnswer={question.answer}
        selectedOption={selectedOption}
        onOptionPress={onOptionPress}
        isRevealed={isRevealed}
        disabled={disabled}
        horizontalPadding={horizontalPadding}
      />

      {isRevealed && !hideExplanation && (
        <View className="mt-4 p-4 bg-secondary rounded-lg border border-border/30">
          {showExplanationHeader && (
            <Text className="text-secondary-foreground font-bold mb-1">
              {showAdvancedReasoning ? "Arsyetimi:" : "Shpjegimi:"}
            </Text>
          )}
          <MathText
            color={getThemeColor("--secondary-foreground", scheme, theme, 0.9)}
            text={
              showAdvancedReasoning ? question.reasoning : question.explanation
            }
            className="text-secondary-foreground/90 text-sm"
            fontSize={14}
            // Account for ScrollView padding + button padding + border
            paddingHorizontal={horizontalPadding * 2 + 16 * 2 + 1}
          />
        </View>
      )}
    </View>
  );
};
