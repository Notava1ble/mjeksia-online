import { getThemeColor } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getThemeColor("--primary", theme),
        headerStyle: {
          backgroundColor: getThemeColor("--background", theme),
        },
        headerShadowVisible: false,
        headerTintColor: getThemeColor("--foreground", theme),
        tabBarStyle: {
          backgroundColor: getThemeColor("--background", theme),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mistakes"
        options={{
          title: "Mistakes",
          // headerRight: () => (
          //   <View style={{ marginRight: 15 }}>
          //     <Text style={{ color: getThemeColor("--primary", colorScheme) }}>
          //       {5} Items
          //     </Text>
          //   </View>
          // ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "close-circle-sharp" : "close-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings-sharp" : "settings-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
