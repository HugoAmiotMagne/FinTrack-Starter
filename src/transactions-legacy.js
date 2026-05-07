// FinTrack — Module historique de gestion des transactions
//
// ⚠ ATTENTION : Ce fichier date des débuts du projet (2019).
//   Il fonctionne mais il est devenu difficile à maintenir.
//   Personne dans l'équipe actuelle ne l'a écrit.
//
//   La direction a demandé un audit complet de ce module.
//   À toi de jouer.

// ============================================================================

var TYPES = ['credit', 'debit', 'transfer'];

var RATES = {
  'USD-EUR': 0.92,
  'EUR-USD': 1.08,
  'GBP-EUR': 1.17,
  'EUR-GBP': 0.85,
};

var DEFAULT_RATE = 1;

function convertAmount(tx, targetCurrency) {
  if (!tx.currency || tx.currency === targetCurrency) return tx.amount;
  var key = tx.currency + '-' + targetCurrency;
  var rate = RATES[key] !== undefined ? RATES[key] : DEFAULT_RATE;
  return tx.amount * rate;
}

function inferCategory(label) {
  if (!label) return 'autre';
  var lowerLabel = label.toLowerCase();
  if (lowerLabel.indexOf('loyer') >= 0 || lowerLabel.indexOf('rent') >= 0) {
    return 'logement';
  } else if (
    lowerLabel.indexOf('course') >= 0 ||
    lowerLabel.indexOf('groce') >= 0 ||
    lowerLabel.indexOf('super') >= 0
  ) {
    return 'alimentation';
  } else if (
    lowerLabel.indexOf('essence') >= 0 ||
    lowerLabel.indexOf('gas') >= 0 ||
    lowerLabel.indexOf('uber') >= 0
  ) {
    return 'transport';
  } else if (
    lowerLabel.indexOf('netflix') >= 0 ||
    lowerLabel.indexOf('spotify') >= 0 ||
    lowerLabel.indexOf('cinema') >= 0
  ) {
    return 'loisirs';
  } else if (lowerLabel.indexOf('salaire') >= 0 || lowerLabel.indexOf('salary') >= 0) {
    return 'revenu';
  }
  return 'autre';
}

// fonction utilitaire (utilisée nulle part ailleurs ?)
function fmt(d) {
  var dd = d.getDate();
  var mm = d.getMonth() + 1;
  var yyyy = d.getFullYear();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return dd + '/' + mm + '/' + yyyy;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function processTransactions(txs, opts) {
  var result = [];
  var total = 0;
  var totalCredit = 0;
  var totalDebit = 0;
  var nbCredit = 0;
  var nbDebit = 0;
  var errors = [];
  var warnings = [];
  var i, j;
  var tx;
  var converted;
  var category;
  var month;
  var year;
  var threshold;

  // si pas d'options on met des valeurs par défaut
  if (!opts) {
    opts = {};
  }
  if (!opts.currency) {
    opts.currency = 'EUR';
  }
  if (!opts.month) {
    opts.month = new Date().getMonth();
  }
  if (!opts.year) {
    opts.year = new Date().getFullYear();
  }
  if (opts.threshold === undefined) {
    opts.threshold = 1000;
  }

  threshold = opts.threshold;
  month = opts.month;
  year = opts.year;

  // boucle principale
  for (i = 0; i < txs.length; i++) {
    tx = txs[i];

    // on filtre par mois et par année
    var d = new Date(tx.date);
    if (d.getMonth() !== month) {
      continue;
    }
    if (d.getFullYear() !== year) {
      continue;
    }

    // on vérifie le type
    var typeOk = false;
    for (j = 0; j < TYPES.length; j++) {
      if (TYPES[j] === tx.type) {
        typeOk = true;
      }
    }
    if (!typeOk) {
      errors.push('transaction ' + i + ' has invalid type');
      continue;
    }

    // on vérifie le montant
    if (tx.amount === undefined || tx.amount === null) {
      errors.push('transaction ' + i + ' has no amount');
      continue;
    }
    if (typeof tx.amount !== 'number') {
      errors.push('transaction ' + i + ' amount is not a number');
      continue;
    }
    if (tx.amount < 0) {
      errors.push('transaction ' + i + ' has negative amount');
      continue;
    }

    // conversion devise si besoin
    converted = convertAmount(tx, opts.currency);

    // catégorisation manuelle (devrait être dans la donnée mais bon...)
    category = inferCategory(tx.label);

    // alertes
    if (converted > threshold && tx.type === 'debit') {
      warnings.push(
        'transaction ' + i + ' depasse le seuil (' + converted + ' > ' + threshold + ')',
      );
    }

    // calculs
    if (tx.type === 'credit') {
      total = total + converted;
      totalCredit = totalCredit + converted;
      nbCredit = nbCredit + 1;
    } else if (tx.type === 'debit') {
      total = total - converted;
      totalDebit = totalDebit + converted;
      nbDebit = nbDebit + 1;
    } else if (tx.type === 'transfer') {
      // les transferts ne changent pas le total
    }

    // construction de l'objet de sortie
    var item = {};
    item.id = tx.id;
    item.date = fmt(d);
    item.label = tx.label || '(sans libellé)';
    item.amount = converted;
    item.originalAmount = tx.amount;
    item.originalCurrency = tx.currency || opts.currency;
    item.currency = opts.currency;
    item.type = tx.type;
    item.category = category;
    item.flagged = converted > threshold && tx.type === 'debit';
    result.push(item);
  }

  // tri par date (un peu pourri mais ça marche)
  result.sort(function (a, b) {
    var pa = a.date.split('/');
    var pb = b.date.split('/');
    var da = new Date(pa[2], pa[1] - 1, pa[0]);
    var db = new Date(pb[2], pb[1] - 1, pb[0]);
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  });

  // moyenne (au cas ou)
  var avgCredit = 0;
  if (nbCredit > 0) {
    avgCredit = totalCredit / nbCredit;
  }
  var avgDebit = 0;
  if (nbDebit > 0) {
    avgDebit = totalDebit / nbDebit;
  }

  return {
    transactions: result,
    total: total,
    totalCredit: totalCredit,
    totalDebit: totalDebit,
    nbCredit: nbCredit,
    nbDebit: nbDebit,
    avgCredit: avgCredit,
    avgDebit: avgDebit,
    errors: errors,
    warnings: warnings,
  };
}

// helper utilisé nulle part (dead code ?)
export function legacyHelper(x) {
  if (x === null) return null;
  if (x === undefined) return undefined;
  if (typeof x === 'string') return x.trim();
  return x;
}
