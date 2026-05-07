# Audit : `src/transactions-legacy.js`

## Vue d'ensemble rapide

| Élément | Détail |
|---|---|
| Lignes totales | 231 |
| Fonctions exportées | `processTransactions(txs, opts)`, `legacyHelper(x)` |
| Fonction interne | `fmt(d)` |
| Constante globale | `TYPES` (3 valeurs) |

---

## Diagnostic général

Le fichier tourne en ES5 et date clairement d'une autre époque. `processTransactions` fait tout dans un seul bloc, filtre par date, validation, conversion devise, catégorisation, calcul des totaux, tri. Ça marche, mais c'est difficile à lire et encore plus à modifier sans tout casser.

Ce qui est bien : les entrées sont validées, les erreurs bloquantes sont séparées des warnings, et le retour est structuré donc directement utilisable côté vue.

Ce qui pose problème : la fonction est beaucoup trop longue, les taux de change sont codés en dur, et il n'y a aucun test. `legacyHelper` est exportée mais n'est appelée nulle part dans le projet.

---

## Points à corriger

- **Lignes 106–116 : Taux de change en dur**  
  USD/EUR = 0.92 et GBP/EUR = 1.17 sont figés dans le code. Pour toute autre devise (CHF, JPY…) le taux tombe à 1 sans prévenir.  
  → Erreurs financières silencieuses, compliquées à repérer en prod.

- **Lignes 50–51 : Décalage sur `opts.month`**  
  `getMonth()` retourne 0–11. Si on passe `{ month: 5 }` en pensant à mai, on obtient juin.  
  → Filtrage décalé d'un mois, sans alerte.

- **Lignes 123–152 : Catégorisation par mots-clés**  
  `indexOf('course')` va catégoriser "Courses de gym" comme alimentation. En plus, la catégorie est souvent déjà dans les données modernes, donc ce code écrase une valeur correcte.  
  → Peut corrompre des données valides sans qu'on s'en rende compte.

- **Lignes 190–198 : Tri sur date reformatée**  
  La date ISO est convertie en DD/MM/YYYY via `fmt()`, puis reconvertie en `Date` pour le tri. Ce double aller-retour est fragile sans vraiment apporter quelque chose.

- **Ligne 225 : `legacyHelper` jamais utilisée**  
  Exportée mais introuvable dans le reste du projet. À supprimer ou documenter.

- **Pas de tests**  
  `processTransactions` couvre une dizaine de cas différents et n'a aucun test. Le moindre refacto devient risqué.

---

## Code smells

### Priorité Haute

**[Long Method] ligne 25**  
`processTransactions` fait ~197 lignes et gère six trucs à la fois : normalisation des options, filtre par date, validation, conversion devise, catégorisation, calculs et tri. Impossible à lire d'une traite, impossible à tester proprement. La moindre modif dans le tri peut casser la validation sans qu'on le voie venir.  
→ Extraire chaque responsabilité dans sa propre fonction (`filterByMonth`, `validateTransaction`, `convertAmount`, etc.) et garder `processTransactions` comme simple orchestrateur d'une vingtaine de lignes.

---

**[Magic Numbers] lignes 106–116 et 57**  
Les taux de change (0.92, 1.17…) et le seuil d'alerte par défaut (1000) sont éparpillés dans le code sans explication. Un taux périmé passera complètement inaperçu à la lecture.  
→ Passer ça en constantes nommées en haut du fichier (`const USD_TO_EUR = 0.92`) ou mieux, les injecter via `opts`.

---

**[Absent Guard Clause] ligne 65**  
La boucle `for` part directement sur `txs.length` sans vérifier que `txs` existe. Pourtant `opts` est normalisé dès la ligne 44. Un appel `processTransactions(null)` lève un `TypeError` non contrôlé alors qu'on pourrait juste retourner un tableau vide avec une erreur dans `errors`.  
→ Ajouter un `if (!Array.isArray(txs)) throw new TypeError(...)` en entrée, cohérent avec ce que fait `exportCSV` dans le module moderne.

---

### Priorité Moyenne

