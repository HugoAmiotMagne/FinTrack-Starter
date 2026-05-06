const HEADER = 'date,label,amount,category';

export function exportCSV(transactions) {
  const lines = transactions.map((tx) => `${tx.date},${tx.label},${tx.amount},${tx.category}`);
  return [HEADER, ...lines].join('\n');
}
