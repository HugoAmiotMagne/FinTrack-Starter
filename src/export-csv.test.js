import { exportCSV } from './export-csv.js';

describe('exportCSV', () => {
  // 1) Ligne d'en-tête CSV
  it("retourne une ligne d'en-tête CSV", () => {
    expect(exportCSV([])).toBe('date,label,amount,category');
  });

  // 2) Ligne CSV pour une transaction
  it('convertit une transaction en ligne CSV', () => {
    const txs = [{ date: '2024-01-15', label: 'Courses', amount: 42.5, category: 'Alimentation' }];
    expect(exportCSV(txs)).toBe('date,label,amount,category\n2024-01-15,Courses,42.5,Alimentation');
  });

  // 3) Filtrage par mois en cours
  it('exclut les transactions hors du mois en cours', () => {
    const now = new Date('2024-01-15');
    const txs = [
      { date: '2024-01-10', label: 'Ce mois', amount: 10, category: 'A' },
      { date: '2023-12-31', label: 'Mois précédent', amount: 20, category: 'B' },
    ];
    expect(exportCSV(txs, now)).toBe('date,label,amount,category\n2024-01-10,Ce mois,10,A');
  });

  // 4) Échappement RFC 4180
  it('échappe les virgules selon RFC 4180', () => {
    const now = new Date('2024-01-15');
    const txs = [{ date: '2024-01-10', label: 'Café, croissant', amount: 5, category: 'Food' }];
    expect(exportCSV(txs, now)).toBe(
      'date,label,amount,category\n2024-01-10,"Café, croissant",5,Food',
    );
  });
  it('échappe les guillemets selon RFC 4180', () => {
    const now = new Date('2024-01-15');
    const txs = [
      { date: '2024-01-10', label: 'Achat "premium"', amount: 15, category: 'Shopping' },
    ];
    expect(exportCSV(txs, now)).toBe(
      'date,label,amount,category\n2024-01-10,"Achat ""premium""",15,Shopping',
    );
  });
});