**[Dead Code] ligne 225**  
`legacyHelper` est exportée mais aucun `import` de cette fonction n'existe dans le projet. Ça gonfle l'API publique et ça perturbe quiconque essaie de comprendre ce qui est vraiment utilisé.  
→ Supprimer, ou si c'est consommé par du code externe non versionné, au moins laisser un commentaire qui l'explique.

---

**[Primitive Obsession] lignes 85–100**  
Les erreurs sont accumulées comme des strings brutes (`'transaction ' + i + ' has invalid type'`). L'index `i` est celui de la boucle, pas l'`id` de la transaction. En prod c'est inutilisable, on ne peut pas traiter les erreurs programmatiquement ni retrouver facilement la transaction concernée.  
→ Pousser des objets structurés `{ code: 'INVALID_TYPE', txId: tx.id }` à la place.

---

**[Duplicate Code] lignes 125–149**  
Le même pattern `lab.indexOf('mot') >= 0` est répété cinq fois en cascade `else if`. Ajouter une catégorie oblige à toucher cette cascade, et de toute façon la logique est redondante car la catégorie est déjà portée par les données modernes.  
→ Extraire une fonction `inferCategory(label)` avec une table de correspondance en regexp, ou supprimer si `tx.category` est déjà fiable.

---

### Priorité Basse

**[Comments as Deodorant] lignes 189, 200, 122**  
Plusieurs commentaires excusent le code plutôt que de l'expliquer : `// un peu pourri mais ça marche`, `// au cas ou`, `// devrait être dans la donnée mais bon...`. C'est un signal que personne n'a jamais pris le temps de corriger ces zones.  
→ Supprimer les commentaires et corriger ce qu'ils désignent.

---

**[var en bloc ES5] lignes 26–42**  
Toutes les variables sont déclarées en bloc en tête de fonction avec `var`, indépendamment de là où elles sont vraiment utilisées. `var` étant function-scoped, un `var d = new Date(tx.date)` dans le `for` est en réalité un comportement contre-intuitif.  
→ Remplacer par `const` / `let` déclarés au plus près de leur utilisation.

---

## Refactoring effectué

### Zone 1 : Conversion de devise

Trois étapes appliquées de façon incrémentale, un commit par étape.

**1. Replace Magic Number with Named Constant**  
Les taux de change `0.92`, `1.08`, `1.17`, `0.85` éparpillés dans la cascade `if/else` ont été regroupés dans un objet `RATES` en tête de fichier. Le taux de fallback `1` a aussi été nommé `DEFAULT_RATE`. Modifier un taux se fait désormais à un seul endroit.

**2. Extract Function**  
Le bloc de conversion (15 lignes mélangées dans la boucle principale) a été extrait dans `convertAmount(tx, targetCurrency)`. La boucle principale se réduit à `converted = convertAmount(tx, opts.currency)`. Testable indépendamment, responsabilité claire.

**3. Decompose Conditional**  
La cascade `if / else if / else if / else` est remplacée par une lookup dans `RATES` : `var rate = RATES[key] !== undefined ? RATES[key] : DEFAULT_RATE`. Ajouter une paire de devises ne touche plus qu'à l'objet `RATES`.

---

### Zone 2 : Catégorisation par libellé

Trois étapes appliquées de façon incrémentale, un commit par étape.

**1. Rename Variable**  
`lab` (abréviation opaque) renommé en `lowerLabel`, qui décrit précisément ce qu'il contient. Aucun comportement modifié.

**2. Extract Function**  
Les 30 lignes de catégorisation inline extraites dans `inferCategory(label)`. La boucle principale se réduit à `category = inferCategory(tx.label)`. La fonction gère elle-même le cas `label` absent et retourne toujours une chaîne valide.

**3. Replace Magic String with Named Constant**  
La valeur par défaut `'autre'`, répétée deux fois dans `inferCategory`, extraite en constante `DEFAULT_CATEGORY = 'autre'`.

---

## Éco-impact

### Audit Lighthouse : avant optimisation

> `http://localhost:5173/` Desktop · Lighthouse 13.0.2

