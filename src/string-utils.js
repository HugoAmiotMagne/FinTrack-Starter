export function reverse(str) {
  if (typeof str !== 'string') throw new TypeError('reverse: argument must be a string');
  return str.split('').reverse().join('');
}
