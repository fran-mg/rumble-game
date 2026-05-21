import { create } from "zustand";
import { dbHelpers } from "../utils/database";

interface Team {
  id: number;
  name: string;
  color: string;
  icon: string;
  score?: number;
}

interface TeamState {
  teams: Team[];
  currentTeamIndex: number;

  // Actions
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
    const teams = await dbHelpers.getAllTeams();
    set({ teams });
  },

  createTeam: async (
    name: string,
    color: string = "#3B82F6",
    icon: string = "👥",
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
    set({ currentTeamIndex: (currentTeamIndex + 1) % teams.length });
  },

  resetTeamIndex: () => {
    set({ currentTeamIndex: 0 });
  },
}));
