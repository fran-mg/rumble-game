// app/game/play/_PlayingCard.tsx
import { LinearGradient } from "expo-linear-gradient";
import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CardFlashState } from "./index";

interface PlayingCardProps {
  currentCard: any;
  flashState: CardFlashState;
  mode: string;
  displayTime: number;
  timerDuration: number;
  onAction?: (action: "guessed" | "passed") => void;
  showButtons?: boolean;
}

// ─── Mode Themes ──────────────────────────────────────────────────────────────

const MODE_THEMES: Record<
  string,
  {
    gradientTop: string;
    gradientBottom: string;
    shadowColor: string;
    accentColor: string;
    labelColor: string;
    label: string;
    innerBorder: string;
  }
> = {
  headsup: {
    gradientTop: "#4f46e5",
    gradientBottom: "#1e1b4b",
    shadowColor: "#4f46e5",
    accentColor: "#a5b4fc",
    labelColor: "#c7d2fe",
    label: "HEADS UP",
    innerBorder: "rgba(165,180,252,0.2)",
  },
  taboo: {
    gradientTop: "#0e7490",
    gradientBottom: "#042f3e",
    shadowColor: "#0891b2",
    accentColor: "#67e8f9",
    labelColor: "#a5f3fc",
    label: "TABOO",
    innerBorder: "rgba(103,232,249,0.2)",
  },
  password: {
    gradientTop: "#9f1239",
    gradientBottom: "#4c0519",
    shadowColor: "#e11d48",
    accentColor: "#fda4af",
    labelColor: "#fecdd3",
    label: "PASSWORD",
    innerBorder: "rgba(253,164,175,0.2)",
  },
  articulate: {
    gradientTop: "#1d4ed8",
    gradientBottom: "#1e3a5f",
    shadowColor: "#2563eb",
    accentColor: "#93c5fd",
    labelColor: "#bfdbfe",
    label: "ARTICULATE",
    innerBorder: "rgba(147,197,253,0.2)",
  },
};

const PASS_THEME = {
  gradientTop: "#c2410c",
  gradientBottom: "#431407",
  shadowColor: "#f97316",
  accentColor: "#fdba74",
  labelColor: "#fed7aa",
  label: "PASS",
  innerBorder: "rgba(253,186,116,0.25)",
};

const CORRECT_THEME = {
  gradientTop: "#166534",
  gradientBottom: "#052e16",
  shadowColor: "#22c55e",
  accentColor: "#86efac",
  labelColor: "#bbf7d0",
  label: "CORRECT",
  innerBorder: "rgba(134,239,172,0.25)",
};

// ─── Timer Pill ───────────────────────────────────────────────────────────────

