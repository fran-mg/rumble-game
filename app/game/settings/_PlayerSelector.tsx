import * as LucideIcons from "lucide-react-native";
import React, { useRef } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { PlayStyle } from "../../../stores/useGameStore";
import { useRosterStore } from "../../../stores/useRosterStore";
import { Participant } from "../../../utils/database";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PlayerSelectorProps {
  playStyle: PlayStyle;
}

// ─── ROSTER ITEM ─────────────────────────────────────────────────────────────

interface RosterItemProps {
  item: Participant;
  drag: () => void;
  isActive: boolean;
  playStyle: PlayStyle;
  editingId: number | null;
  editName: string;
  setEditName: (name: string) => void;
  onBeginEdit: (id: number, currentName: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function RosterItem({
  item,
  drag,
  isActive,
  playStyle,
  editingId,
  editName,
  setEditName,
  onBeginEdit,
  onConfirmEdit,
  onCancelEdit,
  onDelete,
}: RosterItemProps) {
  const isEditing = editingId === item.id;

  // Visual treatment differs slightly between team and solo items so the
  // user gets a clear affordance about what each row represents.
  const isTeam = item.type === "team";

  return (
    <ScaleDecorator>
      <View
        style={{
          borderColor: item.color,
          // Lift active drag items visually
          opacity: isActive ? 0.9 : 1,
          transform: [{ scale: isActive ? 1.02 : 1 }],
        }}
        className={[
          "flex-row items-center rounded-2xl border-2 px-3 py-3 mb-2",
          isTeam ? "bg-slate-900" : "bg-slate-950",
          isActive ? "shadow-2xl" : "",
        ].join(" ")}
      >
        {/* Drag handle */}
        <TouchableOpacity
          onPressIn={drag}
          hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
          className="pr-3"
        >
          <LucideIcons.GripVertical color="#475569" size={20} />
        </TouchableOpacity>

        {/* Color dot */}
        <View
          style={{ backgroundColor: item.color }}
          className="w-3 h-3 rounded-full mr-3"
        />

        {/* Name input or label */}
        {isEditing ? (
          <TextInput
            value={editName}
            onChangeText={setEditName}
            autoFocus
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={onConfirmEdit}
            placeholder={isTeam ? "Team name…" : "Player name…"}
            placeholderTextColor="#475569"
            className={[
              "flex-1 font-bold text-white",
              isTeam ? "text-lg" : "text-base",
            ].join(" ")}
          />
        ) : (
          <Text
            numberOfLines={1}
            className={[
              "flex-1 font-bold",
              isTeam ? "text-white text-lg" : "text-slate-300 text-base",
              !item.name ? "text-slate-600 italic" : "",
            ].join(" ")}
          >
            {item.name || (isTeam ? "Unnamed team" : "Unnamed player")}
          </Text>
        )}

        {/* Action buttons */}
        <View className="flex-row items-center gap-4 ml-2">
          {isEditing ? (
            <>
              <TouchableOpacity
                onPress={onConfirmEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LucideIcons.Check color="#10B981" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onCancelEdit(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LucideIcons.X color="#EF4444" size={20} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => onBeginEdit(item.id, item.name)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LucideIcons.Edit3 color="#64748B" size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LucideIcons.Trash2 color="#EF4444" size={18} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScaleDecorator>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PlayerSelector({ playStyle }: PlayerSelectorProps) {
  const {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    reorderParticipants,
  } = useRosterStore();

  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editName, setEditName] = React.useState("");

  // Track whether the item being cancelled was brand-new (empty name → delete it)
  const isNewRef = useRef(false);

  const label = playStyle === "solo" ? "Player" : "Team";

  // ── Edit handlers ──────────────────────────────────────────────────────────

  const handleBeginEdit = (id: number, currentName: string) => {
    isNewRef.current = currentName === "";
    setEditingId(id);
    setEditName(currentName);
  };

  const handleConfirmEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert(
        "Name required",
        `Please enter a name for this ${label.toLowerCase()}.`,
      );
      return;
    }
    if (trimmed.length > 30) {
      Alert.alert("Too long", "Name must be 30 characters or fewer.");
      return;
    }
    updateParticipant(editingId!, trimmed);
    setEditingId(null);
    isNewRef.current = false;
  };

  const handleCancelEdit = (id: number) => {
    // If the user cancels a brand-new unsaved item, remove it entirely
    if (isNewRef.current) {
      deleteParticipant(id);
    }
    setEditingId(null);
    isNewRef.current = false;
  };

  const handleDelete = (id: number) => {
    if (participants.length <= 1) {
      Alert.alert(
        "Can't remove",
        `You need at least one ${label.toLowerCase()} to play.`,
      );
      return;
    }
    deleteParticipant(id);
  };

  const handleAdd = () => {
    addParticipant(playStyle);
    // The new item lands at end of list — begin editing it immediately.
    // We need a tiny delay so the list has rendered before we try to edit.
    setTimeout(() => {
      const latest = useRosterStore.getState().participants.at(-1);
      if (latest) handleBeginEdit(latest.id, "");
    }, 50);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderItem = (params: RenderItemParams<Participant>) => (
    <RosterItem
      {...params}
      playStyle={playStyle}
      editingId={editingId}
      editName={editName}
      setEditName={setEditName}
      onBeginEdit={handleBeginEdit}
      onConfirmEdit={handleConfirmEdit}
      onCancelEdit={handleCancelEdit}
      onDelete={handleDelete}
    />
  );

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-b-3xl px-4 pt-2 pb-5 mb-4">
      {/* Participant count pill */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {participants.length} {label}
          {participants.length !== 1 ? "s" : ""}
        </Text>
        {playStyle === "team" && (
          <Text className="text-slate-600 text-xs">drag to set turn order</Text>
        )}
      </View>

      {/* Draggable list — scrolling disabled here, parent ScrollView handles it */}
      <DraggableFlatList
        data={participants}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onDragEnd={({ data }) => reorderParticipants(data)}
        // Disable internal scroll — this is inside a DraggableFlatList already
        scrollEnabled={false}
        activationDistance={8}
      />

      {/* Add button */}
      <TouchableOpacity
        onPress={handleAdd}
        className="mt-2 flex-row items-center justify-center border border-dashed border-slate-700 rounded-xl py-3 gap-2"
      >
        <LucideIcons.Plus color="#64748B" size={16} />
        <Text className="text-slate-400 font-bold text-sm">Add {label}</Text>
      </TouchableOpacity>
    </View>
  );
}
