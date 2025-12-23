import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import * as quizService from '../services/quiz';
import type { Quiz, QuizAnswer, QuizResult } from '../types';

interface UseQuizReturn {
  quiz: Quiz | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  results: QuizResult[] | null;
  score: number | null;
  generateQuiz: (weekId: string) => Promise<Quiz | null>;
  fetchQuiz: (quizId: string) => Promise<void>;
  submitQuiz: (quizId: string, answers: QuizAnswer[]) => Promise<boolean>;
  resetQuiz: (quizId: string) => Promise<boolean>;
}

export const useQuiz = (): UseQuizReturn => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const toast = useToast();

  const generateQuiz = useCallback(async (weekId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.generateQuiz(weekId);
      setQuiz(data.quiz);
      toast({
        title: 'Quiz Generated!',
        description: 'Your quiz is ready. Good luck!',
        status: 'success',
        duration: 3000,
      });
      return data.quiz;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchQuiz = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuiz(quizId);
      setQuiz(data.quiz);
      
      // If quiz already has a score, set results
      if (data.quiz.score !== null && data.quiz.score !== undefined) {
        setScore(data.quiz.score);
        const existingResults: QuizResult[] = data.quiz.questions.map(q => ({
          questionId: q.id,
          correct: q.userAnswer === q.correctIndex,
          correctIndex: q.correctIndex,
          userAnswer: q.userAnswer ?? -1,
          explanation: q.explanation,
        }));
        setResults(existingResults);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quiz';
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

  const submitQuizAnswers = useCallback(async (quizId: string, answers: QuizAnswer[]): Promise<boolean> => {
    setSubmitting(true);
    try {
      const response = await quizService.submitQuiz(quizId, answers);
      setScore(response.score);
      setResults(response.results);
      toast({
        title: 'Quiz Submitted!',
        description: `You scored ${response.score}% (${response.correctCount}/${response.totalQuestions})`,
        status: response.score >= 70 ? 'success' : 'info',
        duration: 5000,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [toast]);

  const resetQuizData = useCallback(async (quizId: string): Promise<boolean> => {
    try {
      await quizService.resetQuiz(quizId);
      setResults(null);
      setScore(null);
      
      // Refetch quiz
      const data = await quizService.getQuiz(quizId);
      setQuiz(data.quiz);
      
      toast({
        title: 'Quiz Reset',
        description: 'You can now retake the quiz.',
        status: 'info',
        duration: 3000,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset quiz';
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  }, [toast]);

  return {
    quiz,
    loading,
    submitting,
    error,
    results,
    score,
    generateQuiz,
    fetchQuiz,
    submitQuiz: submitQuizAnswers,
    resetQuiz: resetQuizData,
  };
};
