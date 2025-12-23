import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { generateQuiz } from '../services/gemini.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate a quiz for a specific week
router.post('/generate/:weekId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { weekId } = req.params;
    const userId = (req as any).userId;

    // Get the week with its topics and verify ownership
    const week = await prisma.week.findFirst({
      where: { 
        id: weekId,
        roadmap: {
          userId
        }
      },
      include: {
        topics: true,
        roadmap: {
          select: { title: true }
        }
      }
    });

    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }

    // Check if a quiz already exists for this week
    const existingQuiz = await prisma.quiz.findFirst({
      where: { weekId },
      include: { questions: true }
    });

    if (existingQuiz) {
      return res.json({ 
        message: 'Quiz already exists for this week',
        quiz: existingQuiz 
      });
    }

    // Generate quiz using AI
    const generatedQuiz = await generateQuiz(
      week.topics.map(t => ({ name: t.name, description: t.description || '' })),
      week.title
    );

    // Save quiz to database
    const quiz = await prisma.quiz.create({
      data: {
        weekId,
        questions: {
          create: generatedQuiz.questions.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json({
      message: 'Quiz generated successfully!',
      quiz
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

// Get a quiz by ID
router.get('/:quizId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = (req as any).userId;

    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        week: {
          roadmap: {
            userId
          }
        }
      },
      include: {
        questions: true,
        week: {
          select: {
            title: true,
            weekNumber: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId: string, selectedIndex: number }
    const userId = (req as any).userId;

    // Verify quiz ownership
    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        week: {
          roadmap: {
            userId
          }
        }
      },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Calculate score and update user answers
    let correctCount = 0;
    const results: {
      questionId: string;
      correct: boolean;
      correctIndex: number;
      userAnswer: number;
      explanation: string | null;
    }[] = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (question) {
        const isCorrect = question.correctIndex === answer.selectedIndex;
        if (isCorrect) correctCount++;

        // Update the question with user's answer
        await prisma.question.update({
          where: { id: question.id },
          data: { userAnswer: answer.selectedIndex }
        });

        results.push({
          questionId: question.id,
          correct: isCorrect,
          correctIndex: question.correctIndex,
          userAnswer: answer.selectedIndex,
          explanation: question.explanation
        });
      }
    }

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Update quiz with score
    await prisma.quiz.update({
      where: { id: quizId },
      data: { score }
    });

    res.json({
      message: score >= 70 ? 'Great job!' : 'Keep practicing!',
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Reset quiz (allow retaking)
router.post('/:quizId/reset', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = (req as any).userId;

    // Verify quiz ownership
    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        week: {
          roadmap: {
            userId
          }
        }
      },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Reset score and user answers
    await prisma.quiz.update({
      where: { id: quizId },
      data: { score: null }
    });

    // Reset all question answers
    await prisma.question.updateMany({
      where: { quizId },
      data: { userAnswer: null }
    });

    res.json({ message: 'Quiz reset successfully. You can retake it now.' });
  } catch (error) {
    console.error('Reset quiz error:', error);
    res.status(500).json({ error: 'Failed to reset quiz' });
  }
});

export { router as quizRouter };
