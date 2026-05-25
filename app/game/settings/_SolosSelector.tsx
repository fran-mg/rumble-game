/* 
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ListItem } from "./index";

interface SolosSelectorProps {
  rosterData: ListItem[];
  setRosterData: (data: ListItem[]) => void;
  editingId: number | null;
  editName: string;
  setEditName: (name: string) => void;
  setEditingId: (id: number | null) => void;
  handleSaveEdit: () => void;
  handleDeleteEntity: (id: number, type: "player" | "team") => void;
  handleAddPlayer: (teamId?: number) => void;
}

export default function SolosSelector({
  rosterData,
  setRosterData,
  editingId,
  editName,
  setEditName,
  setEditingId,
  handleSaveEdit,
  handleDeleteEntity,
  handleAddPlayer,
}: SolosSelectorProps) {
  const players = rosterData.filter((i) => i.type === "player");

  const movePlayerUp = (index: number) => {
    if (index === 0) return;
    const newPlayers = [...players];
    [newPlayers[index - 1], newPlayers[index]] = [
      newPlayers[index],
      newPlayers[index - 1],
    ];
    const teams = rosterData.filter((i) => i.type === "team");
    setRosterData([...teams, ...newPlayers]);
  };

  const movePlayerDown = (index: number) => {
    if (index === players.length - 1) return;
    const newPlayers = [...players];
    [newPlayers[index], newPlayers[index + 1]] = [
      newPlayers[index + 1],
      newPlayers[index],
    ];
    const teams = rosterData.filter((i) => i.type === "team");
    setRosterData([...teams, ...newPlayers]);
  };

  return (
    <>
      <View className="bg-slate-900 border border-slate-800 rounded-t-3xl p-5 pb-2">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Solo Players
        </Text>
      </View>

      <View className="bg-slate-900 border border-slate-800 border-t-0 mb-4 p-5 pt-0">
        {players.length > 0 ? (
          players.map((item, index) => (
            <View
              key={item.id}
              className="flex-row items-center bg-slate-950/80 p-3 border-2 rounded-xl mb-2 border-slate-800"
            >
              {/* Up/Down arrows instead of drag handle */ /*}
              <View className="flex-col mr-2">
                <TouchableOpacity
                  onPress={() => movePlayerUp(index)}
                  disabled={index === 0}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  className="py-1"
                >
                  <LucideIcons.ChevronUp
                    color={index === 0 ? "#334155" : "#64748B"}
                    size={16}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => movePlayerDown(index)}
                  disabled={index === players.length - 1}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  className="py-1"
                >
                  <LucideIcons.ChevronDown
                    color={index === players.length - 1 ? "#334155" : "#64748B"}
                    size={16}
                  />
                </TouchableOpacity>
              </View>

              {editingId === item.id ? (
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  maxLength={30}
                  className="flex-1 text-white font-medium mx-2"
                  placeholderTextColor="#64748B"
                  placeholder="Player name..."
                />
              ) : (
                <Text className="flex-1 text-slate-300 font-medium mx-2">
                  {item.name || "Unnamed Player"}
                </Text>
              )}

              <View className="flex-row gap-3">
                {editingId === item.id ? (
                  <>
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <LucideIcons.Check color="#10B981" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(null);
                        if (!item.name) handleDeleteEntity(item.id, "player");
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <LucideIcons.X color="#EF4444" size={18} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <LucideIcons.Edit3 color="#64748B" size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntity(item.id, "player")}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <LucideIcons.Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text className="text-slate-500 text-center italic py-4">
            No solo players yet. Add one below!
          </Text>
        )}
      </View>

      <View className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-3xl p-5 pt-0 mb-4">
        <TouchableOpacity
          onPress={() => handleAddPlayer()}
          className="border border-dashed border-slate-700 rounded-xl py-3 items-center"
        >
          <Text className="text-slate-400 font-bold">+ Add Solo Player</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
*/
