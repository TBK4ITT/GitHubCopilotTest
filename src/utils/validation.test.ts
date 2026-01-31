import { describe, expect, it } from 'vitest'
import { isValidEmail, validateEmail } from './validation'

describe('validation', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('a@b.co')).toBe(true)
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user+tag@domain.org')).toBe(true)
    })
    it('returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('bad')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('returns error for empty or invalid email', () => {
      expect(validateEmail('')).toBe('Email is required')
      expect(validateEmail('   ')).toBe('Email is required')
      expect(validateEmail('bad')).toBe('Email is invalid')
    })
    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(null)
      expect(validateEmail('  a@b.co  ')).toBe(null)
    })
  })
})
