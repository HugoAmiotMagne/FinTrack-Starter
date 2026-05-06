const HEADER = 'date,label,amount,category';

function toLine(tx) {
  return `${tx.date},${tx.label},${tx.amount},${tx.category}`;
}

export function exportCSV(transactions, now = new Date()) {
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  return [HEADER, ...filteredTransactions.map(toLine)].join('\n');
}
