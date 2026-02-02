import { testSessions } from "@/db/schema";
import { getRecentTests } from "@/db/tests";
import { useDrizzle } from "@/hooks/useDrizzle";
import { InferSelectModel } from "drizzle-orm";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  const { drizzleDb, migrationError, migrationSuccess } = useDrizzle();

  const [recentTests, setRecentTests] = useState<
    InferSelectModel<typeof testSessions>[] | undefined
  >();

  const fetchTests = async () => {
    const response = await getRecentTests(drizzleDb, 3);
    setRecentTests(response);
  };

  useEffect(() => {
    if (!migrationSuccess) return;
    fetchTests();
  }, [drizzleDb]);

  if (migrationError) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-foreground">
          Migration error: {migrationError.message}
        </Text>
      </View>
    );
  }

  if (!migrationSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-foreground">Updating...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6">
      <View>
        <Link
          href="/arena"
          className="bg-primary p-4 w-full rounded-lg active:bg-primary/90"
        >
          <Text className="font-semibold text-lg">Pyetje te Cfaredoshme</Text>
        </Link>
        <View className="mt-4 flex flex-row gap-4">
          <Link
            href="/test"
            className="border border-border p-4 w-[48%] rounded-lg active:bg-secondary"
          >
            <Text className="text-foreground font-semibold text-lg">
              Model Testi
            </Text>
          </Link>
          <Pressable className="border border-border p-4 w-[48%] rounded-lg active:bg-secondary">
            <Text className="text-foreground font-semibold text-lg">
              W.I.P.
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
