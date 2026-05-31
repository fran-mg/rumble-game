import { StyleSheet } from "react-native";

export default function DummyRoute() {
  return null;
}

export const TAB_HEIGHT = 80;

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
  },
  arrowTab: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    zIndex: 10,
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  arrowTabInner: {
    backgroundColor: "#1c0808",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
    minWidth: 80,
  },
  arrowTabInnerOpen: {
    paddingTop: 7,
    paddingBottom: 6,
    paddingHorizontal: 16,
  },
  arrowTabLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  arrowTabText: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  drawerBody: {
    marginTop: TAB_HEIGHT,
  },
});
