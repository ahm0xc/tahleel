import type { ReactNode } from "react";
import { useState } from "react";

import { ActivityIndicator, Platform, ScrollView } from "react-native";

import { useAuth } from "@clerk/expo";
import { Host, Button as NativeButton } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { Icon } from "~/components/icon";
import { Button, ButtonLabel, Image, Text, View } from "~/components/ui";
import { useInviteStore } from "~/store/invite-store";
import { api } from "~/trpc/client";

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { setPendingCode } = useInviteStore();

  const [connected, setConnected] = useState(false);

  const preview = api.friends.getInvitePreview.useQuery(
    { code: code ?? "" },
    { enabled: Boolean(code) && !isSignedIn }
  );

  const info = api.friends.getInviteInfo.useQuery(
    { code: code ?? "" },
    { enabled: Boolean(code) && isSignedIn === true }
  );

  const connect = api.friends.connect.useMutation();
  const utils = api.useUtils();

  function handleConnect() {
    connect.mutate(
      { code: code ?? "" },
      {
        onSuccess: () => {
          setConnected(true);
          utils.friends.list.invalidate();
        },
      }
    );
  }

  function handleSignIn() {
    if (code) setPendingCode(code);
    router.replace("/auth");
  }

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  let content: ReactNode;

  if (!code) {
    content = (
      <MessageState
        title="Invalid invite link"
        message="This invite link doesn't look right."
      />
    );
  } else if (isSignedIn) {
    if (info.isLoading) {
      content = <LoadingState />;
    } else if (!info.data) {
      content = (
        <MessageState
          title="Invite not found"
          message="This invite link no longer works."
        />
      );
    } else if (info.data.isSelf) {
      content = (
        <MessageState
          title="This is your own invite"
          message="Share this link with friends to build your hasanat circle."
        />
      );
    } else if (connected || info.data.isConnected) {
      content = (
        <ConnectedState
          name={info.data.displayName}
          imageUrl={info.data.imageUrl}
          onGoToFriends={() => router.replace("/friends")}
        />
      );
    } else {
      content = (
        <ConnectState
          name={info.data.displayName}
          imageUrl={info.data.imageUrl}
          connecting={connect.isPending}
          error={
            connect.isError ? "Something went wrong. Please try again." : null
          }
          onConnect={handleConnect}
        />
      );
    }
  } else if (preview.isLoading) {
    content = <LoadingState />;
  } else if (!preview.data) {
    content = (
      <MessageState
        title="Invite not found"
        message="This invite link no longer works."
      />
    );
  } else {
    content = (
      <SignInState name={preview.data.displayName} onSignIn={handleSignIn} />
    );
  }

  return (
    <View className="bg-background flex-1">
      <Header onClose={handleClose} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow items-center justify-center px-safe-offset-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    </View>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View className="pt-safe-offset-0 px-safe-offset-4 flex-row">
      <View className="h-14 flex-1 flex-row items-center justify-start">
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
              onPress={onClose}
            />
          </Host>
        ) : (
          <Button isIconOnly variant="ghost" onPress={onClose}>
            <Icon name="arrow-left" size={24} />
          </Button>
        )}
      </View>
      <View className="flex-1 flex-row items-center justify-center">
        <Text className="text-lg font-semibold">Invite</Text>
      </View>
      <View className="flex-1 flex-row items-center justify-end"></View>
    </View>
  );
}

function Avatar({
  name,
  imageUrl,
  size,
}: {
  name: string;
  imageUrl?: string | null;
  size: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View
      className="bg-accent items-center justify-center overflow-hidden rounded-full"
      style={{ height: size, width: size }}
    >
      {imageUrl ? (
        <Image
          source={imageUrl}
          contentFit="cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <Text
          className="text-accent-foreground font-semibold"
          style={{ fontSize: size / 2.6 }}
        >
          {initials || "?"}
        </Text>
      )}
    </View>
  );
}

function LoadingState() {
  const accentColor = String(useCSSVariable("--accent") ?? "#6d5ae6");

  return (
    <View className="w-full items-center py-16">
      <ActivityIndicator color={accentColor} size="large" />
    </View>
  );
}

function MessageState({ title, message }: { title: string; message: string }) {
  return (
    <View className="w-full items-center gap-4 px-4">
      <Text className="text-center text-2xl font-bold tracking-tight">
        {title}
      </Text>
      <Text className="text-muted text-center text-sm leading-5">
        {message}
      </Text>
    </View>
  );
}

function SignInState({
  name,
  onSignIn,
}: {
  name: string;
  onSignIn: () => void;
}) {
  return (
    <View className="w-full items-center gap-6">
      <Avatar name={name} size={88} />
      <View className="items-center gap-1.5 px-4">
        <Text className="text-center text-2xl font-bold tracking-tight">
          {name}
        </Text>
        <Text className="text-muted px-2 text-center text-sm leading-5">
          {name} invited you to build your hasanat circle together. Sign in to
          connect.
        </Text>
      </View>
      <View className="w-full max-w-[280px]">
        <Button haptics="Light" onPress={onSignIn}>
          <ButtonLabel className="font-semibold">
            Sign in to connect
          </ButtonLabel>
        </Button>
      </View>
    </View>
  );
}

function ConnectState({
  name,
  imageUrl,
  connecting,
  error,
  onConnect,
}: {
  name: string;
  imageUrl?: string | null;
  connecting: boolean;
  error: string | null;
  onConnect: () => void;
}) {
  return (
    <View className="w-full items-center gap-6">
      <Avatar name={name} imageUrl={imageUrl} size={88} />
      <View className="items-center gap-1.5 px-4">
        <Text className="text-center text-2xl font-bold tracking-tight">
          {name}
        </Text>
        <Text className="text-muted px-2 text-center text-sm leading-5">
          Connect with {name} to read together and compare hasanaat every day.
        </Text>
      </View>
      <View className="w-full max-w-[280px] items-center gap-3">
        <Button isDisabled={connecting} haptics="Light" onPress={onConnect}>
          <ButtonLabel className="font-semibold">
            {connecting ? "Connecting…" : "Connect"}
          </ButtonLabel>
        </Button>
        {error ? <Text className="text-danger text-xs">{error}</Text> : null}
      </View>
    </View>
  );
}

function ConnectedState({
  name,
  imageUrl,
  onGoToFriends,
}: {
  name: string;
  imageUrl?: string | null;
  onGoToFriends: () => void;
}) {
  return (
    <View className="w-full items-center gap-6">
      <Avatar name={name} imageUrl={imageUrl} size={88} />
      <View className="items-center gap-1.5 px-4">
        <Text className="text-center text-2xl font-bold tracking-tight">
          You&apos;re connected
        </Text>
        <Text className="text-muted px-2 text-center text-sm leading-5">
          You and {name} are now friends. Start reading together and compare
          your hasanaat.
        </Text>
      </View>
      <View className="w-full max-w-[280px]">
        <Button haptics="Light" onPress={onGoToFriends}>
          <ButtonLabel className="font-semibold">Go to Friends</ButtonLabel>
        </Button>
      </View>
    </View>
  );
}
