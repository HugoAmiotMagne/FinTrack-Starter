// FinTrack — Moteur de calcul financier
//
// Ce module contient les fonctions de calcul utilisées par l'application.
// Il est volontairement laissé sans tests : c'est le coeur de la mission de J1.
//
// ⚠ Plusieurs bugs latents existent dans ce fichier. Une bonne suite de tests
//   unitaires doit permettre de les détecter.

/**
 * Additionne deux nombres.
 */
export function add(a, b) {
  return a + b;
}

/**
 * Soustrait b de a.
 */
export function subtract(a, b) {
  return a - b;
}

/**
 * Multiplie deux nombres.
 */
export function multiply(a, b) {
  return a * b;
}

/**
 * Divise a par b.
 * BUG LATENT : ne gère pas la division par zéro (retourne Infinity ou NaN).
 */
export function divide(a, b) {
  if (b === 0) throw new Error('Division par zéro impossible');
  return a / b;
}

/**
 * Modulo de a par b.
 */
export function modulo(a, b) {
  if (b === 0) throw new Error('Modulo par zéro impossible');
  return a % b;
}

/**
 * Calcule un intérêt simple.
 *   principal : capital initial
 *   rate      : taux annuel en pourcentage (ex: 3.5 pour 3.5%)
 *   years     : durée en années
 *
 * Formule attendue : principal * (rate / 100) * years
 *
 * BUG LATENT : la division par 100 est manquante, le taux est traité
 *              comme un coefficient décimal au lieu d'un pourcentage.
 */
export function simpleInterest(principal, rate, years) {
  return principal * (rate / 100) * years;
}

/**
 * Calcule un intérêt composé.
 *   principal : capital initial
 *   rate      : taux annuel en pourcentage
 *   years     : durée en années
 *
 * Formule attendue : principal * (1 + rate/100)^years - principal
 */
export function compoundInterest(principal, rate, years) {
  return principal * Math.pow(1 + rate / 100, years) - principal;
}

/**
 * Convertit un montant d'une devise vers une autre via un taux fourni.
 * BUG LATENT : ne valide pas que le rate est positif.
 */
export function convertCurrency(amount, rate) {
  if (rate <= 0) throw new Error('Le taux de change doit être positif');
  return amount * rate;
}

/**
 * Calcule le solde total d'une liste de transactions.
 * Une transaction est { amount: number, type: 'credit' | 'debit' }.
 *
 * BUG LATENT : ne gère pas le cas où le tableau est vide ou null.
 */
export function computeBalance(transactions) {
  if (transactions == null) throw new Error('transactions ne peut pas être null');
  let balance = 0;
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (tx.type === 'credit') {
      balance += tx.amount;
    } else {
      balance -= tx.amount;
    }
  }
  return balance;
}

/**
 * Formate un montant en chaîne avec deux décimales et le symbole de la devise.
 */
export function formatAmount(amount, currency = 'EUR') {
  const symbols = { EUR: '€', USD: '$', GBP: '£' };
  const symbol = symbols[currency] || currency;
  return amount.toFixed(2) + ' ' + symbol;
}

/**
 * Calcule l'intérêt simple cumulé depuis un timestamp de départ jusqu'à aujourd'hui.
 *   principal      : capital initial
 *   rate           : taux annuel en pourcentage
 *   startTimestamp : timestamp de départ en millisecondes (ex: Date.now())
 *
 * Dépend de Date.now() pour obtenir la date courante.
 */
export function accruedInterest(principal, rate, startTimestamp) {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const years = (Date.now() - startTimestamp) / msPerYear;
  return simpleInterest(principal, rate, years);
}
