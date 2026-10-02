import React from "react";

import { StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  BottomSheet,
  type InputRef,
  PressableFeedback,
  SearchField,
  useBottomSheetAwareHandlers,
} from "heroui-native";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { CHAPTERS, type Chapter, getChapter } from "~/constants/chapters";
import { useDebounce } from "~/hooks/use-debounce";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";
import { useReadingState } from "~/store/reading-state-store";

interface ChapterSelectProps {
  className?: string;
}

export function ChapterSelect({ className }: ChapterSelectProps) {
  const chapterNumber = useReadingState((state) => state.chapterNumber);
  const setChapterNumber = useReadingState((state) => state.setChapterNumber);
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const searchInputRef = React.useRef<InputRef>(null);

  const selected = getChapter(chapterNumber) ?? CHAPTERS[0];
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
          accessibilityLabel="Choose a chapter"
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
            <ChapterSearchField
              ref={searchInputRef}
              value={query}
              onChange={setQuery}
            />
          </View>

          <ChapterList
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

  function handleSelect(chapter: Chapter) {
    searchInputRef.current?.blur();
    setChapterNumber(chapter.chapterNumber);
    setIsOpen(false);
    setQuery("");
    triggerHaptic("Light");
  }
}

const ChapterSearchField = React.forwardRef<
  InputRef,
  {
    value: string;
    onChange: (value: string) => void;
  }
>(function ChapterSearchField({ value, onChange }, ref) {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <SearchField value={value} onChange={onChange}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input
          ref={ref}
          placeholder="Search chapters"
          returnKeyType="search"
          className="rounded-full"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
});

function ChapterList({
  query,
  selected,
  onSelect,
}: {
  query: string;
  selected: Chapter;
  onSelect: (chapter: Chapter) => void;
}) {
  const debouncedQuery = useDebounce(query, 150);

  const matches = React.useMemo(
    () => filterChapters(debouncedQuery),
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
        <ChapterRow
          chapter={item}
          isSelected={item.chapterNumber === selected.chapterNumber}
          onPress={() => onSelect(item)}
        />
      )}
      ListEmptyComponent={<EmptyState query={debouncedQuery} />}
    />
  );
}

function ChapterRow({
  chapter,
  isSelected,
  onPress,
}: {
  chapter: Chapter;
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
        <Text className="font-medium">
          {`${chapter.chapterNumber}. ${chapter.name}`}
        </Text>
        <Text className="text-muted text-sm">{chapter.englishName}</Text>
      </View>
    </PressableFeedback>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Text className="text-muted py-8 text-center">
      No chapter matches “{query.trim()}”
    </Text>
  );
}

function filterChapters(query: string) {
  const search = query.trim().toLowerCase();

  if (!search) {
    return CHAPTERS;
  }

  return CHAPTERS.filter(
    (chapter) =>
      chapter.name.toLowerCase().includes(search) ||
      chapter.englishName.toLowerCase().includes(search) ||
      String(chapter.chapterNumber) === search
  );
}

const keyExtractor = (chapter: Chapter) => String(chapter.chapterNumber);

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
