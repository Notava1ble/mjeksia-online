import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, View } from "react-native";
import { ActionCard } from "./ActionCard";

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
    <ActionCard
      title={subcategory}
      variant="default"
      onPress={onPress}
      leftElement={
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4">
          <Text className="text-card-foreground text-2xl font-bold">
            {index + 1}
          </Text>
        </View>
      }
      rightElement={
        <Ionicons name="chevron-forward" size={18} color="#d4d4d8" />
      }
    />
  );
};
