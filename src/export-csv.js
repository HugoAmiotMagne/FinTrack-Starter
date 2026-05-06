const HEADER = 'date,label,amount,category';

function escapeField(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toLine(tx) {
  return [tx.date, tx.label, tx.amount, tx.category].map(escapeField).join(',');
}

function isSameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function exportCSV(transactions, now = new Date()) {
  const lines = transactions.filter((tx) => isSameMonth(tx.date, now)).map(toLine);
  return [HEADER, ...lines].join('\n');
}
