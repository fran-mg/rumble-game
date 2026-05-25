import React from "react";
import { PlayStyle } from "../../../stores/useGameStore";
import SolosSelector from "./_SolosSelector";
import TeamSelector from "./_TeamSelector";
import { ListItem } from "./index";

interface PlayerSelectorProps {
  playStyle: PlayStyle;
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

export default function PlayerSelector({
  playStyle,
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
}: PlayerSelectorProps) {
  if (playStyle === "single") {
    return (
      <SolosSelector
        rosterData={rosterData}
        setRosterData={setRosterData}
        editingId={editingId}
        editName={editName}
        setEditName={setEditName}
        setEditingId={setEditingId}
        handleSaveEdit={handleSaveEdit}
        handleDeleteEntity={handleDeleteEntity}
        handleAddPlayer={handleAddPlayer}
      />
    );
  }

  return (
    <TeamSelector
      rosterData={rosterData}
      setRosterData={setRosterData}
      editingId={editingId}
      editName={editName}
      setEditName={setEditName}
      setEditingId={setEditingId}
      handleSaveEdit={handleSaveEdit}
      handleDeleteEntity={handleDeleteEntity}
      handleAddTeam={handleAddTeam}
      handleAddPlayer={handleAddPlayer}
    />
  );
}
