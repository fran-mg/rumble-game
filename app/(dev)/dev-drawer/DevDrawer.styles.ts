import { StyleSheet } from "react-native";

export default function DummyRoute() {
  return null;
}

export const styles = StyleSheet.create({
  // Sits at the bottom of the screen; height = arrowTab + drawerBody.
  // We translate it DOWN by drawerBodyHeight to hide body, UP to reveal.
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column",
    alignItems: "center", // centres the arrow tab horizontally
  },

  // ── Arrow tab (always rendered at the top of the flex column) ────────────
  arrowTab: {
    backgroundColor: "#1c0808",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    minWidth: 80,
    alignItems: "center",
  },
  arrowTabOpen: {
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 7,
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

  // ── Drawer body (sits flush below the arrow tab) ─────────────────────────
  drawerBody: {
    alignSelf: "stretch", // full width
  },
});
