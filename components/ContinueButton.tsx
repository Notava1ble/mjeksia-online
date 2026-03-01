import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ContinueButtonProps {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onPress,
  label = "Vazhdo",
  disabled = false,
  icon = "arrow-forward",
}) => {
  const { scheme, theme } = useAppTheme();

  return (
    <View className="p-6 border-t border-border bg-background">
      <Pressable
        className={`p-4 w-full rounded-lg flex-row justify-between items-center ${
          disabled ? "bg-muted opacity-50" : "bg-primary active:bg-primary/90"
        }`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className="font-semibold text-lg text-primary-foreground">
          {label}
        </Text>
        {icon && (
          <Ionicons
            name={icon as any}
            size={22}
            color={getThemeColor("--primary-foreground", scheme, theme)}
          />
        )}
      </Pressable>
    </View>
  );
};
