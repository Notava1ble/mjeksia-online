import { getThemeColor } from "@/constants/theme";
import { formatTime } from "@/lib/utils";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { Text } from "react-native";

interface TimerHeaderProps {
  title: string;
  remainingSeconds: number;
  lowTimeThreshold?: number;
}

export const TimerHeader = ({
  title,
  remainingSeconds,
  lowTimeThreshold = 60,
}: TimerHeaderProps) => {
  const { colorScheme } = useColorScheme();
  const isLowTime = remainingSeconds <= lowTimeThreshold;

  const timerColor = isLowTime
    ? getThemeColor("--destructive", colorScheme)
    : getThemeColor("--foreground", colorScheme);

  return (
    <Stack.Screen
      options={{
        title: title,
        headerRight: () => (
          <Text
            style={{
              marginRight: 12,
              fontSize: 16,
              fontWeight: "700",
              color: timerColor,
            }}
          >
            {formatTime(remainingSeconds)}
          </Text>
        ),
      }}
    />
  );
};