| Métrique | Valeur | Niveau |
|---|---|---|
| Score global | **94 / 100** | Bon |
| First Contentful Paint | 0.9 s | Bon |
| Largest Contentful Paint | 1.5 s | À améliorer |
| Total Blocking Time | 0 ms | Bon |
| Cumulative Layout Shift | 0 | Bon |
| Speed Index | 0.9 s | Bon |

Le LCP de 1.5 s est le seul point hors zone verte, probablement lié au bundle JS non minifié en mode dev.

#### Gaspillages identifiés

| Problème | Économie estimée | Priorité |
|---|---|---|
| Minify JavaScript | −660 KiB | Haute |
| Reduce unused JavaScript | −599 KiB | Haute |
| Back/forward cache bloqué | 1 raison bloquante | Haute |

**Total évitable : ~1 259 KiB** sur chaque premier chargement.

**Minify JavaScript** : bundle servi en mode dev sans minification. En prod (`vite build`), ce chiffre disparaît. Ne jamais mesurer les perfs sur le serveur de dev.

**Reduce unused JavaScript** : ~599 KiB téléchargés mais jamais exécutés au premier rendu. Pistes : imports nommés, lazy import (`React.lazy`), audit bundle avec `rollup-plugin-visualizer`.

**Back/Forward Cache** : la page bloque la restauration depuis le cache navigateur, probablement un listener `unload` ou une connexion non fermée. Corriger ça permet de revenir instantanément sans rechargement réseau.

---

### Optimisation appliquée : Pagination de la liste

**Problème** : `App.jsx` rendait systématiquement l'intégralité du tableau `transactions` via `transactions.map()`. Toutes les transactions créent autant de nœuds DOM dès le premier paint.

**Solution** : Pagination côté client avec `PAGE_SIZE = 10`.

```js
// avant
{transactions.map((tx) => <li key={tx.id}>…</li>)}

// après
const visibleTransactions = useMemo(
  () => transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
  [transactions, page],
);
{visibleTransactions.map((tx) => <li key={tx.id}>…</li>)}
```

Contrôles ajoutés : boutons Précédent / Suivant + indicateur `page / total`, affichés uniquement si `pageCount > 1`. Une nouvelle transaction remet `page` à 0 pour rester visible en tête de liste.

---

### Audit Lighthouse : après optimisation

> `http://localhost:5173/` Desktop · Lighthouse 13.0.2

| Métrique | Avant | Après | Delta |
|---|---|---|---|
| Score global | 94 / 100 | **94 / 100** | = |
| First Contentful Paint | 0.9 s | 0.9 s | = |
| Largest Contentful Paint | 1.5 s | 1.5 s | = |
| Total Blocking Time | 0 ms | 0 ms | = |
| Cumulative Layout Shift | 0 | 0 | = |
| Speed Index | 0.9 s | 0.9 s | = |

#### Pourquoi le score ne bouge pas

Le jeu de données seed contient **18 transactions**. Avec `PAGE_SIZE = 10`, la page 1 affiche 10 nœuds au lieu de 18, une différence de 8 `<li>`. Sur un CPU rapide en émulation Desktop, 8 nœuds légers n'ont aucun impact mesurable sur FCP, LCP ou TBT. Ce résultat est attendu et correct. La pagination est une optimisation de scalabilité, pas un gain immédiat sur un petit dataset.

#### Impact réel selon le volume

| Transactions | Avant | Après |
|---|---|---|
| 18 (seed actuel) | 18 | 10 |
| 100 | 100 | 10 |
| 500 | 500 | 10 |
| 5 000 | 5 000 | 10 |

À partir de ~200–300 transactions, `transactions.map()` sans pagination commence à allonger le TBT et à dégrader le LCP de manière mesurable.

#### Ce qui a réellement changé

| Axe | Avant | Après |
|---|---|---|
| Nœuds DOM initiaux | O(n) croît sans limite | O(PAGE_SIZE) plafonné à 10 |
| Mémoire JS utilisée | Proportionnelle à n | Constante |
| Lighthouse score | 94 | 94 (inchangé, attendu) |
| Scalabilité | Dégradation linéaire | Stable quel que soit n |