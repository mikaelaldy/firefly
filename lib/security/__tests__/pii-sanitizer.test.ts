import { describe, it, expect } from 'vitest';
import { sanitizePII, isTextSafeForAI, prepareGoalForAI } from '../pii-sanitizer';

describe('PII Sanitizer', () => {
  describe('sanitizePII', () => {
    it('should detect and sanitize email addresses', () => {
      const text = 'Contact me at john.doe@example.com for updates';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('email');
      expect(result.sanitizedText).toContain('j******e@example.com');
      expect(result.sanitizedText).not.toContain('john.doe@example.com');
    });

    it('should detect and sanitize phone numbers', () => {
      const text = 'Call me at (555) 123-4567 or 555-987-6543';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('phone');
      expect(result.sanitizedText).toContain('***-***-4567');
      expect(result.sanitizedText).toContain('***-***-6543');
    });

    it('should detect and sanitize SSN', () => {
      const text = 'My SSN is 123-45-6789';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('ssn');
      expect(result.sanitizedText).not.toContain('123-45-6789');
    });

    it('should detect and sanitize credit card numbers', () => {
      const text = 'My card number is 4532 1234 5678 9012';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('creditCard');
      expect(result.sanitizedText).not.toContain('4532 1234 5678 9012');
    });

    it('should detect and sanitize personal names in introductions', () => {
      const text = 'Hi, my name is John Smith and I need help';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('personalNames');
      expect(result.sanitizedText).not.toContain('John Smith');
    });

    it('should detect and sanitize addresses', () => {
      const text = 'I live at 123 Main Street, Anytown';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('addresses');
      expect(result.sanitizedText).not.toContain('123 Main Street');
    });

    it('should detect and sanitize IP addresses', () => {
      const text = 'Server is at 192.168.1.100';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('ipAddress');
      expect(result.sanitizedText).not.toContain('192.168.1.100');
    });

    it('should handle text with no PII', () => {
      const text = 'I want to finish my project report today';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(false);
      expect(result.piiTypes).toHaveLength(0);
      expect(result.sanitizedText).toBe(text);
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizePII('').sanitizedText).toBe('');
      expect(sanitizePII(null as any).sanitizedText).toBe('');
      expect(sanitizePII(undefined as any).sanitizedText).toBe('');
    });

    it('should handle multiple PII types in one text', () => {
      const text = 'My name is John Doe, contact me at john@example.com or call (555) 123-4567';
      const result = sanitizePII(text);
      
      expect(result.piiFound).toBe(true);
      expect(result.piiTypes).toContain('email');
      expect(result.piiTypes).toContain('phone');
      expect(result.piiTypes).toContain('personalNames');
      expect(result.sanitizedText).not.toContain('john@example.com');
      expect(result.sanitizedText).not.toContain('(555) 123-4567');
      expect(result.sanitizedText).not.toContain('John Doe');
    });
  });

  describe('isTextSafeForAI', () => {
    it('should return false for text with PII', () => {
      expect(isTextSafeForAI('Contact me at john@example.com')).toBe(false);
      expect(isTextSafeForAI('Call me at (555) 123-4567')).toBe(false);
      expect(isTextSafeForAI('My name is John Smith')).toBe(false);
    });

    it('should return true for text without PII', () => {
      expect(isTextSafeForAI('I want to finish my project')).toBe(true);
      expect(isTextSafeForAI('Help me organize my tasks')).toBe(true);
      expect(isTextSafeForAI('Write a report about productivity')).toBe(true);
    });
  });

  describe('prepareGoalForAI', () => {
    it('should sanitize PII from goal text', () => {
      const goal = 'Email john@example.com about the project deadline';
      const sanitized = prepareGoalForAI(goal);
      
      expect(sanitized).not.toContain('john@example.com');
      expect(sanitized).toContain('j**n@example.com');
    });

    it('should preserve non-PII goal text', () => {
      const goal = 'Finish writing my research paper on productivity';
      const sanitized = prepareGoalForAI(goal);
      
      expect(sanitized).toBe(goal);
    });

    it('should handle edge cases', () => {
      expect(prepareGoalForAI('')).toBe('');
      expect(prepareGoalForAI('   ')).toBe('   ');
    });
  });
});