function TimerPill({
  displayTime,
  timerDuration,
  labelColor,
}: {
  displayTime: number;
  timerDuration: number;
  labelColor: string;
}) {
  const pct = displayTime / timerDuration;
  const isLow = pct <= 0.25;
  const isMid = pct <= 0.5;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLow) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
        ]),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => loopRef.current?.stop();
  }, [isLow]);

  const timerColor = isLow ? "#fca5a5" : isMid ? "#fcd34d" : labelColor;

  return (
    <Animated.View
      style={[
        styles.timerPill,
        {
          borderColor: isLow
            ? "rgba(252,165,165,0.45)"
            : "rgba(255,255,255,0.14)",
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <LucideIcons.Timer size={12} color={timerColor} strokeWidth={2.5} />
      <Text style={[styles.timerText, { color: timerColor }]}>
        {displayTime}
      </Text>
    </Animated.View>
  );
}

// ─── Password Forbidden Words ─────────────────────────────────────────────────

function ForbiddenWordsList({
  words,
  accentColor,
}: {
  words: string[];
  accentColor: string;
}) {
  return (
    <View style={styles.tabooContainer}>
      <View style={styles.tabooHeader}>
        <LucideIcons.Ban
          size={10}
          color="rgba(255,255,255,0.4)"
          strokeWidth={2.5}
        />
        <Text style={styles.tabooHeaderText}>DO NOT SAY</Text>
        <LucideIcons.Ban
          size={10}
          color="rgba(255,255,255,0.4)"
          strokeWidth={2.5}
        />
      </View>
      {words.slice(0, 5).map((w, i) => (
        <View key={i} style={styles.tabooWordRow}>
          <View
            style={[styles.tabooWordBullet, { backgroundColor: accentColor }]}
          />
          <Text style={styles.tabooWordText} numberOfLines={1}>
            {w.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Action Buttons (inside card) ────────────────────────────────────────────

function CardActionButtons({
  onAction,
  innerBorder,
}: {
  onAction: (action: "guessed" | "passed") => void;
  innerBorder: string;
}) {
  return (
    <View style={[styles.buttonRow, { borderTopColor: innerBorder }]}>
      <TouchableOpacity
        onPress={() => onAction("passed")}
        activeOpacity={0.7}
        style={[styles.actionBtn, styles.passBtn]}
      >
        <LucideIcons.ArrowRight size={18} color="#fed7aa" strokeWidth={2.5} />
        <Text style={styles.passBtnText}>pass</Text>
      </TouchableOpacity>

      <View style={[styles.btnDivider, { backgroundColor: innerBorder }]} />

      <TouchableOpacity
        onPress={() => onAction("guessed")}
        activeOpacity={0.7}
        style={[styles.actionBtn, styles.gotItBtn]}
      >
        <LucideIcons.Check size={18} color="#bbf7d0" strokeWidth={2.5} />
        <Text style={styles.gotItBtnText}>got it!</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlayingCard({
  currentCard,
  flashState,
  mode,
  displayTime,
  timerDuration,
  onAction,
  showButtons = false,
}: PlayingCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevFlashRef = useRef<CardFlashState>("default");
  const prevWordRef = useRef<string>("");

  // Scale on flash
  useEffect(() => {
    if (flashState !== prevFlashRef.current) {
      Animated.spring(scaleAnim, {
        toValue: flashState !== "default" ? 0.975 : 1,
        friction: flashState !== "default" ? 7 : 5,
        tension: flashState !== "default" ? 220 : 180,
        useNativeDriver: true,
      }).start();
      prevFlashRef.current = flashState;
    }
  }, [flashState]);

  // Word change slide-up
  useEffect(() => {
    if (currentCard?.word && currentCard.word !== prevWordRef.current) {
      slideAnim.setValue(22);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      prevWordRef.current = currentCard.word;
    }
  }, [currentCard?.word]);

  // Theme resolution
  let theme = MODE_THEMES[mode] ?? MODE_THEMES.articulate;
  if (flashState === "pass") theme = PASS_THEME as typeof theme;
  if (flashState === "done") theme = CORRECT_THEME as typeof theme;

  // Current mode's base theme — used for labels/icons regardless of flash state
  const baseTheme = MODE_THEMES[mode] ?? MODE_THEMES.articulate;

  // Forbidden words — password mode only
  let forbiddenWords: string[] = [];
  if (mode === "password" && currentCard?.taboo_words) {
    try {
      forbiddenWords = JSON.parse(currentCard.taboo_words);
    } catch {
      forbiddenWords = [];
    }
  }
  const showForbiddenWords =
    forbiddenWords.length > 0 && flashState === "default";

  // Mode icon
  const ModeIcon =
    mode === "headsup"
      ? LucideIcons.Smartphone
      : mode === "taboo"
        ? LucideIcons.Drama
        : mode === "password"
          ? LucideIcons.Key
          : LucideIcons.MessageSquare;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      {/* Depth shadow layer */}
      <View
        style={[styles.cardShadowBase, { backgroundColor: theme.shadowColor }]}
      />

      {/* Card body */}
      <LinearGradient
        colors={[theme.gradientTop, theme.gradientBottom] as any}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.cardBody}
      >
        {/* Top gloss shine */}
        <LinearGradient
          colors={["rgba(255,255,255,0.11)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardShine}
          pointerEvents="none"
        />

        {/* Card face — header corners live inside here now */}
        <View style={[styles.cardFace, { borderColor: theme.innerBorder }]}>
          {/* ── Top-left mode label ── */}
          {false && (
            <View
              style={[
                styles.cornerLabelLeft,
                { borderColor: "rgba(255,255,255,0.1)" },
              ]}
            >
              <ModeIcon
                size={11}
                color={baseTheme.labelColor}
                strokeWidth={2.5}
              />
              <Text style={[styles.modeLabel, { color: baseTheme.labelColor }]}>
                {baseTheme.label}
              </Text>
            </View>
          )}

          {/* ── Top-right timer ── */}
          <View style={styles.cornerTimerRight}>
            <TimerPill
              displayTime={displayTime}
              timerDuration={timerDuration}
              labelColor={baseTheme.labelColor}
            />
          </View>

          {/* ── Card content ── */}
          {flashState === "pass" ? (
            <View style={styles.flashStateContainer}>
              <LucideIcons.ArrowRight
                size={48}
                color="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
              />
              <Text style={styles.flashStateText}>PASS</Text>
              <Text style={styles.flashStateSubText}>Moving on...</Text>
            </View>
          ) : flashState === "done" ? (
            <View style={styles.flashStateContainer}>
              <LucideIcons.CheckCircle
                size={48}
                color="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
              />
              <Text style={styles.flashStateText}>CORRECT!</Text>
              <Text style={styles.flashStateSubText}>Nice one!</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.wordContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text
                adjustsFontSizeToFit
                numberOfLines={showForbiddenWords ? 2 : 3}
                minimumFontScale={0.25}
                style={[
                  styles.mainWord,
                  showForbiddenWords && styles.mainWordWithTaboo,
                ]}
              >
                {currentCard?.word ?? ""}
              </Text>

              {showForbiddenWords && (
                <View
                  style={[
                    styles.wordDivider,
                    { backgroundColor: theme.innerBorder },
                  ]}
                />
              )}

              {showForbiddenWords && (
                <ForbiddenWordsList
                  words={forbiddenWords}
                  accentColor={theme.accentColor}
                />
              )}
            </Animated.View>
          )}
        </View>

        {/* Buttons — part of the card, rendered below the face */}
        {showButtons && onAction && flashState === "default" && (
          <CardActionButtons
            onAction={onAction}
            innerBorder={theme.innerBorder}
          />
        )}
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
  },

  cardShadowBase: {
    position: "absolute",
    bottom: -8,
    left: 12,
    right: 12,
    height: "100%",
    borderRadius: 28,
    opacity: 0.3,
  },

  cardBody: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // ── Card face (fills remaining space above buttons) ───────────────────────
  cardFace: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    // Extra top padding so content clears the overlaid corner labels
    paddingTop: 52,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  // ── Corner overlays inside the card face ─────────────────────────────────
  cornerLabelLeft: {
    position: "absolute",
    top: 12,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },

  cornerTimerRight: {
    position: "absolute",
    top: 10,
    right: 12,
  },

  modeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  timerText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Flash states ─────────────────────────────────────────────────────────
  flashStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  flashStateText: {
    color: "#ffffff",
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },

  flashStateSubText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
  },

  // ── Word area ─────────────────────────────────────────────────────────────
  wordContainer: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },

  mainWord: {
    color: "#ffffff",
    fontSize: 70,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 78,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  mainWordWithTaboo: {
    fontSize: 50,
    lineHeight: 56,
  },

  wordDivider: {
    width: "55%",
    height: 1.5,
    borderRadius: 1,
  },

  // ── Forbidden words ───────────────────────────────────────────────────────
  tabooContainer: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },

  tabooHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  tabooHeaderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.5,
  },

  tabooWordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 8,
    width: "82%",
    justifyContent: "center",
  },

  tabooWordBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.65,
  },

  tabooWordText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    textDecorationLine: "line-through",
    textDecorationColor: "rgba(255,255,255,0.35)",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
    borderTopWidth: 1.5,
    borderRadius: 16,
    overflow: "hidden",
    height: 72,
  },

  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  passBtn: {
    borderBottomLeftRadius: 16,
  },

  gotItBtn: {
    borderBottomRightRadius: 16,
  },

  btnDivider: {
    width: 1.5,
    marginVertical: 12,
  },

  passBtnText: {
    color: "#fed7aa",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  gotItBtnText: {
    color: "#bbf7d0",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
