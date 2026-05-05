import { add, subtract, multiply, divide, modulo, simpleInterest } from './calculator.js';

describe('add', () => {
  it('retourne 5 quand on additionne 2 et 3', () => {
    expect(add(2, 3)).toBe(5);
  });
});

// soustraction
describe('subtract', () => {
  it('retourne 2 quand on soustrait 3 de 5', () => {
    expect(subtract(5, 3)).toBe(2);
  });
  it('retourne un nombre négatif quand b est supérieur à a', () => {
    expect(subtract(3, 5)).toBe(-2);
  });
});

// multiplication
describe('multiply', () => {
  it('retourne 12 pour 3 × 4', () => {
    expect(multiply(3, 4)).toBe(12);
  });
  it('retourne 0 quand un des facteurs est 0', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});

// division
describe('divide', () => {
  it('retourne 5 pour 10 ÷ 2', () => {
    expect(divide(10, 2)).toBe(5);
  });
});

// modulo
describe('modulo', () => {
  it('retourne 1 pour 10 % 3', () => {
    expect(modulo(10, 3)).toBe(1);
  });
});

// intérêts simples
describe('simpleInterest', () => {
  it('retourne 0 pour un taux de 0 %', () => {
    expect(simpleInterest(1000, 0, 5)).toBe(0);
  });
});
