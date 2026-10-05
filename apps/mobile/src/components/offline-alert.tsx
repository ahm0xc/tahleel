import { Alert } from "heroui-native";

type OfflineAlertProps = {
  description?: string;
};

export function OfflineAlert({ description }: OfflineAlertProps) {
  return (
    <Alert status="warning">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>You're offline</Alert.Title>
        <Alert.Description>
          {description ?? "Check your internet connection and try again."}
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
