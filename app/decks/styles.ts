import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },

  // ── Page Header ──────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageEyebrow: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: "#f1f5f9",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 10,
  },

  // ── Shared card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // ── AI Forge ─────────────────────────────────────────────────────────────
  aiSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 14,
  },
  aiInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  aiInput: {
    flex: 1,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
  },
  aiForgeBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiForgeBtnDisabled: {
    opacity: 0.5,
  },

  // ── Category filter ───────────────────────────────────────────────────────
  categoryBar: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  categoryChipInactive: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },

  // ── Deck cards ────────────────────────────────────────────────────────────
  deckCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  },
  deckCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginBottom: 5,
  },
  deckMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  deckCategory: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  deckMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#64748b",
  },
  deckCardCount: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  deckActions: {
    flexDirection: "row",
    gap: 8,
  },
  deckActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  deckActionBtnDelete: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.25)",
  },
  deckColorStrip: {
    height: 2,
    opacity: 0.6,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: 14,
  },
  emptyStateText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
