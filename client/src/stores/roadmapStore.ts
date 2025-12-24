import { create } from 'zustand';
import type { Roadmap, Topic } from '../types';

interface RoadmapState {
  roadmaps: Roadmap[];
  currentRoadmap: Roadmap | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  setRoadmaps: (roadmaps: Roadmap[]) => void;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  addRoadmap: (roadmap: Roadmap) => void;
  removeRoadmap: (id: string) => void;
  updateTopicCompletion: (topicId: string, isCompleted: boolean) => void;
  updateTopic: (topicId: string, updates: Partial<Topic>) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  roadmaps: [],
  currentRoadmap: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  
  setRoadmaps: (roadmaps) => set({ roadmaps }),
  
  setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),
  
  addRoadmap: (roadmap) => set((state) => ({ 
    roadmaps: [roadmap, ...state.roadmaps] 
  })),
  
  removeRoadmap: (id) => set((state) => ({
    roadmaps: state.roadmaps.filter((r) => r.id !== id),
    currentRoadmap: state.currentRoadmap?.id === id ? null : state.currentRoadmap,
  })),
  
  updateTopicCompletion: (topicId, isCompleted) => {
    const { currentRoadmap, roadmaps } = get();
    if (!currentRoadmap) return;
    
    const updatedWeeks = currentRoadmap.weeks.map((week) => ({
      ...week,
      topics: week.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, isCompleted, completedAt: isCompleted ? new Date().toISOString() : undefined }
          : topic
      ),
    }));
    
    const updatedRoadmap = { ...currentRoadmap, weeks: updatedWeeks };
    
    // Also update in roadmaps array
    const updatedRoadmaps = roadmaps.map((r) =>
      r.id === currentRoadmap.id ? updatedRoadmap : r
    );
    
    set({
      currentRoadmap: updatedRoadmap,
      roadmaps: updatedRoadmaps,
    });
  },

  updateTopic: (topicId, updates) => {
    const { currentRoadmap, roadmaps } = get();
    if (!currentRoadmap) return;
    
    const updatedWeeks = currentRoadmap.weeks.map((week) => ({
      ...week,
      topics: week.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, ...updates }
          : topic
      ),
    }));
    
    const updatedRoadmap = { ...currentRoadmap, weeks: updatedWeeks };
    
    const updatedRoadmaps = roadmaps.map((r) =>
      r.id === currentRoadmap.id ? updatedRoadmap : r
    );
    
    set({
      currentRoadmap: updatedRoadmap,
      roadmaps: updatedRoadmaps,
    });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setGenerating: (generating) => set({ isGenerating: generating }),
  
  setError: (error) => set({ error }),
}));
