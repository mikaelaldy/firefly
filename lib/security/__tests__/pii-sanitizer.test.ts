import { describe, it, expect } from 'vitest';
import { sanitizePII, isTextSafeForAI, prepareGoalForAI } from '../pii-sanitizer';

describe('PII Sanitizer', () => {
  describe('sanitizePII', () => {
    it('should detect and mask email addresses', () => {
      const result = sanitizePII('Contact john.doe@company.com for details');
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('email');
      expect(result.sanitizedText).toMatch(/Contact j.*e@company\.com for details/);
      expect(result.sanitizedText).not.toContain('john.doe');
    });

    it('should detect and mask phone numbers', () => {
      const result = sanitizePII('Call me at (555) 123-4567');
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('phone');
      expect(result.sanitizedText).toContain('***-***-4567');
      expect(result.sanitizedText).not.toContain('555');
    });

    it('should handle multiple PII types in one text', () => {
      const result = sanitizePII('Email john@test.com or call (555) 123-4567');
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('email');
      expect(result.piiTypes).toContain('phone');
      expect(result.sanitizedText).toContain('***-***-4567');
      expect(result.sanitizedText).toMatch(/j.*@test\.com/);
    });

    it('should return clean text unchanged', () => {
      const cleanText = 'Write a blog post about productivity';
      const result = sanitizePII(cleanText);
      
      expect(result.piiFound).toBe(false);
      expect(result.piiTypes).toHaveLength(0);
      expect(result.sanitizedText).toBe(cleanText);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizePII('').sanitizedText).toBe('');
      expect(sanitizePII(null as any).sanitizedText).toBe('');
      expect(sanitizePII(undefined as any).sanitizedText).toBe('');
    });
  });

  describe('isTextSafeForAI', () => {
    it('should return false for text with PII', () => {
      expect(isTextSafeForAI('Email me at john@example.com')).toBe(false);
      expect(isTextSafeForAI('Call (555) 123-4567')).toBe(false);
    });

    it('should return true for clean text', () => {
      expect(isTextSafeForAI('Write a blog post')).toBe(true);
      expect(isTextSafeForAI('Clean my desk and organize papers')).toBe(true);
    });
  });

  describe('prepareGoalForAI', () => {
    it('should sanitize PII and return safe text', () => {
      const goal = 'Email john.doe@company.com about the project timeline';
      const safeGoal = prepareGoalForAI(goal);
      
      expect(safeGoal).not.toContain('john.doe');
      expect(safeGoal).toContain('about the project timeline');
      expect(safeGoal).toMatch(/Email j.*e@company\.com/);
    });

    it('should pass through clean goals unchanged', () => {
      const cleanGoal = 'Write a comprehensive project proposal';
      const result = prepareGoalForAI(cleanGoal);
      
      expect(result).toBe(cleanGoal);
    });
  });
});