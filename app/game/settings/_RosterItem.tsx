import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScaleDecorator } from "react-native-draggable-flatlist";
import { PlayStyle } from "../../../stores/useGameStore";
import { ListItem } from "./index";

interface RosterItemProps {
  item: ListItem;
  drag: () => void;
  isActive: boolean;
  playStyle: PlayStyle;
  teamColor: string;
  editingId: number | null;
  editName: string;
  setEditName: (name: string) => void;
  setEditingId: (id: number | null) => void;
  handleSaveEdit: () => void;
  handleDeleteEntity: (id: number, type: "player" | "team") => void;
}

export default function RosterItem({
  item,
  drag,
  isActive,
  playStyle,
  teamColor,
  editingId,
  editName,
  setEditName,
  setEditingId,
  handleSaveEdit,
  handleDeleteEntity,
}: RosterItemProps) {
  if (item.type === "team") {
    return (
      <ScaleDecorator>
        <View
          style={{
            borderColor: item.color,
            backgroundColor: isActive ? "#0F172A" : "transparent",
          }}
          className={`border-x-2 border-t-2 rounded-t-2xl p-3 shadow-lg mt-3 ${isActive ? "border-b-2 rounded-b-2xl border-blue-500 z-50" : ""}`}
        >
          <View className="flex-row justify-between items-center">
            {/* FIXED: Better drag handle with hitSlop */}
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={100}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-2 -ml-2 active:opacity-50"
            >
              <LucideIcons.GripVertical color="#64748B" size={24} />
            </TouchableOpacity>

            {editingId === item.id ? (
              <TextInput
                value={editName}
                onChangeText={setEditName}
                autoFocus
                maxLength={30}
                className="flex-1 text-white font-black text-lg mx-2"
              />
            ) : (
              <Text className="flex-1 text-white font-black text-lg mx-2">
                {item.name}
              </Text>
            )}

            <View className="flex-row gap-3">
              {editingId === item.id ? (
                <>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <LucideIcons.Check color="#10B981" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(null);
                      if (!item.name) handleDeleteEntity(item.id, "team");
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <LucideIcons.Edit3 color="#64748B" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntity(item.id, "team")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <LucideIcons.Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <ScaleDecorator>
      <View
        style={{ borderColor: teamColor }}
        className={`flex-row items-center bg-slate-950/80 p-3 border-x-2 border-b-2 ${playStyle === "single" ? "rounded-xl border-t-2 mb-2 border-slate-800" : ""} ${isActive ? "opacity-80 scale-105 shadow-xl border-blue-500 rounded-xl border-t-2 z-50" : ""}`}
      >
        {/* FIXED: Better drag handle for players */}
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={100}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="p-2 -ml-2 active:opacity-50"
        >
          <LucideIcons.GripVertical color="#64748B" size={20} />
        </TouchableOpacity>

        {editingId === item.id ? (
          <TextInput
            value={editName}
            onChangeText={setEditName}
            autoFocus
            maxLength={30}
            className="flex-1 text-white font-medium mx-2"
          />
        ) : (
          <Text className="flex-1 text-slate-300 font-medium mx-2">
            {item.name}
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
    </ScaleDecorator>
  );
}
