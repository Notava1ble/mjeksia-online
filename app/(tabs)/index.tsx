import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-background p-6">
      <Link
        href="/arena"
        className="bg-primary p-4 w-full rounded-lg active:bg-primary/90"
      >
        <Text className="font-semibold text-lg">Random Questions</Text>
      </Link>
      <View className="mt-4 flex flex-row gap-4">
        <Link
          href="/test"
          className="border border-border p-4 w-[48%] rounded-lg active:bg-secondary"
        >
          <Text className="text-foreground font-semibold text-lg">
            Mock Exam
          </Text>
        </Link>
        <Pressable className="border border-border p-4 w-[48%] rounded-lg active:bg-secondary">
          <Text className="text-foreground font-semibold text-lg">
            Custom Test
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
