// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

// Roadmap types
export interface Topic {
  id: string;
  name: string;
  description?: string;
  estimatedHours: number;
  order: number;
  whyThisFirst: string;
  searchStrings: string[];
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  isBookmarked: boolean;
  weekId: string;
}

export interface Quiz {
  id: string;
  createdAt: string;
  score?: number;
  weekId: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  userAnswer?: number;
  quizId: string;
}

export interface Week {
  id: string;
  weekNumber: number;
  title: string;
  description?: string;
  goals: string;
  roadmapId: string;
  topics: Topic[];
  quizzes: Quiz[];
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  currentSkills: string;
  targetGoal: string;
  hoursPerWeek: number;
  totalWeeks: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  weeks: Week[];
}

// Form types for creating roadmap
export interface CreateRoadmapInput {
  currentSkills: string;
  targetGoal: string;
  hoursPerWeek: number;
  totalWeeks: number;
}

// Quiz submission types
export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  userAnswer: number;
  explanation?: string;
}

export interface QuizSubmitResponse {
  message: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: QuizResult[];
}
