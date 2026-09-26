import React from "react";

import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { PressableFeedback } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { View } from "~/components/ui";
import { cn } from "~/lib/utils";
import { type ReadingView } from "~/store/reading-state-store";

import { ChapterSelect } from "./chapter-select";

export function ReadingHeader({
  view,
  onToggleView,
}: {
  view: ReadingView;
  onToggleView: () => void;
}) {
  const foregroundColor = useCSSVariable("--foreground") as string;
  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 absolute top-0 left-0 z-10 w-full">
      <View className="flex-row items-center justify-between">
        <View>
          <PressableFeedback
            accessibilityLabel={
              view === "default" ? "Show favorites" : "Show current chapter"
            }
            accessibilityRole="button"
            className="bg-default/70 flex-row items-center rounded-full p-1"
            onPress={onToggleView}
          >
            <View
              className={cn(
                "size-7 flex-row items-center justify-center",
                view === "default" && "bg-foreground/5 rounded-full"
              )}
            >
              <Feather
                name="book-open"
                size={16}
                color={view === "default" ? foregroundColor : mutedColor}
              />
            </View>
            <View
              className={cn(
                "size-7 flex-row items-center justify-center",
                view === "favorites" && "bg-foreground/5 rounded-full"
              )}
            >
              <MaterialIcons
                name="favorite-outline"
                size={16}
                color={view === "favorites" ? foregroundColor : mutedColor}
              />
            </View>
          </PressableFeedback>
        </View>

        {view === "default" && (
          <View>
            <ChapterSelect />
          </View>
        )}
      </View>
    </View>
  );
}
