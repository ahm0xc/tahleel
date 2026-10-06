import { useNetworkState } from "expo-network";

export function useOffline() {
  const { isConnected, isInternetReachable } = useNetworkState();

  return isConnected === false || isInternetReachable === false;
}
