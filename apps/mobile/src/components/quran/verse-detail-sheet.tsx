import React from "react";

import { ScrollView, StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { BottomSheet, Tabs, useToast } from "heroui-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import { Button, ButtonLabel, Text, View } from "~/components/ui";
import { type Chapter } from "~/constants/chapters";
import { getTranslationLanguage } from "~/constants/translations";
import {
  TRANSLATION_LINE_HEIGHT_RATIO,
  getLineHeight,
} from "~/constants/typography";
import { type QuranVerse, getEditionVerse } from "~/lib/quran/edition-data";
import { shareTranslation } from "~/lib/quran/share";
import { usePreferences } from "~/store/preferences-store";

const TRANSLATION_TAB = "translation";
const VERSE_INFO_TAB = "verse-info";
const REFERENCE_TAB = "reference";

const SHEET_SNAP_POINT = "60%";

interface VerseDetailSheetProps {
  chapter: Chapter;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  verse: QuranVerse;
}

export function VerseDetailSheet({
  chapter,
  isOpen,
  onOpenChange,
  verse,
}: VerseDetailSheetProps) {
  const [activeTab, setActiveTab] = React.useState(TRANSLATION_TAB);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />

        <BottomSheet.Content
          snapPoints={[SHEET_SNAP_POINT]}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full"
        >
          <View className="px-safe-offset-4 flex-1 gap-3 pt-1 pb-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <Tabs.List>
                <Tabs.Indicator />
                <Tabs.Trigger value={TRANSLATION_TAB}>
                  <Tabs.Label>Translation</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Trigger value={VERSE_INFO_TAB}>
                  <Tabs.Label>Verse info</Tabs.Label>
                </Tabs.Trigger>
                <Tabs.Trigger value={REFERENCE_TAB}>
                  <Tabs.Label>Reference</Tabs.Label>
                </Tabs.Trigger>
              </Tabs.List>

              <ScrollView
                className="flex-1"
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <Tabs.Content value={TRANSLATION_TAB}>
                  <Animated.View entering={FadeIn.duration(180)}>
                    <TranslationTab
                      chapter={chapter}
                      onClose={handleClose}
                      verse={verse}
                    />
                  </Animated.View>
                </Tabs.Content>

                <Tabs.Content value={VERSE_INFO_TAB}>
                  <Animated.View entering={FadeIn.duration(180)}>
                    <PlaceholderTab label="Verse info is coming soon." />
                  </Animated.View>
                </Tabs.Content>

                <Tabs.Content value={REFERENCE_TAB}>
                  <Animated.View entering={FadeIn.duration(180)}>
                    <PlaceholderTab label="References are coming soon." />
                  </Animated.View>
                </Tabs.Content>
              </ScrollView>
            </Tabs>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );

  function handleOpenChange(open: boolean) {
    // Reopening on whatever tab was last left reads as a bug once the sheet is
    // also the way into the translation, so it always lands on that tab.
    if (open) {
      setActiveTab(TRANSLATION_TAB);
    }

    onOpenChange(open);
  }

  function handleClose() {
    onOpenChange(false);
  }
}

function TranslationTab({
  chapter,
  onClose,
  verse,
}: {
  chapter: Chapter;
  onClose: () => void;
  verse: QuranVerse;
}) {
  const translationLanguageId = usePreferences(
    (state) => state.translationLanguageId
  );
  const translationFontSize = usePreferences(
    (state) => state.translationFontSize
  );
  const language = getTranslationLanguage(translationLanguageId);
  const shareIconColor = useCSSVariable("--default-foreground") as string;
  const { toast } = useToast();
  const isSharingRef = React.useRef(false);
  const translation = React.useMemo(
    () =>
      getEditionVerse(language.editionId, chapter.chapterNumber, verse.verse)
        ?.text ?? null,
    [chapter.chapterNumber, language.editionId, verse.verse]
  );

  if (translation === null) {
    return (
      <Text className="text-muted">
        This translation is not available for this verse.
      </Text>
    );
  }

  const text = translation;

  return (
    <View className="gap-3">
      <Text
        style={{
          fontFamily: language.fontFamily,
          fontSize: translationFontSize,
          lineHeight: getLineHeight(
            translationFontSize,
            TRANSLATION_LINE_HEIGHT_RATIO
          ),
          writingDirection: language.direction,
        }}
      >
        {text}
      </Text>

      <Text className="text-muted text-sm">{language.author}</Text>

      <View className="mt-2 flex-row">
        <Button
          variant="tertiary"
          size="sm"
          haptics="Light"
          onPress={handleShare}
        >
          <Feather color={shareIconColor} name="share" size={14} />
          <ButtonLabel className="text-sm">Share</ButtonLabel>
        </Button>
      </View>
    </View>
  );

  async function handleShare() {
    if (isSharingRef.current) return;
    isSharingRef.current = true;

    onClose();

    const result = await shareTranslation(
      chapter,
      verse,
      text,
      language.author
    );

    isSharingRef.current = false;

    if (result === "failed") {
      toast.show({
        label: "Couldn't share this translation",
        variant: "danger",
      });
    }
  }
}

function PlaceholderTab({ label }: { label: string }) {
  return <Text className="text-muted py-8 text-center">{label}</Text>;
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingBottom: 24, paddingTop: 16 },
});
