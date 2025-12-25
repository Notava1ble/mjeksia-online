import { getThemeColor, themes } from "../constants/theme";
import "../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useColorScheme } from "nativewind";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    const savedTheme = Storage.getItemSync("user_theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setColorScheme(savedTheme);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      SystemUI.setBackgroundColorAsync(
        getThemeColor("--background", colorScheme)
      );
    }
  }, [colorScheme]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady && !hasHiddenSplash.current) {
      hasHiddenSplash.current = true;

      SplashScreen.hide();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <View
      key={colorScheme}
      onLayout={onLayoutRootView}
      style={[themes[colorScheme ?? "light"], { flex: 1 }]}
      className="bg-background"
    >
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <SQLiteProvider
          databaseName="questions.db"
          assetSource={{ assetId: require("@/assets/questions.db") }}
          useSuspense
        >
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: getThemeColor("--background", colorScheme),
              },
              headerShadowVisible: false,
              headerTintColor: getThemeColor("--foreground", colorScheme),
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="arena"
              options={{
                title: "Arena",
                animation: "fade",
                headerShown: true,
              }}
            />
          </Stack>
          <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
        </SQLiteProvider>
      </Suspense>
    </View>
  );
}
