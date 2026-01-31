const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value)
}

export function validateEmail(value: string): string | null {
  if (!value || !value.trim()) return 'Email is required'
  if (!isValidEmail(value.trim())) return 'Email is invalid'
  return null
}
