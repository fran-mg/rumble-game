import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalsProps {
  showExitModal: boolean;
  setShowExitModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  editLimit: string;
  setEditLimit: (val: string) => void;
  editTimer: string;
  setEditTimer: (val: string) => void;
  currentRound: number;
  scoringStyle: string;
  handleSaveSettings: () => void;
}

export default function Modals({
  showExitModal,
  setShowExitModal,
  showSettingsModal,
  setShowSettingsModal,
  editLimit,
  setEditLimit,
  editTimer,
  setEditTimer,
  currentRound,
  scoringStyle,
  handleSaveSettings,
}: ModalsProps) {
  const router = useRouter();

  return (
    <>
      {/* EXIT MODAL */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-slate-900 p-6 rounded-3xl w-full border border-slate-800">
            <Text className="text-white text-2xl font-black mb-2 text-center">
              End Match Here?
            </Text>
            <Text className="text-slate-400 text-center mb-8">
              This skips remaining turns and goes straight to final results.
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowExitModal(false)}
                className="flex-1 bg-slate-800 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowExitModal(false);
                  router.replace("/game/match-summary" as any);
                }}
                className="flex-1 bg-red-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">End Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettingsModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          >
            <View className="bg-slate-900 p-6 rounded-t-3xl border-t border-slate-800 min-h-[50%]">
              <Text className="text-white text-2xl font-black mb-6">
                Mid-Game Adjustments
              </Text>

              <Text className="text-slate-400 font-bold mb-2">
                Target {scoringStyle === "rounds" ? "Rounds" : "Tiles"} (Min:{" "}
                {currentRound})
              </Text>
              <TextInput
                value={editLimit}
                onChangeText={setEditLimit}
                keyboardType="number-pad"
                className="bg-slate-950 text-white p-4 rounded-xl font-bold mb-6 border border-slate-800"
              />

              <Text className="text-slate-400 font-bold mb-2">
                Timer Length (10s - 180s)
              </Text>
              <TextInput
                value={editTimer}
                onChangeText={setEditTimer}
                keyboardType="number-pad"
                className="bg-slate-950 text-white p-4 rounded-xl font-bold mb-8 border border-slate-800"
              />

              <View className="flex-row gap-4 mt-auto mb-4">
                <TouchableOpacity
                  onPress={() => setShowSettingsModal(false)}
                  className="flex-1 bg-slate-800 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSettings}
                  className="flex-1 bg-blue-600 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
