import Groq from 'groq-sdk';
import { researchLearningPath } from './perplexity.js';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Types for roadmap generation
interface RoadmapInput {
  currentSkills: string;
  targetGoal: string;
  hoursPerWeek: number;
  totalWeeks: number;
}

interface Topic {
  name: string;
  description: string;
  estimatedHours: number;
  order: number;
  whyThisFirst: string;
  searchStrings: string[];
}

interface Week {
  weekNumber: number;
  title: string;
  description: string;
  goals: string;
  topics: Topic[];
}

interface RoadmapOutput {
  title: string;
  description: string;
  weeks: Week[];
  totalHours: number;
}

// Generate roadmap using Perplexity research + Groq organization
export async function generateRoadmap(input: RoadmapInput): Promise<RoadmapOutput> {
  try {
    // Step 1: Research with Perplexity
    console.log('🔍 Researching learning path with Perplexity...');
    const research = await researchLearningPath(input.currentSkills, input.targetGoal, input.totalWeeks);
    console.log('✅ Research completed, organizing with Groq...');

    // Step 2: Organize with Groq
    const prompt = `You are an expert learning path designer. Based on the following research about learning "${input.targetGoal}", create a structured learning roadmap.

RESEARCH DATA:
${research}

USER CONTEXT:
- Current skills: ${input.currentSkills}
- Target goal: ${input.targetGoal}
- Hours available per week: ${input.hoursPerWeek}
- Total weeks: ${input.totalWeeks}

Create a detailed learning roadmap as a JSON object with this EXACT structure:
{
  "title": "string - catchy title for the learning path",
  "description": "string - brief description of what the learner will achieve",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "string - title for this week",
      "description": "string - what this week covers",
      "goals": "string - main goals to achieve this week",
      "topics": [
        {
          "name": "string - topic name",
          "description": "string - what will be learned",
          "estimatedHours": 2.5,
          "order": 1,
          "whyThisFirst": "string - why learn this topic at this point",
          "searchStrings": ["string - search term 1", "string - search term 2"]
        }
      ]
    }
  ],
  "totalHours": 40
}

CRITICAL Requirements:
- Every week MUST have "goals" as a string
- Every topic MUST have "name" (not "title")
- Every topic MUST have "whyThisFirst" explaining prerequisites
- Every topic MUST have "searchStrings" array with 2-3 search terms
- Distribute topics across exactly ${input.totalWeeks} weeks
- Each week should have approximately ${input.hoursPerWeek} hours of content
- Include 2-4 topics per week
- Return ONLY valid JSON, no markdown code blocks or explanation`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response - try to find and clean the JSON
    let jsonStr = responseText;
    
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find the JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse roadmap JSON from response');
    }

    try {
      const roadmap = JSON.parse(jsonMatch[0]) as RoadmapOutput;
      return roadmap;
    } catch (parseError) {
      // Try to fix common JSON issues
      let fixedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/'/g, '"')      // Replace single quotes with double quotes
        .replace(/\n/g, ' ')     // Remove newlines inside strings
        .replace(/\t/g, ' ');    // Remove tabs
      
      const roadmap = JSON.parse(fixedJson) as RoadmapOutput;
      return roadmap;
    }

  } catch (error) {
    console.error('Groq generation error:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}

// Generate quiz for a topic
export async function generateQuiz(topicTitle: string, topicDescription: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') {
  try {
    const prompt = `Create a quiz for the topic "${topicTitle}" (${topicDescription}).

Difficulty level: ${difficulty}

Generate 5 multiple choice questions as a JSON array with this structure:
[
  {
    "id": "q1",
    "question": "string - the question text",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": "A",
    "explanation": "string - why this answer is correct"
  }
]

Requirements:
- Questions should test understanding, not just memorization
- Include practical application questions
- Make wrong answers plausible but clearly incorrect
- Return ONLY the JSON array, no markdown or explanation`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse quiz JSON from response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return { questions };

  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

// Generate detailed content for a topic
export async function generateTopicContent(topicTitle: string, topicDescription: string) {
  try {
    const prompt = `Create detailed learning content for the topic "${topicTitle}".

Topic description: ${topicDescription}

Generate comprehensive learning content as a JSON object:
{
  "overview": "string - 2-3 paragraph overview of the topic",
  "keyPoints": ["string - key point 1", "string - key point 2", ...],
  "examples": [
    {
      "title": "string",
      "code": "string - code example if applicable",
      "explanation": "string"
    }
  ],
  "practiceExercises": [
    {
      "title": "string",
      "description": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "additionalResources": ["string - resource name or URL"]
}

Return ONLY the JSON object, no markdown or explanation.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse content JSON from response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Content generation error:', error);
    throw new Error('Failed to generate topic content. Please try again.');
  }
}
