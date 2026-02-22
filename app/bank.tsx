import { CATEGORIES } from "@/constants/categories";
import { questions as questionsSchema } from "@/db/schema";
import { useDrizzle } from "@/hooks/useDrizzle";
import Ionicons from "@expo/vector-icons/Ionicons";
import { InferSelectModel } from "drizzle-orm";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

// Removed getInitials and getColorFromString functions

const Header: React.FC<{
  title?: string | null;
  subtitle?: string | null;
  onBack: () => void;
  onFocusStart?: () => void;
}> = ({ title, subtitle, onBack, onFocusStart }) => {
  return (
    <View className="w-full mb-4 px-6">
      <View className="flex-row items-center justify-between bg-card rounded-xl p-3 border border-border shadow">
        <Pressable onPress={onBack} className="p-2 rounded-full bg-card/60">
          <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
        </Pressable>

        <View className="flex-1 px-3">
          <Text
            className="text-lg font-bold text-foreground text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="text-sm text-muted-foreground text-center mt-1"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center space-x-3">
          <Pressable
            onPress={onFocusStart}
            className="p-2 rounded-md items-center justify-center bg-emerald-500"
            accessibilityLabel="Start focused test"
          >
            <Ionicons name="rocket" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const Bank = () => {
  const { drizzleDb } = useDrizzle();

  const subjects = useMemo(() => Object.keys(CATEGORIES), []);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [questions, setQuestions] = useState<
    InferSelectModel<typeof questionsSchema>[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuestionsFor = useCallback(
    async (examTitle: string) => {
      if (!drizzleDb) return;

      try {
        const result = await drizzleDb.query.questions.findMany({
          where: (q, { eq }) => eq(q.exam_title, examTitle),
        });
        setQuestions(result as any);
      } catch (e) {
        console.error("Failed to load questions", e);
        setQuestions([]);
      }
    },
    [drizzleDb],
  );

  useEffect(() => {
    if (selectedSubject && selectedSubcategory) {
      // subcategory strings correspond to `exam_title` in the DB
      fetchQuestionsFor(selectedSubcategory);
    }
  }, [selectedSubject, selectedSubcategory, fetchQuestionsFor]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedSubcategory) {
      await fetchQuestionsFor(selectedSubcategory);
    }
    setRefreshing(false);
  }, [selectedSubcategory, fetchQuestionsFor]);

  const startFocusedTest = (scope: {
    subject?: string | null;
    subcategory?: string | null;
  }) => {
    console.log("startFocusedTest placeholder", scope);
    // TODO: implement navigation to a focused test session that uses only
    // the questions for `scope.subcategory` (or all subcategories in `scope.subject`).
  };

  return (
    <View className="flex-1 bg-background">
      {/* Step 1: show three main subjects */}
      {!selectedSubject && (
        <ScrollView
          className="w-full"
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        >
          {subjects.map((subject) => (
            <Pressable
              key={subject}
              onPress={() => {
                setSelectedSubject(subject);
                setSelectedSubcategory(null);
                setQuestions([]);
              }}
              className="w-full bg-card rounded-lg border border-border p-4"
            >
              <Text className="text-lg font-medium text-secondary-foreground">
                {subject}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                {CATEGORIES[subject].length} nën-kategori
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Step 2: show subcategories when a subject is selected */}
      {selectedSubject && !selectedSubcategory && (
        <View className="w-full">
          <Header
            title={selectedSubject}
            subtitle={`${CATEGORIES[selectedSubject].length} nën-kategori`}
            onBack={() => setSelectedSubject(null)}
            onFocusStart={() => startFocusedTest({ subject: selectedSubject })}
          />

          <ScrollView
            className="w-full"
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {CATEGORIES[selectedSubject].map((sub) => (
              <Pressable
                key={sub}
                onPress={() => {
                  setSelectedSubcategory(sub);
                }}
                className="w-full bg-transparent rounded-lg border border-border p-4"
              >
                <Text className="text-base text-foreground font-medium">
                  {sub}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Step 3: show questions for subcategory */}
      {selectedSubject && selectedSubcategory && (
        <View className="w-full mt-2 flex-1">
          <Header
            title={selectedSubcategory}
            subtitle={selectedSubject}
            onBack={() => setSelectedSubcategory(null)}
            onFocusStart={() =>
              startFocusedTest({
                subject: selectedSubject,
                subcategory: selectedSubcategory,
              })
            }
          />

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            <View className="w-full gap-3">
              {questions.length === 0 && (
                <Text className="text-muted-foreground">
                  Nuk u gjetën pyetje
                </Text>
              )}

              {questions.map((q) => (
                <View
                  key={q.id}
                  className="w-full bg-transparent rounded-lg border border-border p-4"
                >
                  <Text className="text-sm text-muted-foreground">
                    {q.exam_title} - Pyetja #{q.id}
                  </Text>
                  <Text className="text-base text-foreground mt-2">
                    {q.question_text}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Bank;
