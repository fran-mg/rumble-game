import * as LucideIcons from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTeamStore } from "../../stores/useTeamStore";

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];
const GLYPH_ICONS = ["Users", "Target", "Trophy", "Shield", "Crown", "Flame"];

export default function TeamsScreen() {
  const { teams, loadTeams, createTeam, deleteTeam } = useTeamStore();
  const [teamName, setTeamName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("#3B82F6");
  const [selectedIcon, setSelectedIcon] = useState<string>("Users");

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    await createTeam(teamName, selectedColor, selectedIcon);
    setTeamName("");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 p-4">
      {/* Header Container */}
      <View className="mb-6">
        <Text className="text-2xl font-black text-white tracking-tight">
          Team Setup
        </Text>
        <Text className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">
          Roster & Colors
        </Text>
      </View>

      {/* Assembly Control Panel */}
      <View className="bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-6">
        <TextInput
          placeholder="Enter Team Name"
          placeholderTextColor="#64748B"
          value={teamName}
          onChangeText={setTeamName}
          className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold mb-4"
        />

        {/* Color Palette Picker */}
        <Text className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2">
          Assign Team Color
        </Text>
        <View className="flex-row justify-between mb-4">
          {PRESET_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-10 h-10 rounded-full items-center justify-center border-2 ${selectedColor === color ? "border-white scale-110 shadow-lg" : "border-transparent"}`}
            >
              {selectedColor === color && (
                <LucideIcons.Check color="white" size={16} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Lucide Glyphs Selector */}
        <Text className="text-slate-400 text-xs font-black uppercase tracking-wider mb-2">
          Select Team Crest
        </Text>
        <View className="flex-row justify-between mb-5">
          {GLYPH_ICONS.map((iconName) => {
            // Dynamically resolve safe component tokens
            const IconComponent =
              (LucideIcons as any)[iconName] || LucideIcons.Users;
            const isSelected = selectedIcon === iconName;
            return (
              <TouchableOpacity
                key={iconName}
                onPress={() => setSelectedIcon(iconName)}
                className={`p-2.5 rounded-xl border ${isSelected ? "bg-blue-600 border-blue-500 scale-105" : "bg-slate-950 border-slate-800"}`}
              >
                <IconComponent
                  color={isSelected ? "white" : "#64748B"}
                  size={20}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreateTeam}
          className="bg-blue-600 rounded-xl py-3.5 items-center justify-center flex-row gap-2"
        >
          <LucideIcons.UserPlus color="white" size={18} />
          <Text className="text-white font-black text-sm uppercase tracking-wider">
            Register Team
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Team Roster List */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <Text className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3 px-1">
          Registered Competitors
        </Text>
        {teams.length === 0 ? (
          <Text className="text-slate-600 italic text-sm mt-2 px-1">
            No registered teams. Assemble your squad above.
          </Text>
        ) : (
          teams.map((team) => {
            const IconComponent =
              (LucideIcons as any)[team.icon] || LucideIcons.Users;
            return (
              <View
                key={team.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-4">
                  <View
                    style={{ backgroundColor: team.color }}
                    className="p-2.5 rounded-xl"
                  >
                    <IconComponent color="white" size={20} />
                  </View>
                  <Text className="text-white font-black text-base">
                    {team.name}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteTeam(team.id)}
                  hitSlop={12}
                  className="p-2 bg-slate-950 rounded-xl border border-slate-800"
                >
                  <LucideIcons.Trash2 color="#EF4444" size={16} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
