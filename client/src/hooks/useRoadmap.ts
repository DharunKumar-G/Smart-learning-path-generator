import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import * as roadmapService from '../services/roadmap';
import type { Roadmap, CreateRoadmapInput } from '../types';

interface UseRoadmapReturn {
  roadmap: Roadmap | null;
  roadmaps: Roadmap[];
  loading: boolean;
  error: string | null;
  fetchRoadmap: (id: string) => Promise<void>;
  fetchRoadmaps: () => Promise<void>;
  createRoadmap: (input: CreateRoadmapInput) => Promise<Roadmap | null>;
  deleteRoadmap: (id: string) => Promise<boolean>;
  markTopicComplete: (topicId: string) => Promise<boolean>;
}

export const useRoadmap = (): UseRoadmapReturn => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchRoadmap = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapService.getRoadmap(id);
      setRoadmap(data.roadmap);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch roadmap';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapService.getRoadmaps();
      setRoadmaps(data.roadmaps);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch roadmaps';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createRoadmap = useCallback(async (input: CreateRoadmapInput): Promise<Roadmap | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await roadmapService.generateRoadmap(input);
      toast({
        title: 'Success!',
        description: 'Your learning roadmap has been generated.',
        status: 'success',
        duration: 5000,
      });
      return data.roadmap;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create roadmap';
      setError(message);
      toast({
        title: 'Generation Failed',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteRoadmap = useCallback(async (id: string): Promise<boolean> => {
    try {
      await roadmapService.deleteRoadmap(id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Deleted',
        description: 'Roadmap has been deleted.',
        status: 'info',
        duration: 3000,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete roadmap';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  }, [toast]);

  const markTopicComplete = useCallback(async (topicId: string): Promise<boolean> => {
    try {
      await roadmapService.toggleTopicComplete(topicId, true);
      // Update local state
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          weeks: roadmap.weeks.map(week => ({
            ...week,
            topics: week.topics.map(topic =>
              topic.id === topicId
                ? { ...topic, isCompleted: true, completedAt: new Date().toISOString() }
                : topic
            ),
          })),
        });
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark topic complete';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  }, [roadmap, toast]);

  return {
    roadmap,
    roadmaps,
    loading,
    error,
    fetchRoadmap,
    fetchRoadmaps,
    createRoadmap,
    deleteRoadmap,
    markTopicComplete,
  };
};
