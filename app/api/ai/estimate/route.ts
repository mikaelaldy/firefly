import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { EstimateRequest, EstimateResponse } from '@/types';

// Initialize Google AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Simple in-memory rate limiting (for development)
const requestTracker = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 requests per minute per IP (slightly higher for estimation)

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const tracker = requestTracker.get(ip);
  
  if (!tracker || now > tracker.resetTime) {
    // Reset or create new tracker
    requestTracker.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (tracker.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  tracker.count++;
  return true;
}

// Static fallback estimates for when AI fails
function generateFallbackEstimates(actions: string[]): EstimateResponse {
  const estimatedActions = actions.map(action => {
    // Simple heuristic based on action length and complexity keywords
    let estimatedMinutes = 15; // Default 15 minutes
    let confidence: 'low' | 'medium' | 'high' = 'low';
    
    const actionLower = action.toLowerCase();
    
    // Adjust based on action complexity indicators
    if (actionLower.includes('research') || actionLower.includes('analyze') || actionLower.includes('review')) {
      estimatedMinutes = 25;
    } else if (actionLower.includes('write') || actionLower.includes('create') || actionLower.includes('draft')) {
      estimatedMinutes = 20;
    } else if (actionLower.includes('organize') || actionLower.includes('plan') || actionLower.includes('outline')) {
      estimatedMinutes = 15;
    } else if (actionLower.includes('quick') || actionLower.includes('brief') || actionLower.includes('check')) {
      estimatedMinutes = 10;
    }
    
    // Adjust for action length (longer descriptions might indicate more complex tasks)
    if (action.length > 100) {
      estimatedMinutes += 5;
    } else if (action.length < 30) {
      estimatedMinutes = Math.max(10, estimatedMinutes - 5);
    }
    
    return {
      action,
      estimatedMinutes,
      confidence
    };
  });
  
  const totalEstimatedTime = estimatedActions.reduce((sum, item) => sum + item.estimatedMinutes, 0);
  
  return {
    estimatedActions,
    totalEstimatedTime
  };
}

async function callGeminiForEstimation(prompt: string): Promise<EstimateResponse> {
  // Try Gemini Flash first, then fallback to Flash-Lite
  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  } catch (error) {
    console.warn('Gemini Flash not available, using Flash-Lite:', error);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return parseEstimationResponse(text);
}

function parseEstimationResponse(text: string): EstimateResponse {
  console.log('Raw AI estimation response:', text);
  
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
    console.log('Parsed AI estimation response:', parsed);
    
    // Validate and clean the response
    const estimatedActions = Array.isArray(parsed.estimatedActions) 
      ? parsed.estimatedActions.map((item: any) => ({
          action: String(item.action || ''),
          estimatedMinutes: Math.max(5, Math.min(120, Number(item.estimatedMinutes) || 15)), // Clamp between 5-120 minutes
          confidence: ['low', 'medium', 'high'].includes(item.confidence) ? item.confidence : 'medium'
        }))
      : [];
    
    const totalEstimatedTime = estimatedActions.reduce((sum: number, item: any) => sum + item.estimatedMinutes, 0);
    
    const cleanedResponse: EstimateResponse = {
      estimatedActions,
      totalEstimatedTime
    };
    
    console.log('Cleaned AI estimation response:', cleanedResponse);
    return cleanedResponse;
  } catch (parseError) {
    console.log('JSON parsing failed for estimation, trying text extraction. Error:', parseError);
    
    // If JSON parsing fails, try to extract estimates from structured text
    const lines = text.split('\n').filter(line => line.trim());
    const estimatedActions: { action: string; estimatedMinutes: number; confidence: 'low' | 'medium' | 'high' }[] = [];
    
    // Look for patterns like "Action: 15 minutes" or "1. Task name - 20 min"
    for (const line of lines) {
      const minuteMatch = line.match(/(\d+)\s*(?:min|minute)/i);
      const actionMatch = line.match(/(?:\d+\.\s*|[-•]\s*)?(.+?)(?:\s*[-:]\s*\d+|\s*$)/);
      
      if (minuteMatch && actionMatch) {
        const minutes = Math.max(5, Math.min(120, parseInt(minuteMatch[1])));
        const action = actionMatch[1].trim();
        
        if (action.length > 3) { // Ensure we have a meaningful action
          estimatedActions.push({
            action,
            estimatedMinutes: minutes,
            confidence: 'medium'
          });
        }
      }
    }
    
    // If we couldn't extract anything meaningful, return empty array
    // The fallback will be handled by the calling function
    if (estimatedActions.length === 0) {
      throw new Error('Could not parse estimation response');
    }
    
    const totalEstimatedTime = estimatedActions.reduce((sum, item) => sum + item.estimatedMinutes, 0);
    
    return {
      estimatedActions,
      totalEstimatedTime
    };
  }
}

function createEstimationPrompt(request: EstimateRequest): string {
  const contextInfo = request.context ? `Context: ${request.context}\n\n` : '';
  
  return `${contextInfo}Please provide ADHD-friendly time estimates for these action items. Consider that ADHD users may need:
- Extra time for task switching and focus building
- Buffer time for potential hyperfocus or distraction
- Realistic estimates that account for executive function challenges
- Slightly longer estimates than neurotypical users might need

Actions to estimate:
${request.actions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

Please respond with a JSON object containing:
- "estimatedActions": An array of objects with "action" (the original action text), "estimatedMinutes" (realistic time estimate), and "confidence" (low/medium/high based on how certain you are)
- "totalEstimatedTime": Sum of all estimated minutes

Guidelines for estimates:
- Minimum 5 minutes per action (even simple tasks need transition time)
- Maximum 120 minutes per action (break down larger tasks)
- Consider cognitive load and complexity
- Account for ADHD-specific challenges like task initiation and switching
- Be realistic but not discouraging

Example response:
{
  "estimatedActions": [
    {
      "action": "Research topic online",
      "estimatedMinutes": 25,
      "confidence": "medium"
    },
    {
      "action": "Write first draft",
      "estimatedMinutes": 35,
      "confidence": "high"
    }
  ],
  "totalEstimatedTime": 60
}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body: EstimateRequest = await request.json();
    
    // Validate request
    if (!Array.isArray(body.actions) || body.actions.length === 0) {
      return NextResponse.json(
        { error: 'Actions array is required and must contain at least one action' },
        { status: 400 }
      );
    }
    
    // Validate each action is a non-empty string
    const validActions = body.actions.filter(action => 
      typeof action === 'string' && action.trim().length > 0
    );
    
    if (validActions.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid action string is required' },
        { status: 400 }
      );
    }
    
    // Limit number of actions to prevent abuse
    if (validActions.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 actions can be estimated at once' },
        { status: 400 }
      );
    }
    
    const prompt = createEstimationPrompt({ ...body, actions: validActions });
    let response: EstimateResponse;
    
    // Try AI estimation first
    try {
      response = await callGeminiForEstimation(prompt);
      
      // Validate that we got estimates for all actions
      if (response.estimatedActions.length !== validActions.length) {
        console.warn('AI returned different number of estimates than actions, using fallback');
        throw new Error('Incomplete estimation response');
      }
      
    } catch (aiError) {
      console.warn('AI estimation failed, using fallback:', aiError);
      
      // Fallback to static estimation
      response = generateFallbackEstimates(validActions);
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Estimation API error:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to estimate action times. Please try again.' },
      { status: 500 }
    );
  }
}