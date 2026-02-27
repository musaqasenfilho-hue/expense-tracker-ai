import { formatCurrency, centsToDisplay, displayToCents, formatDate } from '@/lib/format'

describe('formatCurrency', () => {
  it('formats cents as USD currency string', () => {
    // Regression guard for locale formatting and thousand separators.
    expect(formatCurrency(1250)).toBe('$12.50')
    expect(formatCurrency(100000)).toBe('$1,000.00')
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('centsToDisplay', () => {
  it('converts cents to decimal string for form input', () => {
    expect(centsToDisplay(1250)).toBe('12.50')
    expect(centsToDisplay(100)).toBe('1.00')
  })
})

describe('displayToCents', () => {
  it('converts decimal string to cents integer', () => {
    expect(displayToCents('12.50')).toBe(1250)
    expect(displayToCents('12')).toBe(1200)
    expect(displayToCents('0.99')).toBe(99)
  })

  it('returns NaN for invalid input', () => {
    expect(displayToCents('abc')).toBeNaN()
  })
})

describe('formatDate', () => {
  it('formats YYYY-MM-DD to readable string', () => {
    expect(formatDate('2026-02-27')).toBe('Feb 27, 2026')
  })
})
