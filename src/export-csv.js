const FIELDS = ['date', 'label', 'amount', 'category'];
const HEADER = FIELDS.join(',');

function escapeField(value) {
  const str = String(value);
  if (/[,"\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toLine(tx) {
  return FIELDS.map((f) => escapeField(tx[f])).join(',');
}

function isSameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function exportCSV(transactions, now = new Date()) {
  if (!Array.isArray(transactions)) throw new TypeError('exportCSV: transactions must be an array');
  const lines = transactions.filter((tx) => isSameMonth(tx.date, now)).map(toLine);
  return [HEADER, ...lines].join('\n');
}
