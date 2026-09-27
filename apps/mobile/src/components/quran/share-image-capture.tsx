import React from "react";

import { type View as RNView } from "react-native";

import { useToast } from "heroui-native";
import { useCSSVariable } from "uniwind";

import { View } from "~/components/ui";
import { captureShareImage, shareImage } from "~/lib/quran/share-image";

const CARD_MAX_WIDTH = 360;
const CARD_GUTTER = 48;

type ShareImageCardRenderer = (cardWidth: number) => React.ReactNode;

interface ShareImageCaptureProps {
  children: ShareImageCardRenderer;
  request: number;
  shareTitle: string;
  width: number;
}

/**
 * Rasterizes a card built by `children` and hands the image straight to the
 * system share sheet. The card is only mounted for the few frames the capture
 * takes.
 *
 * Bumping `request` is the signal to start a capture: it re-arms the host, which
 * remounts the card and replays its layout so the capture always sees a measured
 * view. Taps that land while a capture is already in flight are dropped: the
 * card is mounted by then, so it would not lay out again and the request would
 * stall. `children` is expected to be memoized on whatever it renders, so a
 * capture in flight is retaken -- rather than finished against stale content --
 * if the card's own inputs change underneath it.
 */
export function ShareImageCapture({
  children,
  request,
  shareTitle,
  width,
}: ShareImageCaptureProps) {
  const { toast } = useToast();
  const backgroundColor = useCSSVariable("--background") as string;
  // `toast` is rebuilt whenever a toast is shown or dismissed, so it cannot be
  // an effect dependency here without risking a second capture.
  const toastRef = React.useRef(toast);

  toastRef.current = toast;

  const cardRef = React.useRef<RNView>(null);
  const isCapturingRef = React.useRef(false);
  const [isArmed, setIsArmed] = React.useState(false);
  const [isLaidOut, setIsLaidOut] = React.useState(false);

  const cardWidth = Math.min(width - CARD_GUTTER, CARD_MAX_WIDTH);

  React.useEffect(() => {
    if (request === 0 || isCapturingRef.current) {
      return;
    }

    isCapturingRef.current = true;
    setIsLaidOut(false);
    setIsArmed(true);
  }, [request]);

  React.useEffect(() => {
    if (!isArmed || !isLaidOut) {
      return;
    }

    let isCancelled = false;

    // The card has to be laid out and committed to the native tree before it
    // can be rasterized; capturing in the same frame yields a blank image.
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        const captured = await captureShareImage(cardRef);

        if (isCancelled) {
          return;
        }

        isCapturingRef.current = false;
        setIsArmed(false);

        if (captured === null) {
          toastRef.current.show({
            label: "Couldn't create the image",
            variant: "danger",
          });
          return;
        }

        const result = await shareImage(shareTitle, captured);

        // A completed share needs no confirmation: the system sheet is the receipt.
        if (result === "shared" || isCancelled) {
          return;
        }

        toastRef.current.show({
          label:
            result === "unavailable"
              ? "Sharing isn't available on this device"
              : "Couldn't share this image",
          variant: "danger",
        });
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [children, isArmed, isLaidOut, shareTitle]);

  if (!isArmed) {
    return null;
  }

  return (
    // Mounted at full opacity and hidden behind a backdrop that matches the page
    // background: iOS rasterizes by walking the view hierarchy, so an
    // `opacity: 0` or off-screen host captures blank. The backdrop takes its
    // color inline rather than from a className, which uniwind only applies a
    // tick after mount -- long enough for the card to flash on screen.
    <View className="absolute top-0 left-0" pointerEvents="none">
      <View
        collapsable={false}
        ref={cardRef}
        onLayout={() => {
          setIsLaidOut(true);
        }}
      >
        {children(cardWidth)}
      </View>

      <View
        style={{
          backgroundColor,
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
    </View>
  );
}
