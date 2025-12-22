import api from './api';
import type { Quiz, QuizAnswer, QuizSubmitResponse } from '../types';

// Generate a quiz for a specific week
export const generateQuiz = async (weekId: string): Promise<{ message: string; quiz: Quiz }> => {
  const response = await api.post<{ message: string; quiz: Quiz }>(`/quiz/generate/${weekId}`);
  return response.data;
};

// Get a quiz by ID
export const getQuiz = async (quizId: string): Promise<{ quiz: Quiz }> => {
  const response = await api.get<{ quiz: Quiz }>(`/quiz/${quizId}`);
  return response.data;
};

// Submit quiz answers
export const submitQuiz = async (
  quizId: string, 
  answers: QuizAnswer[]
): Promise<QuizSubmitResponse> => {
  const response = await api.post<QuizSubmitResponse>(`/quiz/${quizId}/submit`, { answers });
  return response.data;
};

// Reset quiz to retake
export const resetQuiz = async (quizId: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/quiz/${quizId}/reset`);
  return response.data;
};
