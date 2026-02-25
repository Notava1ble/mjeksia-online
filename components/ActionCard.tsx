import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export interface ActionCardProps {
  title: string;
  subtitle?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  variant?: "default" | "large";
  onPress?: () => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  variant = "default",
  onPress,
  className,
}) => {
  const isLarge = variant === "large";

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center bg-card border shadow-sm active:opacity-75",
        isLarge
          ? "p-5 rounded-3xl border-border"
          : "px-5 py-4 rounded-2xl border-border/80",
        className,
      )}
    >
      {leftElement && leftElement}

      <View className="flex-1">
        <Text
          className={cn(
            "text-foreground",
            isLarge ? "text-lg font-bold mb-1" : "text-base font-semibold",
          )}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm font-medium text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement && rightElement}
    </Pressable>
  );
};
