import { cn } from "@/lib/utils";
import { View } from "react-native";

const ToggleSwitch = ({ isEnabled }: { isEnabled: boolean }) => {
  return (
    <View
      className={cn(
        "w-12 h-6 rounded-full px-1 justify-center border border-border",
        isEnabled ? "bg-primary" : "bg-muted",
      )}
    >
      <View
        className={cn(
          "w-4 h-4 rounded-full bg-background",
          isEnabled
            ? "translate-x-6 bg-background"
            : "translate-x-0 bg-muted-foreground",
        )}
      />
    </View>
  );
};

export default ToggleSwitch;
