import { exportCSV } from './export-csv.js';

describe('exportCSV', () => {
  // 1
  it("retourne une ligne d'en-tête CSV", () => {
    expect(exportCSV([])).toBe('date,label,amount,category');
  });
  // 2
  it('convertit une transaction en ligne CSV', () => {
    const txs = [{ date: '2024-01-15', label: 'Courses', amount: 42.5, category: 'Alimentation' }];
    expect(exportCSV(txs)).toBe('date,label,amount,category\n2024-01-15,Courses,42.5,Alimentation');
  });
});
