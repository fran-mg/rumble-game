/*
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ListItem } from "./index";

interface TeamSelectorProps {
  rosterData: ListItem[];
  setRosterData: (data: ListItem[]) => void;
  editingId: number | null;
  editName: string;
  setEditName: (name: string) => void;
  setEditingId: (id: number | null) => void;
  handleSaveEdit: () => void;
  handleDeleteEntity: (id: number, type: "player" | "team") => void;
  handleAddTeam: () => void;
  handleAddPlayer: (teamId?: number) => void;
}

export default function TeamSelector({
  rosterData,
  setRosterData,
  editingId,
  editName,
  setEditName,
  setEditingId,
  handleSaveEdit,
  handleDeleteEntity,
  handleAddTeam,
  handleAddPlayer,
}: TeamSelectorProps) {
  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newData = [...rosterData];
    const item = newData[index];

    // If it's a team, move it with its players
    if (item.type === "team") {
      const teamPlayers = rosterData.filter(
        (i) => i.type === "player" && i.teamId === item.id,
      );
      const itemsToMove = [item, ...teamPlayers];

      // Remove items
      const filtered = newData.filter(
        (i) =>
          !(i.id === item.id || (i.type === "player" && i.teamId === item.id)),
      );

      // Find insertion point (before previous team)
      const prevTeamIndex = filtered.findLastIndex(
        (i, idx) => idx < index && i.type === "team",
      );
      const insertAt = prevTeamIndex >= 0 ? prevTeamIndex : 0;

      filtered.splice(insertAt, 0, ...itemsToMove);
      setRosterData(filtered);
    } else {
      // Just swap players
      [newData[index - 1], newData[index]] = [
        newData[index],
        newData[index - 1],
      ];
      setRosterData(newData);
    }
  };

  const moveItemDown = (index: number) => {
    if (index === rosterData.length - 1) return;
    const newData = [...rosterData];
    const item = newData[index];

    if (item.type === "team") {
      const teamPlayers = rosterData.filter(
        (i) => i.type === "player" && i.teamId === item.id,
      );
      const itemsToMove = [item, ...teamPlayers];

      const filtered = newData.filter(
        (i) =>
          !(i.id === item.id || (i.type === "player" && i.teamId === item.id)),
      );

      const nextTeamIndex = filtered.findIndex(
        (i, idx) => idx > index && i.type === "team",
      );

      if (nextTeamIndex >= 0) {
        const nextTeamPlayers = filtered.filter(
          (i) => i.type === "player" && i.teamId === filtered[nextTeamIndex].id,
        );
        const insertAt = nextTeamIndex + nextTeamPlayers.length + 1;
        filtered.splice(insertAt, 0, ...itemsToMove);
        setRosterData(filtered);
      }
    } else {
      [newData[index], newData[index + 1]] = [
        newData[index + 1],
        newData[index],
      ];
      setRosterData(newData);
    }
  };

  return (
    <>
      <View className="bg-slate-900 border border-slate-800 rounded-t-3xl p-5 pb-2">
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          Teams & Players
        </Text>
      </View>

      <View className="bg-slate-900 border border-slate-800 border-t-0 mb-4 p-5 pt-0">
        {rosterData.map((item, index) => {
          if (item.type === "team") {
            return (
              <View key={item.id}>
                <View
                  style={{ borderColor: item.color }}
                  className="border-x-2 border-t-2 rounded-t-2xl p-3 shadow-lg mt-3"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-col mr-2">
                      <TouchableOpacity
                        onPress={() => moveItemUp(index)}
                        disabled={index === 0}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        className="py-1"
                      >
                        <LucideIcons.ChevronUp
                          color={index === 0 ? "#334155" : "#64748B"}
                          size={18}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveItemDown(index)}
                        disabled={
                          index === rosterData.length - 1 ||
                          rosterData.filter((i) => i.type === "team").length ===
                            1
                        }
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        className="py-1"
                      >
                        <LucideIcons.ChevronDown
                          color={
                            index === rosterData.length - 1
                              ? "#334155"
                              : "#64748B"
                          }
                          size={18}
                        />
                      </TouchableOpacity>
                    </View>

                    {editingId === item.id ? (
                      <TextInput
                        value={editName}
                        onChangeText={setEditName}
                        autoFocus
                        maxLength={30}
                        className="flex-1 text-white font-black text-lg mx-2"
                        placeholderTextColor="#64748B"
                        placeholder="Team name..."
                      />
                    ) : (
                      <Text className="flex-1 text-white font-black text-lg mx-2">
                        {item.name || "Unnamed Team"}
                      </Text>
                    )}

                    <View className="flex-row gap-3">
                      {editingId === item.id ? (
                        <>
                          <TouchableOpacity
                            onPress={handleSaveEdit}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <LucideIcons.Check color="#10B981" size={20} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(null);
                              if (!item.name)
                                handleDeleteEntity(item.id, "team");
                            }}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <LucideIcons.X color="#EF4444" size={20} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(item.id);
                              setEditName(item.name);
                            }}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <LucideIcons.Edit3 color="#64748B" size={18} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteEntity(item.id, "team")}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <LucideIcons.Trash2 color="#EF4444" size={18} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          }

          // PLAYER
          const team = rosterData.find(
            (i) => i.type === "team" && i.id === item.teamId,
          ) as any;
          const teamColor = team ? team.color : "#1E293B";

          return (
            <View
              key={item.id}
              style={{ borderColor: teamColor }}
              className="flex-row items-center bg-slate-950/80 p-3 border-x-2 border-b-2"
            >
              <View className="flex-col mr-2">
                <TouchableOpacity
                  onPress={() => moveItemUp(index)}
                  disabled={
                    rosterData[index - 1]?.type === "team" || index === 0
                  }
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  className="py-1"
                >
                  <LucideIcons.ChevronUp
                    color={
                      rosterData[index - 1]?.type === "team" || index === 0
                        ? "#334155"
                        : "#64748B"
                    }
                    size={16}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveItemDown(index)}
                  disabled={
                    index === rosterData.length - 1 ||
                    rosterData[index + 1]?.type === "team"
                  }
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  className="py-1"
                >
                  <LucideIcons.ChevronDown
                    color={
                      index === rosterData.length - 1 ||
                      rosterData[index + 1]?.type === "team"
                        ? "#334155"
                        : "#64748B"
                    }
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
          );
        })}
      </View>

      <View className="bg-slate-900 border border-slate-800 border-t-0 rounded-b-3xl p-5 pt-0 mb-4">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleAddTeam}
            className="flex-1 border border-dashed border-slate-700 rounded-xl py-3 items-center"
          >
            <Text className="text-slate-400 font-bold text-xs">+ Add Team</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAddPlayer()}
            className="flex-1 border border-dashed border-slate-700 rounded-xl py-3 items-center"
          >
            <Text className="text-slate-400 font-bold text-xs">
              + Add Player
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
*/
