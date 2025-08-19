import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { SuggestRequest, SuggestResponse } from '@/types';
import { createServerClient } from '@/lib/supabase/server';

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Static fallback suggestions for when AI fails
const STATIC_FALLBACKS: SuggestResponse[] = [
  {
    firstStep: {
      description: "Open your workspace and gather any materials you need",
      estimatedSeconds: 60
    },
    nextActions: [
      "Review your goal and break it into smaller pieces",
      "Set up your environment for focused work",
      "Start with the easiest part to build momentum",
      "Take notes as you work to track progress"
    ],
    fallbackUsed: true
  },
  {
    firstStep: {
      description: "Write down exactly what you want to accomplish",
      estimatedSeconds: 60
    },
    nextActions: [
      "List the first 3 steps you can think of",
      "Choose the smallest step to start with",
      "Set a timer for focused work",
      "Remove distractions from your workspace"
    ],
    fallbackUsed: true
  }
];

async function callGeminiFlash(prompt: string): Promise<SuggestResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseAIResponse(text);
}

async function callGeminiFlashLite(prompt: string): Promise<SuggestResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseAIResponse(text);
}

function parseAIResponse(text: string): SuggestResponse {
  console.log('Raw AI response text:', text);
  
  try {
    // Clean the text first - remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to parse as JSON first
    const parsed = JSON.parse(cleanText);
    console.log('Parsed AI response:', parsed);
    
    // Validate and clean the response
    const cleanedResponse = {
      firstStep: {
        description: parsed.firstStep?.description || "Start working on your goal",
        estimatedSeconds: parsed.firstStep?.estimatedSeconds || 60
      },
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.filter(action => 
        typeof action === 'string' && action.trim().length > 0
      ) : ["Continue with the next logical step"],
      bufferRecommendation: parsed.bufferRecommendation,
      fallbackUsed: false
    };
    
    // Ensure we have at least one next action
    if (cleanedResponse.nextActions.length === 0) {
      cleanedResponse.nextActions = ["Continue with the next logical step"];
    }
    
    console.log('Cleaned AI response:', cleanedResponse);
    return cleanedResponse;
  } catch (parseError) {
    console.log('JSON parsing failed, trying text extraction. Error:', parseError);
    // If JSON parsing fails, try to extract from structured text
    const lines = text.split('\n').filter(line => line.trim());
    
    let firstStep = "Start working on your goal";
    let nextActions: string[] = [];
    
    // Look for first step
    const firstStepMatch = text.match(/(?:first step|start with|begin by)[:\-\s]*(.+?)(?:\n|$)/i);
    if (firstStepMatch) {
      firstStep = firstStepMatch[1].trim();
    }
    
    // Look for next actions (numbered lists, bullet points, etc.)
    const actionMatches = text.match(/(?:next|then|after)[:\-\s]*(.+?)(?:\n|$)/gi);
    if (actionMatches) {
      nextActions = actionMatches.map(match => 
        match.replace(/(?:next|then|after)[:\-\s]*/i, '').trim()
      ).slice(0, 5);
    }
    
    if (nextActions.length === 0) {
      nextActions = ["Continue with the next logical step"];
    }
    
    return {
      firstStep: {
        description: firstStep,
        estimatedSeconds: 60
      },
      nextActions,
      fallbackUsed: false
    };
  }
}

function createPrompt(request: SuggestRequest): string {
  const urgencyContext = request.urgency === 'high' ? 'This is urgent. ' : '';
  const dueDateContext = request.dueDate ? `Due: ${request.dueDate}. ` : '';
  
  return `${urgencyContext}${dueDateContext}Help an ADHD user start this goal: "${request.goal}"

Please respond with a JSON object containing:
1. "firstStep": An object with "description" (a specific 60-second micro-task to start immediately) and "estimatedSeconds" (should be 60)
2. "nextActions": An array of 3-5 concrete next steps they can take after the first step
3. "bufferRecommendation": Optional number (percentage) if you think they need extra time

The first step should be:
- Extremely specific and actionable
- Completable in 60 seconds or less
- Designed to overcome task paralysis
- Not overwhelming

Example response:
{
  "firstStep": {
    "description": "Open your text editor and create a new file called 'outline.txt'",
    "estimatedSeconds": 60
  },
  "nextActions": [
    "Write down 3 main points you want to cover",
    "Research the first point for 10 minutes",
    "Draft one paragraph about the first point",
    "Review and edit what you've written"
  ],
  "bufferRecommendation": 25
}`;
}

function getRandomFallback(): SuggestResponse {
  return STATIC_FALLBACKS[Math.floor(Math.random() * STATIC_FALLBACKS.length)];
}

async function storeSuggestion(
  taskId: string, 
  userId: string | null, 
  response: SuggestResponse
): Promise<void> {
  if (!userId) return; // Skip storage if no user is authenticated
  
  try {
    const supabase = createServerClient();
    
    const { error } = await supabase
      .from('suggestions')
      .insert({
        task_id: taskId,
        user_id: userId,
        first_step: response.firstStep,
        next_actions: response.nextActions,
        buffer_recommendation: response.bufferRecommendation,
        fallback_used: response.fallbackUsed || false
      });
    
    if (error) {
      console.warn('Failed to store suggestion:', error);
    }
  } catch (error) {
    console.warn('Error storing suggestion:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestRequest = await request.json();
    
    // Validate request
    if (!body.goal || typeof body.goal !== 'string' || body.goal.trim().length === 0) {
      return NextResponse.json(
        { error: 'Goal is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    let taskId: string | null = null;
    let userId: string | null = null;
    
    // Get current user (optional - app works without auth)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (error) {
      // Ignore auth errors - app works without login
      console.log('No authenticated user, continuing without auth');
    }
    
    // Create task record if user is authenticated
    if (userId) {
      try {
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            goal: body.goal.trim(),
            due_date: body.dueDate || null,
            urgency: body.urgency || 'medium'
          })
          .select('id')
          .single();
        
        if (!taskError && taskData) {
          taskId = taskData.id;
        }
      } catch (error) {
        console.warn('Failed to create task record:', error);
      }
    }
    
    const prompt = createPrompt(body);
    let response: SuggestResponse;
    
    // Try Gemini Flash first
    try {
      response = await callGeminiFlash(prompt);
    } catch (flashError) {
      console.warn('Gemini Flash failed:', flashError);
      
      // Fallback to Gemini Flash-Lite
      try {
        response = await callGeminiFlashLite(prompt);
      } catch (liteError) {
        console.warn('Gemini Flash-Lite failed:', liteError);
        
        // Final fallback to static suggestions
        response = getRandomFallback();
      }
    }
    
    // Store suggestion in database if we have a task ID
    if (taskId && userId) {
      await storeSuggestion(taskId, userId, response);
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API error:', error);
    
    // Return static fallback on any error
    const fallback = getRandomFallback();
    return NextResponse.json(fallback);
  }
}