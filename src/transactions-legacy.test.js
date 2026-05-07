import { processTransactions } from './transactions-legacy.js';

// Fabrique une transaction dans le mois courant
function makeTx(overrides) {
  return {
    id: 1,
    date: new Date().toISOString(),
    label: 'Test',
    amount: 100,
    type: 'debit',
    currency: 'EUR',
    ...overrides,
  };
}

const now = new Date();
const OPTS = { month: now.getMonth(), year: now.getFullYear() };

// ─────────────────────────────────────────────
// Zone 1 — Conversion de devise
// ─────────────────────────────────────────────
describe('processTransactions — conversion de devise', () => {
  test('convertit USD → EUR avec le taux 0.92', () => {
    const { transactions } = processTransactions([makeTx({ amount: 100, currency: 'USD' })], OPTS);
    expect(transactions[0].amount).toBeCloseTo(92, 2);
    expect(transactions[0].currency).toBe('EUR');
    expect(transactions[0].originalCurrency).toBe('USD');
    expect(transactions[0].originalAmount).toBe(100);
  });

  test('convertit GBP → EUR avec le taux 1.17', () => {
    const { transactions } = processTransactions([makeTx({ amount: 100, currency: 'GBP' })], OPTS);
    expect(transactions[0].amount).toBeCloseTo(117, 2);
  });

  test('ne convertit pas une transaction déjà en EUR', () => {
    const { transactions } = processTransactions([makeTx({ amount: 50, currency: 'EUR' })], OPTS);
    expect(transactions[0].amount).toBe(50);
  });

  test('applique le taux 1 pour une devise inconnue (fallback silencieux)', () => {
    const { transactions } = processTransactions([makeTx({ amount: 200, currency: 'JPY' })], OPTS);
    // comportement actuel : rate = 1, aucune erreur générée
    expect(transactions[0].amount).toBe(200);
    expect(transactions[0].originalCurrency).toBe('JPY');
  });

  test('le total reflète le montant converti', () => {
    const { total } = processTransactions(
      [makeTx({ amount: 100, currency: 'USD', type: 'debit' })],
      OPTS,
    );
    expect(total).toBeCloseTo(-92, 2);
  });
});

// ─────────────────────────────────────────────
// Zone 2 — Catégorisation par libellé
// ─────────────────────────────────────────────
describe('processTransactions — catégorisation par libellé', () => {
  test('"Loyer appartement" → logement', () => {
    const { transactions } = processTransactions([makeTx({ label: 'Loyer appartement' })], OPTS);
    expect(transactions[0].category).toBe('logement');
  });

  test('"Courses Carrefour" → alimentation', () => {
    const { transactions } = processTransactions([makeTx({ label: 'Courses Carrefour' })], OPTS);
    expect(transactions[0].category).toBe('alimentation');
  });

  test('"Uber trajet" → transport', () => {
    const { transactions } = processTransactions([makeTx({ label: 'Uber trajet' })], OPTS);
    expect(transactions[0].category).toBe('transport');
  });

  test('"Netflix abonnement" → loisirs', () => {
    const { transactions } = processTransactions([makeTx({ label: 'Netflix abonnement' })], OPTS);
    expect(transactions[0].category).toBe('loisirs');
  });

  test('"Salaire mai" → revenu', () => {
    const { transactions } = processTransactions(
      [makeTx({ label: 'Salaire mai', type: 'credit' })],
      OPTS,
    );
    expect(transactions[0].category).toBe('revenu');
  });

  test('"Dentiste" → autre (aucun mot-clé reconnu)', () => {
    const { transactions } = processTransactions([makeTx({ label: 'Dentiste' })], OPTS);
    expect(transactions[0].category).toBe('autre');
  });

  test('libellé absent → autre', () => {
    const { transactions } = processTransactions([makeTx({ label: undefined })], OPTS);
    expect(transactions[0].category).toBe('autre');
  });
});
