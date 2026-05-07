import React, { useState, useMemo } from 'react';
import { computeBalance, formatAmount, simpleInterest } from './calculator.js';
import { exportCSV } from './export-csv.js';
import { seedTransactions } from './seed.js';

export default function App() {
  const [transactions, setTransactions] = useState(seedTransactions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', amount: '', type: 'debit', category: 'autre' });

  const balance = useMemo(() => computeBalance(transactions), [transactions]);
  const totalDebit = useMemo(
    () => transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const totalCredit = useMemo(
    () => transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const monthlyInterestPreview = useMemo(
    () => simpleInterest(balance > 0 ? balance : 0, 3.5, 1 / 12),
    [balance],
  );

  function handleExportCSV() {
    const now = new Date();
    const csv = exportCSV(transactions, now);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAdd() {
    if (!form.label || !form.amount) return;
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString(),
      label: form.label,
      amount: parseFloat(form.amount),
      type: form.type,
      currency: 'EUR',
      category: form.category,
    };
    setTransactions([newTx, ...transactions]);
    setForm({ label: '', amount: '', type: 'debit', category: 'autre' });
    setShowForm(false);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo">F</span>
          <span className="brand-name">FinTrack</span>
        </div>
        <span className="tag">v0.1.0 · starter</span>
      </header>

      <main className="main">
        <section className="cards">
          <article className="card card-balance">
            <span className="card-label">Solde</span>
            <span className="card-value">{formatAmount(balance, 'EUR')}</span>
          </article>
          <article className="card">
            <span className="card-label">Crédits du mois</span>
            <span className="card-value card-credit">+ {formatAmount(totalCredit, 'EUR')}</span>
          </article>
          <article className="card">
            <span className="card-label">Débits du mois</span>
            <span className="card-value card-debit">- {formatAmount(totalDebit, 'EUR')}</span>
          </article>
          <article className="card">
            <span className="card-label">Intérêts estimés (1 mois)</span>
            <span className="card-value">{formatAmount(monthlyInterestPreview, 'EUR')}</span>
          </article>
        </section>

        <section className="actions">
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Annuler' : 'Ajouter une transaction'}
          </button>
          <button className="btn btn-ghost" onClick={handleExportCSV}>
            Exporter en CSV
          </button>
        </section>

        {showForm && (
          <section className="form">
            <div className="form-row">
              <label htmlFor="label">Libellé</label>
              <input
                id="label"
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="ex: Courses Carrefour"
              />
            </div>
            <div className="form-row">
              <label htmlFor="amount">Montant</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="ex: 42.50"
              />
            </div>
            <div className="form-row">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="debit">Débit</option>
                <option value="credit">Crédit</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="category">Catégorie</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="logement">Logement</option>
                <option value="alimentation">Alimentation</option>
                <option value="transport">Transport</option>
                <option value="loisirs">Loisirs</option>
                <option value="revenu">Revenu</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              Valider
            </button>
          </section>
        )}

        <section className="list">
          <h2>Transactions</h2>
          <ul data-testid="transaction-list">
            {' '}
            {/* ajout d'une transaction */}
            {transactions.map((tx) => (
              <li key={tx.id} className="tx">
                <span className="tx-date">{new Date(tx.date).toLocaleDateString('fr-FR')}</span>
                <span className="tx-label">{tx.label}</span>
                <span className={`tx-cat tx-cat-${tx.category}`}>{tx.category}</span>
                <span className={`tx-amount tx-${tx.type}`}>
                  {tx.type === 'credit' ? '+' : '-'} {formatAmount(tx.amount, 'EUR')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">FinTrack starter · Mission qualité B3 Dev</footer>
    </div>
  );
}
