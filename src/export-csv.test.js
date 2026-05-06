import { exportCSV } from './export-csv.js';

describe('exportCSV', () => {
  it("retourne une ligne d'en-tête CSV", () => {
    expect(exportCSV([])).toBe('date,label,amount,category');
  });
});
