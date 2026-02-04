import { testSessions } from "@/db/schema";
import { getRecentTests } from "@/db/tests";
import { useDrizzle } from "@/hooks/useDrizzle";
import { InferSelectModel } from "drizzle-orm";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

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
      <View className="mt-10">
        <Text className="text-foreground text-xl font-semibold">
          Historia e Testeve
        </Text>
        <View className="w-full items-center mt-4">
          {recentTests ? (
            recentTests.length !== 0 ? (
              <View className="w-full bg-secondary rounded-lg border border-border p-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-medium text-secondary-foreground">
                    Model Testi #1
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Data: 11/22/2026
                  </Text>
                </View>
                <View className="py-2 px-3 bg-green-400/40 rounded-lg">
                  <Text className="text-green-500 font-bold">31/40</Text>
                </View>
              </View>
            ) : (
              <Text className="text-muted-foreground">
                Nuk keni plotesuar asnje test
              </Text>
            )
          ) : (
            <ActivityIndicator />
          )}
        </View>
      </View>
    </View>
  );
}
