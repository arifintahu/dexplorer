import { describe, it, expect } from 'vitest'
import { isValidJSON, isBech32Address } from './helper'
import { bech32 } from 'bech32'

describe('helper utils', () => {
  describe('isValidJSON', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJSON('{"a": 1}')).toBe(true)
      expect(isValidJSON('[]')).toBe(true)
      expect(isValidJSON('123')).toBe(true)
      expect(isValidJSON('"string"')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isValidJSON('{')).toBe(false)
      expect(isValidJSON('undefined')).toBe(false) // JSON.parse('undefined') throws
      expect(isValidJSON('{"a": 1,}')).toBe(false)
    })
  })

  describe('isBech32Address', () => {
    it('should return true for valid bech32 address', () => {
      // Create a valid cosmos address
      const words = bech32.toWords(new Uint8Array(20))
      const address = bech32.encode('cosmos', words)
      expect(isBech32Address(address)).toBe(true)
    })

    it('should return false for invalid address', () => {
      expect(isBech32Address('invalid')).toBe(false)
    })
  })
})
