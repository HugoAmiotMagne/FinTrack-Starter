import { reverse } from './string-utils.js';

test('reverse "abc" returns "cba"', () => {
  expect(reverse('abc')).toBe('cba');
});

test('reverse "" returns ""', () => {
  expect(reverse('')).toBe('');
});

test('reverse(null) throws an explicit error', () => {
  expect(() => reverse(null)).toThrow('reverse: argument must be a string');
});
