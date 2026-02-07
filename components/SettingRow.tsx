// components/SettingRow.tsx
import { SettingsKey, settingsSchema, useSetting } from "@/constants/settings";
import { cn } from "@/lib/utils";
import { Pressable, Text, View } from "react-native";

export function SettingRow<K extends SettingsKey>({
  settingKey,
  onUpdate,
}: {
  settingKey: K;
  onUpdate?: (value: string) => void;
}) {
  const [value, setValue] = useSetting(settingKey);
  const def = settingsSchema[settingKey];
  const entries = Object.entries(def.options);

  const handleSelect = (optionValue: string) => {
    // Safe: optionValue comes directly from def.options keys
    setValue(optionValue as Parameters<typeof setValue>[0]);
    onUpdate?.(optionValue);
  };

  return (
    <View className="py-4">
      <Text className="text-foreground font-medium mb-3">{def.label}</Text>
      <View className="flex-row gap-2">
        {entries.map(([optVal, optLabel]) => (
          <Pressable
            key={optVal}
            onPress={() => handleSelect(optVal)}
            className={cn(
              "px-4 py-2 rounded-lg border",
              optVal === value
                ? "bg-primary border-primary"
                : "bg-secondary border-border",
            )}
          >
            <Text
              className={cn(
                optVal === value
                  ? "text-primary-foreground font-semibold"
                  : "text-foreground",
              )}
            >
              {optLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
