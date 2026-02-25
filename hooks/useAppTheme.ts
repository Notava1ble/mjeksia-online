import { useSetting } from "@/services/settings/settings";
import { useColorScheme } from "react-native";

export function useAppTheme() {
  const [themeSetting] = useSetting("user_theme");
  const systemScheme = useColorScheme();

  const resolvedTheme =
    themeSetting === "system"
      ? ((systemScheme ?? "light") as "light" | "dark")
      : (themeSetting as "light" | "dark");

  const isDark = resolvedTheme === "dark";

  return { theme: resolvedTheme, isDark } as const;
}
