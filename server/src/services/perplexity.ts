import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface ResearchResult {
  topic: string;
  research: string;
  sources: string[];
}

// Research a learning topic using Perplexity's web search capabilities
export async function researchTopic(
  topic: string,
  context: string
): Promise<ResearchResult> {
  const prompt = `Research the following learning topic and provide comprehensive, up-to-date information:

Topic: ${topic}
Context: ${context}

Please provide:
1. Current best practices and modern approaches (2024-2025)
2. Key concepts a learner should understand
3. Recommended learning resources (courses, tutorials, documentation)
4. Common pitfalls to avoid
5. Prerequisites needed
6. Estimated time to learn for a beginner

Be specific and include actual resource names, websites, and learning paths that exist today.`;

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a learning research assistant. Provide accurate, up-to-date information about learning topics with real resources and current best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        return_citations: true
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    const citations = response.data.citations || [];

    return {
      topic,
      research: content,
      sources: citations
    };
  } catch (error: any) {
    console.error('Perplexity research error:', error.response?.data || error.message);
    throw new Error(`Failed to research topic: ${topic}`);
  }
}

// Research multiple topics in parallel
export async function researchTopics(
  topics: string[],
  context: string
): Promise<ResearchResult[]> {
  const results = await Promise.all(
    topics.map(topic => researchTopic(topic, context))
  );
  return results;
}

// Research for roadmap generation - get current learning landscape
export async function researchLearningPath(
  currentSkills: string,
  targetGoal: string
): Promise<string> {
  const prompt = `I want to create a learning roadmap for someone with the following profile:

Current Skills: ${currentSkills}
Target Goal: ${targetGoal}

Please research and provide:
1. The current (2024-2025) recommended learning path for this goal
2. Essential topics and technologies to cover
3. The optimal order to learn these topics (prerequisites first)
4. Popular and highly-rated learning resources (courses, books, tutorials)
5. Typical timeline estimates for each major milestone
6. Industry trends that might affect what to prioritize
7. Common mistakes learners make on this path

Focus on practical, actionable information with real resources that exist today.`;

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning path researcher. Provide comprehensive, current information about learning paths with real resources, accurate timelines, and industry-relevant advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        return_citations: true
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    const citations = response.data.citations || [];
    
    // Combine research content with sources
    let result = content;
    if (citations.length > 0) {
      result += '\n\nSources:\n' + citations.map((url: string, i: number) => `${i + 1}. ${url}`).join('\n');
    }
    
    return result;
  } catch (error: any) {
    console.error('Perplexity learning path research error:', error.response?.data || error.message);
    // Return empty string to fallback to OpenAI-only generation
    return '';
  }
}
