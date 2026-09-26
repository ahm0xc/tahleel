import type { ComponentProps } from "react";

import { Pressable } from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { router, usePathname } from "expo-router";
import { useCSSVariable } from "uniwind";

import { Text, View } from "~/components/ui";
import { triggerHaptic } from "~/lib/haptics";
import { cn } from "~/lib/utils";

type IconName = ComponentProps<typeof Feather>["name"];

interface NavItemProps {
  href: string;
  label: string;
  iconName: IconName;
  color: string;
  isActive: boolean;
}

const NAV_ITEMS: Omit<NavItemProps, "color" | "isActive">[] = [
  { href: "/", label: "Home", iconName: "home" },
  { href: "/reading", label: "Reading", iconName: "book-open" },
  { href: "/explore", label: "Explore", iconName: "compass" },
  { href: "/friends", label: "Friends", iconName: "users" },
  { href: "/settings", label: "Settings", iconName: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const color = String(useCSSVariable("--foreground") ?? "#6B6B66");

  return (
    <View className="border-border bg-background pb-safe-offset-2 flex-row items-center border-t pt-1.5">
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          color={color}
          isActive={pathname === item.href}
        />
      ))}
    </View>
  );
}

function NavItem({ color, href, iconName, isActive, label }: NavItemProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      className={cn(
        "flex-1 items-center gap-1 py-1 active:opacity-60",
        isActive ? "opacity-100" : "opacity-40"
      )}
      onPress={() => {
        triggerHaptic();
        router.replace(href);
      }}
    >
      <Feather color={color} name={iconName} size={22} />
      <Text className="text-[10px] font-medium">{label}</Text>
    </Pressable>
  );
}
