import { CATEGORIES } from "@/constants/categories";
import { questions as questionsSchema } from "@/db/schema";
import { useDrizzle } from "@/hooks/useDrizzle";
import Ionicons from "@expo/vector-icons/Ionicons";
import { InferSelectModel } from "drizzle-orm";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header: React.FC<{
  title?: string | null;
  subtitle?: string | null;
  onBack: () => void;
  onFocusStart?: () => void;
  showFocusButton?: boolean;
}> = ({ title, subtitle, onBack, onFocusStart, showFocusButton = false }) => {
  return (
    <View className="mb-4 px-4 pt-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-secondary active:opacity-80"
        >
          <Ionicons name="chevron-back" size={20} color="#71717A" />
        </Pressable>

        <View className="flex-1 px-4 items-center">
          <Text
            className="text-xl font-extrabold text-foreground text-center"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              className="text-sm text-muted-foreground text-center mt-0.5 font-medium"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="w-10 h-10 items-center justify-center">
          {showFocusButton ? (
            <Pressable
              onPress={onFocusStart}
              className="w-10 h-10 items-center justify-center rounded-full bg-primary active:opacity-80 shadow-md shadow-primary/30"
              accessibilityLabel="Start focused test"
            >
              <Ionicons name="rocket" size={18} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default function Bank() {
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuestionsFor = useCallback(
    async (examTitle: string) => {
      if (!drizzleDb) return;

      setIsLoading(true);
      try {
        const result = await drizzleDb.query.questions.findMany({
          where: (q, { eq }) => eq(q.exam_title, examTitle),
        });
        setQuestions(result as any);
      } catch (e) {
        console.error("Failed to load questions", e);
        setQuestions([]);
      } finally {
        setIsLoading(false);
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
    // TODO: implement navigation to a focused test session
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Step 1: Subjects Selection */}
      {!selectedSubject && (
        <View className="flex-1">
          <View className="px-5 mt-6 mb-6">
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
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {subjects.map((subject, index) => {
              // Alternate subtle background colors for icons or use a consistent one
              const isEven = index % 2 === 0;
              return (
                <Pressable
                  key={subject}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setSelectedSubcategory(null);
                    setQuestions([]);
                  }}
                  className="flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm active:opacity-75"
                >
                  <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center mr-4">
                    <Ionicons name="folder-open" size={26} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-1">
                      {subject}
                    </Text>
                    <Text className="text-sm font-medium text-muted-foreground">
                      {CATEGORIES[subject].length} Nën-kategori
                    </Text>
                  </View>
                  <View className="w-8 h-8 rounded-full bg-background items-center justify-center border border-border">
                    <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Step 2: Subcategories Selection */}
      {selectedSubject && !selectedSubcategory && (
        <View className="flex-1">
          <Header
            title={selectedSubject}
            subtitle={`${CATEGORIES[selectedSubject].length} nën-kategori`}
            onBack={() => setSelectedSubject(null)}
            onFocusStart={() => startFocusedTest({ subject: selectedSubject })}
            showFocusButton
          />

          <ScrollView
            className="w-full flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {CATEGORIES[selectedSubject].map((sub, index) => (
              <Pressable
                key={sub}
                onPress={() => {
                  setSelectedSubcategory(sub);
                }}
                className="flex-row items-center bg-card px-5 py-4 rounded-2xl border border-border/80 shadow-sm active:opacity-75"
              >
                <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mr-4">
                  <Text className="text-foreground font-bold">{index + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {sub}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#d4d4d8" />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Step 3: Questions View */}
      {selectedSubject && selectedSubcategory && (
        <View className="flex-1">
          <Header
            title={selectedSubcategory}
            subtitle={selectedSubject}
            onBack={() => {
              setSelectedSubcategory(null);
              setQuestions([]); // Clear questions to prevent flashing old data
            }}
            onFocusStart={() =>
              startFocusedTest({
                subject: selectedSubject,
                subcategory: selectedSubcategory,
              })
            }
            showFocusButton
          />

          <View className="flex-1 w-full px-5">
            <View className="bg-secondary p-5 rounded-3xl mb-4 flex-row items-center justify-between border border-border">
              <View className="flex-1">
                <Text className="text-3xl font-black text-foreground">
                  {isLoading ? "..." : questions.length}
                </Text>
                <Text className="text-muted-foreground font-medium text-base mt-1">
                  Pyetje në total
                </Text>
              </View>
              <View className="w-16 h-16 rounded-2xl bg-background items-center justify-center rotate-3 border border-border">
                <Ionicons name="document-text" size={32} color="#3b82f6" />
              </View>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center py-16">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-muted-foreground font-medium mt-4">
                  Duke ngarkuar pyetjet...
                </Text>
              </View>
            ) : questions.length === 0 ? (
              <View className="items-center justify-center py-16">
                <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-6">
                  <Ionicons name="search" size={40} color="#a1a1aa" />
                </View>
                <Text className="text-foreground font-bold text-xl mb-2">
                  Nuk u gjetën pyetje
                </Text>
                <Text className="text-muted-foreground text-center px-4">
                  Nuk ka pyetje të disponueshme për këtë nën-kategori aktualisht.
                </Text>
              </View>
            ) : (
              <FlatList
                data={questions}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                renderItem={({ item: q, index }) => (
                  <View
                    className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm"
                  >
                    <View className="bg-secondary/60 px-5 py-3 flex-row items-center justify-between border-b border-border/50">
                      <View className="flex-row items-center">
                        <View className="w-7 h-7 rounded-full bg-background items-center justify-center mr-3 border border-border">
                          <Text className="text-xs font-bold text-foreground">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Pyetja #{q.id}
                        </Text>
                      </View>
                      <Ionicons name="help-circle" size={18} color="#a1a1aa" />
                    </View>
                    <View className="p-5">
                      <Text className="text-base text-foreground font-medium leading-relaxed">
                        {q.question_text}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
