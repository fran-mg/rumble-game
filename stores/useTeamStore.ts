import { create } from "zustand";
import { dbHelpers } from "../utils/database";

export interface Team {
  id: number;
  name: string;
  color: string;
  icon: string; // Will store clean lucide icon string names like 'Users', 'Target', 'Trophy'
  score?: number;
}

interface TeamState {
  teams: Team[];
  currentTeamIndex: number;
  loadTeams: () => Promise<void>;
  createTeam: (name: string, color: string, icon: string) => Promise<void>;
  deleteTeam: (teamId: number) => Promise<void>;
  updateTeam: (
    teamId: number,
    name: string,
    color: string,
    icon: string,
  ) => Promise<void>;
  setCurrentTeamIndex: (index: number) => void;
  nextTeam: () => void;
  resetTeamIndex: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeamIndex: 0,

  loadTeams: async () => {
    const data = await dbHelpers.getAllTeams();
    set({ teams: data as Team[] });
  },

  createTeam: async (
    name: string,
    color: string = "#3B82F6",
    icon: string = "Users",
  ) => {
    await dbHelpers.createTeam(name, color, icon);
    await get().loadTeams();
  },

  deleteTeam: async (teamId: number) => {
    await dbHelpers.deleteTeam(teamId);
    await get().loadTeams();
  },

  updateTeam: async (
    teamId: number,
    name: string,
    color: string,
    icon: string,
  ) => {
    await dbHelpers.updateTeam(teamId, name, color, icon);
    await get().loadTeams();
  },

  setCurrentTeamIndex: (index: number) => {
    set({ currentTeamIndex: index });
  },

  nextTeam: () => {
    const { teams, currentTeamIndex } = get();
    if (teams.length === 0) return;
    set({ currentTeamIndex: (currentTeamIndex + 1) % teams.length });
  },

  resetTeamIndex: () => {
    set({ currentTeamIndex: 0 });
  },
}));
