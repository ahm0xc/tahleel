import React from "react";

import { StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  BottomSheet,
  PressableFeedback,
  SearchField,
  useBottomSheetAwareHandlers,
} from "heroui-native";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { SURAHS, type Surah } from "~/constants/surahs";
import { useDebounce } from "~/hooks/use-debounce";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

interface SurahSelectProps {
  className?: string;
  onValueChange?: (surah: Surah) => void;
}

export function SurahSelect({ className, onValueChange }: SurahSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Surah>(SURAHS[0]);

  const mutedColor = useCSSVariable("--muted") as string;

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Trigger asChild>
        <PressableFeedback
          className={cn(
            "bg-default/70 flex-row items-center gap-1 rounded-full py-1 pr-1.5 pl-2.5",
            className
          )}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          accessibilityLabel="Choose a surah"
        >
          <Text className="text-sm">{selected.name}</Text>
          <View className={cn(isOpen && "rotate-180")}>
            <Feather name="chevron-down" size={14} color={mutedColor} />
          </View>
        </PressableFeedback>
      </BottomSheet.Trigger>

      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={["75%"]}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full"
          keyboardBehavior="extend"
        >
          <View className="pb-3">
            <SurahSearchField value={query} onChange={setQuery} />
          </View>

          <SurahList
            query={query}
            selected={selected}
            onSelect={handleSelect}
          />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setQuery("");
    }
  }

  function handleSelect(surah: Surah) {
    setSelected(surah);
    setIsOpen(false);
    setQuery("");
    triggerHaptic("Light");
    onValueChange?.(surah);
  }
}

function SurahSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <SearchField value={value} onChange={onChange}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          placeholder="Search surahs"
          returnKeyType="search"
          className="rounded-full"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

function SurahList({
  query,
  selected,
  onSelect,
}: {
  query: string;
  selected: Surah;
  onSelect: (surah: Surah) => void;
}) {
  const debouncedQuery = useDebounce(query, 150);

  const matches = React.useMemo(
    () => filterSurahs(debouncedQuery),
    [debouncedQuery]
  );

  return (
    <BottomSheetFlatList
      data={matches}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      renderItem={({ item }) => (
        <SurahRow
          surah={item}
          isSelected={item.chapterNumber === selected.chapterNumber}
          onPress={() => onSelect(item)}
        />
      )}
      ListEmptyComponent={<EmptyState query={debouncedQuery} />}
    />
  );
}

function SurahRow({
  surah,
  isSelected,
  onPress,
}: {
  surah: Surah;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableFeedback
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        className={cn(
          "flex-1 gap-0.5 rounded-xl px-2 py-2.5",
          isSelected && "bg-default"
        )}
      >
        <Text className="font-medium">{`${surah.chapterNumber}. ${surah.name}`}</Text>
        <Text className="text-muted text-sm">{surah.englishName}</Text>
      </View>
    </PressableFeedback>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Text className="text-muted py-8 text-center">
      No surah matches “{query.trim()}”
    </Text>
  );
}

function filterSurahs(query: string) {
  const search = query.trim().toLowerCase();

  if (!search) {
    return SURAHS;
  }

  return SURAHS.filter(
    (surah) =>
      surah.name.toLowerCase().includes(search) ||
      surah.englishName.toLowerCase().includes(search) ||
      String(surah.chapterNumber) === search
  );
}

const keyExtractor = (surah: Surah) => String(surah.chapterNumber);

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
