import React from "react";
import { Text, View } from "react-native";
import { CardFlashState } from "./index";

interface PlayingCardProps {
  currentCard: any;
  flashState: CardFlashState;
  mode: string;
  displayTime: number;
}

export default function PlayingCard({
  currentCard,
  flashState,
  mode,
  displayTime,
}: PlayingCardProps) {
  const getCardColors = () => {
    if (flashState === "pass")
      return { bg: "bg-orange-500", border: "border-orange-700" };
    if (flashState === "done")
      return { bg: "bg-green-500", border: "border-green-700" };
    return { bg: "bg-slate-600", border: "border-slate-800" };
  };
  const colors = getCardColors();

  return (
    <View
      className={`flex-1 rounded-[40px] ${colors.bg} ${colors.border} border-4 shadow-2xl justify-center`}
    >
      <View
        className={`flex-1 rounded-2xl border-4 ${colors.border} border-dashed items-center justify-center p-6 relative`}
      >
        <View className="absolute top-4 right-6 bg-black/20 px-4 py-1 rounded-full">
          <Text className="text-white/90 font-black text-2xl">
            {displayTime}
          </Text>
        </View>

        {flashState === "pass" ? (
          <Text className="text-white text-7xl font-black tracking-widest uppercase">
            PASS
          </Text>
        ) : flashState === "done" ? (
          <Text className="text-white text-7xl font-black tracking-widest uppercase">
            CORRECT!
          </Text>
        ) : (
          <>
            <Text
              adjustsFontSizeToFit
              numberOfLines={3}
              minimumFontScale={0.3}
              className={`font-black text-center text-white ${mode === "password" ? "text-6xl mb-6 border-b-4 border-white/20 pb-4" : "text-[100px]"}`}
            >
              {currentCard?.word}
            </Text>

            {mode === "password" && currentCard?.taboo_words && (
              <View className="items-center w-full">
                {JSON.parse(currentCard.taboo_words).map(
                  (w: string, i: number) => (
                    <Text
                      key={i}
                      className="text-red-400 font-bold text-4xl mb-3"
                    >
                      {w}
                    </Text>
                  ),
                )}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
