import { useEffect, useState } from "react";

import type { LayoutChangeEvent } from "react-native";
import { ActivityIndicator, Platform, ScrollView, Share } from "react-native";

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

import { Icon } from "~/components/icon";
import { OfflineAlert } from "~/components/offline-alert";
import { Button, ButtonLabel, Text, View } from "~/components/ui";
import { INVITE_BASE_URL } from "~/constants/config";
import { useOffline } from "~/hooks/use-offline";
import { cacheStorage } from "~/lib/storage";
import { api } from "~/trpc/client";

const COPIED_RESET_DELAY = 2000;
const INVITE_CACHE_KEY = "my-invite-code";

function readCachedInviteCode(): string | null {
  const raw = cacheStorage.getString(INVITE_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { code?: unknown }).code === "string"
    ) {
      return (parsed as { code: string }).code;
    }
  } catch (err) {
    console.error("[Invite] Failed to parse cached invite:", err);
  }

  cacheStorage.remove(INVITE_CACHE_KEY);
  return null;
}

export default function AddFriendScreen() {
  const isOffline = useOffline();
  const { data: myInvite, isLoading } = api.friends.getMyInvite.useQuery(
    undefined,
    { enabled: !isOffline }
  );
  const [cachedCode, setCachedCode] = useState<string | null>(null);

  useEffect(() => {
    if (myInvite?.code) {
      cacheStorage.set(
        INVITE_CACHE_KEY,
        JSON.stringify({ code: myInvite.code })
      );
      setCachedCode(myInvite.code);
    } else if (isOffline) {
      setCachedCode(readCachedInviteCode());
    }
  }, [myInvite?.code, isOffline]);

  const inviteCode = myInvite?.code ?? cachedCode;
  const inviteLink = inviteCode
    ? `${INVITE_BASE_URL}/invite/${inviteCode}`
    : null;

  return (
    <View className="bg-background flex-1">
      <Header />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-safe-offset-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {isOffline && !inviteLink && (
          <View className="mb-8">
            <OfflineAlert description="Your invite link can't be loaded while you're offline." />
          </View>
        )}

        <View className="w-full items-center gap-8">
          <Invite
            inviteLink={inviteLink}
            isLoading={isLoading}
            isOffline={isOffline}
          />
          <Actions inviteLink={inviteLink} isOffline={isOffline} />
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View className="pt-safe-offset-2 px-safe-offset-4 pb-5">
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center justify-start">
          {Platform.OS === "ios" ? (
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
          ) : (
            <Button isIconOnly variant="ghost" onPress={() => router.back()}>
              <Icon name="arrow-left" size={24} />
            </Button>
          )}
        </View>
        <View className="flex-1 flex-row items-center justify-center">
          <Text className="text-lg font-semibold">Add friends</Text>
        </View>
        <View className="flex-1 flex-row items-center justify-end"></View>
      </View>
    </View>
  );
}

function Invite({
  inviteLink,
  isLoading,
  isOffline,
}: {
  inviteLink: string | null;
  isLoading: boolean;
  isOffline: boolean;
}) {
  const [qrSize, setQrSize] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setQrSize(Math.floor(event.nativeEvent.layout.width));
  }

  return (
    <View className="w-full items-center gap-6">
      <View className="border-border w-full rounded-3xl border bg-white p-7">
        <View className="w-full" onLayout={handleLayout}>
          {isLoading || !inviteLink ? (
            <View
              style={{ height: qrSize > 0 ? qrSize : 260 }}
              className="items-center justify-center"
            >
              {isOffline ? (
                <Text className="text-muted px-4 text-center text-sm">
                  Connect to the internet to load your invite QR code.
                </Text>
              ) : (
                <ActivityIndicator />
              )}
            </View>
          ) : qrSize > 0 ? (
            <QRCode
              backgroundColor="#FFFFFF"
              color="#0F0F0F"
              ecl="M"
              size={qrSize}
              value={inviteLink}
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

function Actions({
  inviteLink,
  isOffline,
}: {
  inviteLink: string | null;
  isOffline: boolean;
}) {
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
    if (!inviteLink) return;
    try {
      await Clipboard.setStringAsync(inviteLink);
      setIsCopied(true);
    } catch (err) {
      console.error("[Clipboard] Failed to copy invite link:", err);
    }
  }

  async function handleShare() {
    if (!inviteLink) return;
    try {
      await Share.share({ message: inviteLink });
    } catch (err) {
      console.error("[Share] Failed to share invite link:", err);
    }
  }

  return (
    <View className="w-full flex-row gap-3">
      <Button
        className="flex-1"
        haptics="Light"
        isDisabled={!inviteLink}
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
        isDisabled={!inviteLink}
        onPress={() => void handleShare()}
      >
        <Feather color={accentForegroundColor} name="share-2" size={18} />
        <ButtonLabel className="font-semibold">Share</ButtonLabel>
      </Button>
    </View>
  );
}
