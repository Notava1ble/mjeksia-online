import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View } from "react-native";
import { ActionCard } from "./ActionCard";

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
    <ActionCard
      title={subject}
      subtitle={`${subcategoryCount} Nën-kategori`}
      variant="large"
      onPress={onPress}
      leftElement={
        <View className="w-14 h-14 rounded-2xl bg-secondary items-center justify-center mr-4">
          <Ionicons name="folder-open" size={36} color="#3b82f6" />
        </View>
      }
      rightElement={
        <View className="w-8 h-8 rounded-full bg-background items-center justify-center border border-border">
          <Ionicons name="chevron-forward" size={16} color="#a1a1aa" />
        </View>
      }
    />
  );
};
