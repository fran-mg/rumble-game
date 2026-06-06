import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as LucideIcons from "lucide-react-native";

export default function DummyRoute() {
  return null;
}

// Light, towards-white yellow color theme
const ALERT_THEME = {
  backgroundColor: "#171510", // Very dark warm gray/slate backdrop
  borderColor: "rgba(253, 224, 71, 0.25)", // Faint light yellow border
  textColor: "#fefce8", // Almost white yellow
  messageColor: "#fef08a", // Soft pale yellow
  buttonBgColor: "#fde047", // Bright light yellow
  buttonTextColor: "#422006", // Dark brown/black for readable contrast on the button
  iconColor: "#fde047", // Bright light yellow for the icon
};

export interface AppAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function AppAlert({ visible, title, message, onClose }: AppAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.alertCard,
                { backgroundColor: ALERT_THEME.backgroundColor },
              ]}
            >
              {/* Title & Icon Row */}
              <View style={styles.titleRow}>
                <LucideIcons.Info
                  size={20}
                  color={ALERT_THEME.iconColor}
                  strokeWidth={3}
                />
                <Text style={[styles.title, { color: ALERT_THEME.textColor }]}>
                  {title}
                </Text>
              </View>

              <Text
                style={[styles.message, { color: ALERT_THEME.messageColor }]}
              >
                {message}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[
                  styles.button,
                  { backgroundColor: ALERT_THEME.buttonBgColor },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: ALERT_THEME.buttonTextColor },
                  ]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function useAppAlert() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const showAlert = (t: string, m: string) => {
    setTitle(t);
    setMessage(m);
    setVisible(true);
  };

  const hideAlert = () => setVisible(false);

  const AlertRender = (
    <AppAlert
      visible={visible}
      title={title}
      message={message}
      onClose={hideAlert}
    />
  );

  return { showAlert, hideAlert, AlertRender };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  alertCard: {
    width: "100%",
    maxWidth: 300,
    borderWidth: 1,
    borderColor: ALERT_THEME.borderColor,
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 22,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 40, // Keeps the button wide enough to be tappable, but not 100% width
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
