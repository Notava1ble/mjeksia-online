import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface NavigationButtonsProps {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  isNextPrimary?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  nextLabel = "Perpara",
  prevLabel = "Kthehu",
  isNextPrimary = false,
}) => {
  const { scheme, theme } = useAppTheme();

  return (
    <View className="p-6 border-t border-border bg-background flex-row gap-2">
      <Pressable
        className={cn(
          "bg-secondary p-4 flex-1 rounded-lg active:bg-secondary/90 flex-row gap-2 items-center",
          prevDisabled && "bg-muted opacity-50",
        )}
        onPress={onPrev}
        disabled={prevDisabled}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={getThemeColor(
            prevDisabled ? "--muted-foreground" : "--secondary-foreground",
            scheme,
            theme,
          )}
        />
        <Text
          className={cn(
            "font-semibold text-lg text-secondary-foreground align-center",
            prevDisabled && "text-muted-foreground",
          )}
        >
          {prevLabel}
        </Text>
      </Pressable>

      <Pressable
        className={cn(
          "p-4 flex-1 rounded-lg flex-row gap-2 items-center justify-end",
          isNextPrimary
            ? nextDisabled
              ? "bg-muted opacity-50"
              : "bg-primary active:bg-primary/90"
            : nextDisabled
              ? "bg-muted opacity-50"
              : "bg-secondary active:bg-secondary/90",
        )}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text
          className={cn(
            "font-semibold text-lg align-center",
            isNextPrimary
              ? nextDisabled
                ? "text-muted-foreground"
                : "text-primary-foreground"
              : nextDisabled
                ? "text-muted-foreground"
                : "text-secondary-foreground",
          )}
        >
          {nextLabel}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={22}
          color={getThemeColor(
            isNextPrimary
              ? nextDisabled
                ? "--muted-foreground"
                : "--primary-foreground"
              : nextDisabled
                ? "--muted-foreground"
                : "--secondary-foreground",
            scheme,
            theme,
          )}
        />
      </Pressable>
    </View>
  );
};
