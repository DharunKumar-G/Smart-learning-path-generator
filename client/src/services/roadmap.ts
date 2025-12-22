import api from './api';
import type { 
  Roadmap, 
  CreateRoadmapInput,
  Topic 
} from '../types';

// Generate a new roadmap using AI
export const generateRoadmap = async (input: CreateRoadmapInput): Promise<{ message: string; roadmap: Roadmap }> => {
  const response = await api.post<{ message: string; roadmap: Roadmap }>('/roadmap/generate', input);
  return response.data;
};

// Get all user's roadmaps
export const getRoadmaps = async (): Promise<{ roadmaps: Roadmap[] }> => {
  const response = await api.get<{ roadmaps: Roadmap[] }>('/roadmap');
  return response.data;
};

// Get a specific roadmap by ID
export const getRoadmap = async (id: string): Promise<{ roadmap: Roadmap }> => {
  const response = await api.get<{ roadmap: Roadmap }>(`/roadmap/${id}`);
  return response.data;
};

// Mark a topic as complete/incomplete
export const toggleTopicComplete = async (
  topicId: string, 
  isCompleted: boolean
): Promise<{ message: string; topic: Topic }> => {
  const response = await api.patch<{ message: string; topic: Topic }>(
    `/roadmap/topic/${topicId}/complete`,
    { isCompleted }
  );
  return response.data;
};

// Delete a roadmap
export const deleteRoadmap = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/roadmap/${id}`);
  return response.data;
};
