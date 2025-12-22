import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { generateRoadmap } from '../services/openai.js';

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

// Validation schema for creating a roadmap
const createRoadmapSchema = z.object({
  currentSkills: z.string().min(10, 'Please describe your current skills in more detail'),
  targetGoal: z.string().min(10, 'Please describe your target goal in more detail'),
  hoursPerWeek: z.number().min(1, 'At least 1 hour per week is required').max(60, 'Maximum 60 hours per week'),
  totalWeeks: z.number().min(1, 'At least 1 week is required').max(52, 'Maximum 52 weeks')
});

// Create a new roadmap
router.post('/generate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const validatedData = createRoadmapSchema.parse(req.body);
    const userId = (req as any).userId;

    // Generate roadmap using AI
    const aiRoadmap = await generateRoadmap({
      currentSkills: validatedData.currentSkills,
      targetGoal: validatedData.targetGoal,
      hoursPerWeek: validatedData.hoursPerWeek,
      totalWeeks: validatedData.totalWeeks
    });

    // Save roadmap to database
    const roadmap = await prisma.roadmap.create({
      data: {
        title: aiRoadmap.title,
        description: aiRoadmap.description,
        currentSkills: validatedData.currentSkills,
        targetGoal: validatedData.targetGoal,
        hoursPerWeek: validatedData.hoursPerWeek,
        totalWeeks: validatedData.totalWeeks,
        userId: userId,
        weeks: {
          create: aiRoadmap.weeks.map((week: any, weekIndex: number) => ({
            weekNumber: weekIndex + 1,
            title: week.title,
            description: week.description,
            goals: week.goals,
            topics: {
              create: week.topics.map((topic: any, topicIndex: number) => ({
                name: topic.name,
                description: topic.description,
                estimatedHours: topic.estimatedHours,
                order: topicIndex + 1,
                whyThisFirst: topic.whyThisFirst,
                searchStrings: topic.searchStrings
              }))
            }
          }))
        }
      },
      include: {
        weeks: {
          include: {
            topics: true
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      }
    });

    res.status(201).json({
      message: 'Roadmap generated successfully!',
      roadmap
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Roadmap generation error:', error);
    res.status(500).json({ error: 'Failed to generate roadmap. Please try again.' });
  }
});

// Get all roadmaps for a user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      include: {
        weeks: {
          include: {
            topics: true
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ roadmaps });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

// Get a specific roadmap
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const roadmap = await prisma.roadmap.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        weeks: {
          include: {
            topics: {
              orderBy: {
                order: 'asc'
              }
            },
            quizzes: {
              include: {
                questions: true
              }
            }
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    res.json({ roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// Update topic completion status
router.patch('/topic/:topicId/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { isCompleted } = req.body;

    const topic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    res.json({ 
      message: isCompleted ? 'Topic marked as complete!' : 'Topic marked as incomplete',
      topic 
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Delete a roadmap
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if roadmap belongs to user
    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId }
    });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    await prisma.roadmap.delete({
      where: { id }
    });

    res.json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({ error: 'Failed to delete roadmap' });
  }
});

export { router as roadmapRouter };
