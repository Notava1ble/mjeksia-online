import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SubcategoryCardProps {
  subcategory: string;
  index: number;
  onPress: () => void;
}

export const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  subcategory,
  index,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-card px-5 py-4 rounded-2xl border border-border/80 shadow-sm active:opacity-75"
    >
      <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mr-4">
        <Text className="text-foreground font-bold">{index + 1}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">
          {subcategory}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#d4d4d8" />
    </Pressable>
  );
};
