import { Text, View } from "~/components/ui";
import type { FontFamily } from "~/constants/fonts";
import { getLineHeight } from "~/constants/typography";
import { cn } from "~/lib/utils";

interface VersePreviewCardProps {
  text: string;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeightRatio: number;
  direction: "rtl" | "ltr";
  caption?: string;
  className?: string;
}

export function VersePreviewCard({
  text,
  fontFamily,
  fontSize,
  lineHeightRatio,
  direction,
  caption,
  className,
}: VersePreviewCardProps) {
  return (
    <View
      className={cn(
        "border-border bg-surface justify-center rounded-3xl border px-5 py-6",
        className
      )}
    >
      <Text
        className="text-foreground text-center"
        style={{
          fontFamily,
          fontSize,
          lineHeight: getLineHeight(fontSize, lineHeightRatio),
          writingDirection: direction,
        }}
      >
        {text}
      </Text>

      {caption ? (
        <Text className="text-muted mt-4 text-center text-sm">{caption}</Text>
      ) : null}
    </View>
  );
}
