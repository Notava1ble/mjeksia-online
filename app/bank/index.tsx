import { SubjectCard } from "@/components/SubjectCard";
import { CATEGORIES } from "@/constants/categories";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function BankSubjects() {
  const router = useRouter();
  const subjects = useMemo(() => Object.keys(CATEGORIES), []);

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <View className="px-5 mt-4 mb-6">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mb-4 active:opacity-75 self-start"
          >
            <Ionicons name="arrow-back" size={20} color="#71717A" />
            <Text className="text-muted-foreground font-medium text-base ml-2">
              Kthehu
            </Text>
          </Pressable>

          <Text className="text-4xl font-black text-foreground tracking-tight">
            Fondi i
          </Text>
          <Text className="text-4xl font-black text-primary tracking-tight">
            Pyetjeve
          </Text>
          <Text className="text-base text-muted-foreground mt-3 font-medium">
            Eksploroni pyetjet sipas kategorive dhe nisni përgatitjen tuaj.
          </Text>
        </View>

        <ScrollView
          className="w-full flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {subjects.map((subject) => (
            <SubjectCard
              key={subject}
              subject={subject}
              subcategoryCount={CATEGORIES[subject].length}
              onPress={() => {
                router.push({
                  pathname: "/bank/[subject]",
                  params: { subject },
                });
              }}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
