const HEADER = 'date,label,amount,category';

function toLine(tx) {
  return `${tx.date},${tx.label},${tx.amount},${tx.category}`;
}

export function exportCSV(transactions) {
  return [HEADER, ...transactions.map(toLine)].join('\n');
}
