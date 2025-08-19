// Simple test file to verify the AI suggest API
// This can be run manually to test the endpoint

import { SuggestRequest } from '@/types';

const testRequest: SuggestRequest = {
  goal: "Write a blog post about productivity tips",
  urgency: "medium"
};

async function testAISuggestAPI() {
  try {
    const response = await fetch('/api/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Suggest API Response:', data);
    
    // Verify response structure
    if (data.firstStep && data.nextActions) {
      console.log('✅ API response has correct structure');
      console.log('First Step:', data.firstStep.description);
      console.log('Next Actions:', data.nextActions);
      console.log('Fallback Used:', data.fallbackUsed || false);
    } else {
      console.log('❌ API response missing required fields');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for manual testing
export { testAISuggestAPI };