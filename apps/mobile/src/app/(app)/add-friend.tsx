import { useEffect, useState } from "react";

import type { LayoutChangeEvent } from "react-native";
import { ScrollView, Share } from "react-native";

import { Host, Button as NativeButton } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { useCSSVariable } from "uniwind";

import { Button, ButtonLabel, Text, View } from "~/components/ui";

const INVITE_LINK = "https://example.com/invite";
const COPIED_RESET_DELAY = 2000;

export default function AddFriendScreen() {
  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-safe-offset-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full items-center gap-8">
          <Invite />
          <Actions />
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 pb-5">
      <View className="flex-row items-center gap-3">
        <Host matchContents>
          <NativeButton
            label="Back"
            systemImage="chevron.backward"
            modifiers={[
              buttonStyle("glass"),
              controlSize("extraLarge"),
              labelStyle("iconOnly"),
              buttonBorderShape("circle"),
            ]}
            onPress={() => router.back()}
          />
        </Host>
        <View>
          <Text className="text-2xl font-bold tracking-tight">Add friends</Text>
        </View>
      </View>
    </View>
  );
}

function Invite() {
  const [qrSize, setQrSize] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setQrSize(Math.floor(event.nativeEvent.layout.width));
  }

  return (
    <View className="w-full items-center gap-6">
      <View className="border-border w-full rounded-3xl border bg-white p-7">
        <View className="w-full" onLayout={handleLayout}>
          {qrSize > 0 ? (
            <QRCode
              backgroundColor="#FFFFFF"
              color="#0F0F0F"
              ecl="M"
              size={qrSize}
              value={INVITE_LINK}
            />
          ) : null}
        </View>
      </View>

      <Text className="text-muted px-2 text-center text-sm leading-5">
        Scan the QR code or send this link to your friends and family so you can
        build your hasanat circle together every day.
      </Text>
    </View>
  );
}

function Actions() {
  const [isCopied, setIsCopied] = useState(false);
  const accentForegroundColor = useCSSVariable("--accent-foreground") as string;
  const foregroundColor = useCSSVariable("--foreground") as string;

  useEffect(() => {
    if (!isCopied) return;

    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, COPIED_RESET_DELAY);

    return () => clearTimeout(timeout);
  }, [isCopied]);

  async function handleCopy() {
    try {
      await Clipboard.setStringAsync(INVITE_LINK);
      setIsCopied(true);
    } catch (err) {
      console.error("[Clipboard] Failed to copy invite link:", err);
    }
  }

  async function handleShare() {
    try {
      await Share.share({ message: INVITE_LINK });
    } catch (err) {
      console.error("[Share] Failed to share invite link:", err);
    }
  }

  return (
    <View className="w-full flex-row gap-3">
      <Button
        className="flex-1"
        haptics="Light"
        onPress={() => void handleCopy()}
        variant="secondary"
      >
        <Feather
          color={foregroundColor}
          name={isCopied ? "check" : "copy"}
          size={18}
        />
        <ButtonLabel
          className="font-semibold"
          style={{ color: foregroundColor }}
        >
          {isCopied ? "Copied" : "Copy link"}
        </ButtonLabel>
      </Button>

      <Button
        className="flex-1"
        haptics="Light"
        onPress={() => void handleShare()}
      >
        <Feather color={accentForegroundColor} name="share-2" size={18} />
        <ButtonLabel className="font-semibold">Share</ButtonLabel>
      </Button>
    </View>
  );
}
