import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SubjectCardProps {
  subject: string;
  subcategoryCount: number;
  onPress: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  subcategoryCount,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm active:opacity-75"
    >
      <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center mr-4">
        <Ionicons name="folder-open" size={36} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-foreground mb-1">
          {subject}
        </Text>
        <Text className="text-sm font-medium text-muted-foreground">
          {subcategoryCount} Nën-kategori
        </Text>
      </View>
      <View className="w-8 h-8 rounded-full bg-background items-center justify-center border border-border">
        <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
      </View>
    </Pressable>
  );
};
