import { create } from 'zustand';
import type { Laboratory, Paper, ResearchProject, HypothesisRequest, UserProfile } from '@/types';

interface AppState {
  user: UserProfile | null;
  laboratories: Laboratory[];
  currentLab: Laboratory | null;
  papers: Paper[];
  projects: ResearchProject[];
  hypothesisRequests: HypothesisRequest[];
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  setLaboratories: (labs: Laboratory[]) => void;
  setCurrentLab: (lab: Laboratory | null) => void;
  setPapers: (papers: Paper[]) => void;
  setProjects: (projects: ResearchProject[]) => void;
  setHypothesisRequests: (requests: HypothesisRequest[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  laboratories: [],
  currentLab: null,
  papers: [],
  projects: [],
  hypothesisRequests: [],
  isLoading: false,

  setUser: (user) => set({ user }),
  setLaboratories: (laboratories) => set({ laboratories }),
  setCurrentLab: (currentLab) => set({ currentLab }),
  setPapers: (papers) => set({ papers }),
  setProjects: (projects) => set({ projects }),
  setHypothesisRequests: (hypothesisRequests) => set({ hypothesisRequests }),
  setLoading: (isLoading) => set({ isLoading }),
}));
