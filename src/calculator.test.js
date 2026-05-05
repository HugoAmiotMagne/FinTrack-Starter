import { jest } from '@jest/globals';
import {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  simpleInterest,
  compoundInterest,
  convertCurrency,
  computeBalance,
  formatAmount,
  accruedInterest,
} from './calculator.js';

describe('add', () => {
  it('fonctionne avec Number.MAX_SAFE_INTEGER', () => {
    expect(add(Number.MAX_SAFE_INTEGER - 1, 1)).toBe(Number.MAX_SAFE_INTEGER);
  });
  it('retourne NaN pour une entrée non numérique', () => {
    expect(add(NaN, 1)).toBeNaN();
  });
});

describe('subtract', () => {
  it('retourne un nombre négatif quand b est supérieur à a', () => {
    expect(subtract(3, 5)).toBe(-2);
  });
  it('retourne NaN pour une entrée non numérique', () => {
    expect(subtract(NaN, 1)).toBeNaN();
  });
});

describe('multiply', () => {
  it('retourne 0 quand un des facteurs est 0', () => {
    expect(multiply(5, 0)).toBe(0);
  });
  it('retourne NaN pour une entrée non numérique', () => {
    expect(multiply(NaN, 5)).toBeNaN();
  });
});

describe('divide', () => {
  it('retourne 5 pour 10 ÷ 2', () => {
    expect(divide(10, 2)).toBe(5);
  });
  it('lève une erreur pour une division par zéro', () => {
    expect(() => divide(10, 0)).toThrow('Division par zéro impossible');
  });
});

describe('modulo', () => {
  it('retourne 1 pour 10 % 3', () => {
    expect(modulo(10, 3)).toBe(1);
  });
  it('lève une erreur pour un modulo par zéro', () => {
    expect(() => modulo(10, 0)).toThrow('Modulo par zéro impossible');
  });
});

describe('simpleInterest', () => {
  it('retourne 100 pour 1000 € à 5 % sur 2 ans', () => {
    expect(simpleInterest(1000, 5, 2)).toBe(100);
  });
  it('retourne 0 pour un capital de 0', () => {
    expect(simpleInterest(0, 10, 5)).toBe(0);
  });
});

describe('compoundInterest', () => {
  it('retourne environ 628.89 pour 1000 € à 5 % sur 10 ans', () => {
    expect(compoundInterest(1000, 5, 10)).toBeCloseTo(628.89, 1);
  });
  it('retourne 0 pour un taux de 0 %', () => {
    expect(compoundInterest(1000, 0, 10)).toBe(0);
  });
});

describe('convertCurrency', () => {
  it('convertit 100 au taux 0.92', () => {
    expect(convertCurrency(100, 0.92)).toBeCloseTo(92);
  });
  it('lève une erreur pour un taux négatif', () => {
    expect(() => convertCurrency(100, -1)).toThrow('Le taux de change doit être positif');
  });
});

describe('computeBalance', () => {
  it('calcule le solde pour une liste mixte de transactions', () => {
    const txs = [
      { type: 'credit', amount: 200 },
      { type: 'debit', amount: 50 },
    ];
    expect(computeBalance(txs)).toBe(150);
  });
  it('lève une erreur si transactions est null', () => {
    expect(() => computeBalance(null)).toThrow();
  });
});

describe('formatAmount', () => {
  it('formate 1000.50 en EUR par défaut', () => {
    expect(formatAmount(1000.5)).toBe('1000.50 €');
  });
  it('utilise le code devise pour une devise inconnue', () => {
    expect(formatAmount(100, 'JPY')).toBe('100.00 JPY');
  });
});

describe('accruedInterest', () => {
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  const startTimestamp = 1_700_000_000_000;

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(startTimestamp + MS_PER_YEAR);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('retourne 50 pour 1000 € à 5 % sur exactement 1 an écoulé', () => {
    expect(accruedInterest(1000, 5, startTimestamp)).toBeCloseTo(50, 5);
  });

  it('retourne 0 pour un taux de 0 %', () => {
    expect(accruedInterest(1000, 0, startTimestamp)).toBe(0);
  });
});

describe('isolation du mock Date.now', () => {
  it('Date.now est restauré et retourne une valeur postérieure au mock', () => {
    const mockedValue = 1_700_000_000_000 + 365.25 * 24 * 60 * 60 * 1000;
    expect(Date.now()).toBeGreaterThan(mockedValue);
  });
});
