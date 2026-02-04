import React from "react";
import { Pressable, Text } from "react-native";
import ToggleSwitch from "./ToggleSwitch";

const SettingsToggle = ({
  text,
  isEnabled,
  action,
}: {
  text: string;
  isEnabled: boolean;
  action: () => void;
}) => {
  return (
    <Pressable
      className="flex-row items-center justify-between py-4"
      onPress={action}
    >
      <Text className="text-lg text-foreground font-semibold">{text}</Text>
      <ToggleSwitch isEnabled={isEnabled} />
    </Pressable>
  );
};

export default SettingsToggle;
