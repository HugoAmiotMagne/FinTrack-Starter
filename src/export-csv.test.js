import { exportCSV } from './export-csv.js';

describe('exportCSV', () => {
  it('given an empty list, when exporting, then returns only the header', () => {
    expect(exportCSV([])).toBe('date,label,amount,category');
  });

  it('given a transaction in current month, when exporting, then returns a CSV line', () => {
    const now = new Date('2024-01-15');
    const txs = [{ date: '2024-01-15', label: 'Courses', amount: 42.5, category: 'Alimentation' }];
    expect(exportCSV(txs, now)).toBe(
      'date,label,amount,category\n2024-01-15,Courses,42.5,Alimentation',
    );
  });

  it('given transactions from two months, when exporting in january, then excludes december transactions', () => {
    const now = new Date('2024-01-15');
    const txs = [
      { date: '2024-01-10', label: 'Ce mois', amount: 10, category: 'A' },
      { date: '2023-12-31', label: 'Mois précédent', amount: 20, category: 'B' },
    ];
    expect(exportCSV(txs, now)).toBe('date,label,amount,category\n2024-01-10,Ce mois,10,A');
  });

  it('given a label with a comma, when exporting, then wraps the field in double quotes', () => {
    const now = new Date('2024-01-15');
    const txs = [{ date: '2024-01-10', label: 'Café, croissant', amount: 5, category: 'Food' }];
    expect(exportCSV(txs, now)).toBe(
      'date,label,amount,category\n2024-01-10,"Café, croissant",5,Food',
    );
  });

  it('given a label with double quotes, when exporting, then doubles the quotes per RFC 4180', () => {
    const now = new Date('2024-01-15');
    const txs = [
      { date: '2024-01-10', label: 'Achat "premium"', amount: 15, category: 'Shopping' },
    ];
    expect(exportCSV(txs, now)).toBe(
      'date,label,amount,category\n2024-01-10,"Achat ""premium""",15,Shopping',
    );
  });

  it('given null instead of an array, when exporting, then throws an explicit error', () => {
    expect(() => exportCSV(null)).toThrow('exportCSV: transactions must be an array');
  });
});
