/**
 * PII Sanitization Utility
 * Removes or masks personally identifiable information from text before sending to AI services
 */

// Common PII patterns
const PII_PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (various formats)
  phone: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  
  // Social Security Numbers
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  
  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  
  // URLs that might contain personal info
  personalUrls: /https?:\/\/[^\s]*(?:profile|user|account|personal)[^\s]*/gi,
  
  // Common personal identifiers in text
  personalNames: /\b(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  
  // Addresses (basic pattern)
  addresses: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
  
  // IP addresses
  ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
};

export interface SanitizationResult {
  sanitizedText: string;
  piiFound: boolean;
  piiTypes: string[];
}

/**
 * Sanitizes text by removing or masking PII
 * @param text - The text to sanitize
 * @param maskingChar - Character to use for masking (default: '*')
 * @returns Sanitized text and metadata about what was found
 */
export function sanitizePII(text: string, maskingChar: string = '*'): SanitizationResult {
  if (!text || typeof text !== 'string') {
    return {
      sanitizedText: '',
      piiFound: false,
      piiTypes: []
    };
  }

  let sanitizedText = text;
  const piiTypes: string[] = [];
  let piiFound = false;

  // Process each PII pattern
  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    const matches = sanitizedText.match(pattern);
    if (matches && matches.length > 0) {
      piiFound = true;
      piiTypes.push(type);
      
      // Replace with masked version
      sanitizedText = sanitizedText.replace(pattern, (match) => {
        // For emails and phones, show partial info
        if (type === 'email') {
          const [local, domain] = match.split('@');
          return `${local.charAt(0)}${maskingChar.repeat(Math.max(1, local.length - 2))}${local.charAt(local.length - 1)}@${domain}`;
        }
        
        if (type === 'phone') {
          return `${maskingChar.repeat(3)}-${maskingChar.repeat(3)}-${match.slice(-4)}`;
        }
        
        // For other types, mask completely but preserve length
        return maskingChar.repeat(Math.min(match.length, 10));
      });
    }
  });

  return {
    sanitizedText,
    piiFound,
    piiTypes
  };
}

/**
 * Validates that text is safe to send to AI services
 * @param text - Text to validate
 * @returns True if text appears safe, false if PII detected
 */
export function isTextSafeForAI(text: string): boolean {
  const result = sanitizePII(text);
  return !result.piiFound;
}

/**
 * Prepares goal text for AI processing by sanitizing PII
 * @param goalText - The user's goal text
 * @returns Sanitized goal text safe for AI processing
 */
export function prepareGoalForAI(goalText: string): string {
  const result = sanitizePII(goalText);
  
  // Log PII detection for monitoring (without logging the actual PII)
  if (result.piiFound) {
    console.warn('PII detected and sanitized before AI processing:', {
      piiTypes: result.piiTypes,
      originalLength: goalText.length,
      sanitizedLength: result.sanitizedText.length
    });
  }
  
  return result.sanitizedText;
}