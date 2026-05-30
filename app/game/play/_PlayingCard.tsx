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
import { getModeTheme, resolveCardTheme } from "../../../utils/_modeTheme";
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

// ─── Forbidden Words ──────────────────────────────────────────────────────────

function ForbiddenWordsList({
  words,
  accentColor,
}: {
  words: string[];
  accentColor: string;
}) {
  return (
    <View style={styles.forbiddenContainer}>
      <View style={styles.forbiddenHeader}>
        <LucideIcons.Ban
          size={10}
          color="rgba(255,255,255,0.4)"
          strokeWidth={2.5}
        />
        <Text style={styles.forbiddenHeaderText}>DO NOT SAY</Text>
        <LucideIcons.Ban
          size={10}
          color="rgba(255,255,255,0.4)"
          strokeWidth={2.5}
        />
      </View>
      {words.slice(0, 5).map((w, i) => (
        <View key={i} style={styles.forbiddenWordRow}>
          <View
            style={[
              styles.forbiddenWordBullet,
              { backgroundColor: accentColor },
            ]}
          />
          <Text style={styles.forbiddenWordText} numberOfLines={1}>
            {w.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

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

  // Scale press on flash state
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

  // Word change slide-up animation
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

  // ── Theme resolution via shared util ────────────────────────────────────────
  const cardTheme = resolveCardTheme(mode, flashState);
  const { card: baseCardTheme, meta } = getModeTheme(mode);

  // Forbidden words — only rendered when meta.showsForbiddenWords is true
  let forbiddenWords: string[] = [];
  if (meta.showsForbiddenWords && currentCard?.taboo_words) {
    try {
      forbiddenWords = JSON.parse(currentCard.taboo_words);
    } catch {
      forbiddenWords = [];
    }
  }
  const showForbiddenWords =
    forbiddenWords.length > 0 && flashState === "default";

  const ModeIcon = meta.Icon;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          shadowColor: cardTheme.shadowColor,
        },
      ]}
    >
      {/* Depth shadow layer */}
      <View
        style={[
          styles.cardShadowBase,
          { backgroundColor: cardTheme.shadowColor },
        ]}
      />

      {/* Card body */}
      <LinearGradient
        colors={[cardTheme.gradientTop, cardTheme.gradientBottom] as any}
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

        {/* Card face */}
        <View style={[styles.cardFace, { borderColor: cardTheme.innerBorder }]}>
          {/* Top-left mode label — always uses base mode theme, not flash */}
          {false && (
            <View
              style={[
                styles.cornerLabelLeft,
                { borderColor: "rgba(255,255,255,0.1)" },
              ]}
            >
              <ModeIcon
                size={11}
                color={baseCardTheme.labelColor}
                strokeWidth={2.5}
              />
              <Text
                style={[styles.modeLabel, { color: baseCardTheme.labelColor }]}
              >
                {baseCardTheme.label}
              </Text>
            </View>
          )}

          {/* Top-right timer */}
          <View style={styles.cornerTimerRight}>
            <TimerPill
              displayTime={displayTime}
              timerDuration={timerDuration}
              labelColor={baseCardTheme.labelColor}
            />
          </View>

          {/* Card content */}
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
                  showForbiddenWords && styles.mainWordWithForbidden,
                ]}
              >
                {currentCard?.word ?? ""}
              </Text>

              {showForbiddenWords && (
                <View
                  style={[
                    styles.wordDivider,
                    { backgroundColor: cardTheme.innerBorder },
                  ]}
                />
              )}

              {showForbiddenWords && (
                <ForbiddenWordsList
                  words={forbiddenWords}
                  accentColor={cardTheme.accentColor}
                />
              )}
            </Animated.View>
          )}
        </View>

        {/* Buttons */}
        {showButtons && onAction && flashState === "default" && (
          <CardActionButtons
            onAction={onAction}
            innerBorder={cardTheme.innerBorder}
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
  cardFace: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 52,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
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
  mainWordWithForbidden: {
    fontSize: 50,
    lineHeight: 56,
  },
  wordDivider: {
    width: "55%",
    height: 1.5,
    borderRadius: 1,
  },
  forbiddenContainer: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  forbiddenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  forbiddenHeaderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  forbiddenWordRow: {
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
  forbiddenWordBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.65,
  },
  forbiddenWordText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    textDecorationLine: "line-through",
    textDecorationColor: "rgba(255,255,255,0.35)",
  },
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
