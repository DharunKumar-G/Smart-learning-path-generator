import { GoogleGenerativeAI } from '@google/generative-ai';
import { researchLearningPath } from './perplexity.js';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the Gemini model
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4000,
  }
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
  whyThisFirst: string;
  searchStrings: string[];
}

interface Week {
  title: string;
  description: string;
  goals: string;
  topics: Topic[];
}

interface GeneratedRoadmap {
  title: string;
  description: string;
  weeks: Week[];
}

// Helper function to extract JSON from response
function extractJSON(text: string): string {
  // Try to find JSON in the response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                    text.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, text];
  return jsonMatch[1]?.trim() || text.trim();
}

// Generate a personalized learning roadmap using AI
// Step 1: Perplexity researches the learning path (web search)
// Step 2: Gemini organizes the research into a structured plan
export async function generateRoadmap(input: RoadmapInput): Promise<GeneratedRoadmap> {
  // First, use Perplexity to research the learning path
  console.log('🔍 Researching learning path with Perplexity...');
  let researchData = '';
  try {
    researchData = await researchLearningPath(input.currentSkills, input.targetGoal);
    console.log('✅ Research completed, organizing with Gemini...');
  } catch (error) {
    console.log('⚠️ Perplexity research failed, proceeding with Gemini only...');
  }

  // Build the prompt with or without research data
  const researchSection = researchData 
    ? `\n\n**Research Data (from web search - use this to inform your roadmap):**\n${researchData}\n\n`
    : '';

  const prompt = `You are an expert learning path designer. Create a detailed, personalized learning roadmap based on the following inputs:

**Current Skills:** ${input.currentSkills}
**Target Goal:** ${input.targetGoal}
**Available Time:** ${input.hoursPerWeek} hours per week
**Duration:** ${input.totalWeeks} weeks
${researchSection}
Generate a structured learning path that:
1. Builds on existing knowledge progressively
2. Prioritizes foundational concepts before advanced topics
3. Includes practical projects and exercises
4. Provides reasoning for topic ordering (prerequisites)
5. Includes search strings for finding quality resources
${researchData ? '6. Incorporates the researched resources and current best practices from the research data above' : ''}

Return a JSON object with this exact structure:
{
  "title": "Descriptive title for the learning path",
  "description": "Brief overview of what the learner will achieve",
  "weeks": [
    {
      "title": "Week title",
      "description": "What this week covers",
      "goals": "What the learner should be able to do after this week",
      "topics": [
        {
          "name": "Topic name",
          "description": "Brief description of what to learn",
          "estimatedHours": 2.5,
          "whyThisFirst": "Explanation of why this topic comes at this point in the curriculum",
          "searchStrings": ["search query 1", "search query 2", "search query 3"]
        }
      ]
    }
  ]
}

Make sure:
- Total hours across all topics roughly equals ${input.hoursPerWeek * input.totalWeeks} hours
- Each week has ${Math.ceil(input.hoursPerWeek / 2)}-${Math.ceil(input.hoursPerWeek / 1.5)} topics
- Search strings are specific and would yield high-quality educational resources
- The progression is logical and builds upon previous weeks

Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    const jsonContent = extractJSON(content);
    const roadmap = JSON.parse(jsonContent) as GeneratedRoadmap;
    
    // Validate the structure
    if (!roadmap.title || !roadmap.weeks || !Array.isArray(roadmap.weeks)) {
      throw new Error('Invalid roadmap structure from AI');
    }

    return roadmap;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}

// Generate quiz questions for a week's topics
export async function generateQuiz(topics: { name: string; description: string }[], weekTitle: string): Promise<{
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}> {
  const topicList = topics.map(t => `- ${t.name}: ${t.description}`).join('\n');
  
  const prompt = `Generate a quiz with 5 multiple-choice questions to test understanding of these topics from "${weekTitle}":

${topicList}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is the correct answer"
    }
  ]
}

Make questions:
- Test conceptual understanding, not memorization
- Include a mix of difficulty levels
- Have plausible but clearly wrong distractors
- Cover different topics from the week

Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    const jsonContent = extractJSON(content);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
  }
}

// Search for learning resources using AI
export async function suggestResources(topic: string, searchStrings: string[]): Promise<{
  resources: {
    type: 'video' | 'article' | 'course' | 'documentation' | 'tutorial';
    title: string;
    description: string;
    searchQuery: string;
  }[];
}> {
  const prompt = `For the topic "${topic}", suggest 5 learning resources that a student could find using these search terms:
${searchStrings.map(s => `- "${s}"`).join('\n')}

Return a JSON object with this structure:
{
  "resources": [
    {
      "type": "video|article|course|documentation|tutorial",
      "title": "Suggested resource title",
      "description": "Brief description of what the resource covers",
      "searchQuery": "Optimized search query to find this resource"
    }
  ]
}

Include a variety of resource types (videos, articles, documentation, tutorials).
Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No response from Gemini');
    }

    const jsonContent = extractJSON(content);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Resource suggestion error:', error);
    throw new Error('Failed to suggest resources. Please try again.');
  }
}
