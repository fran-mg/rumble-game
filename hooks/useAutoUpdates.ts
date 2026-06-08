import { useEffect } from "react";
import * as Updates from "expo-updates";
import { Alert } from "react-native";

export function useAutoUpdates() {
  const { isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      Alert.alert(
        "Update Available",
        "A new version of Rumble has been downloaded. The app will now restart to apply it.",
        [
          {
            text: "Restart App",
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ],
        { cancelable: false },
      );
    }
  }, [isUpdatePending]);
}
