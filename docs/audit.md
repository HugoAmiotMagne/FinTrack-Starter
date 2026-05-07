# Audit — `src/transactions-legacy.js`

## Vue d'ensemble rapide

| Élément | Détail |
|---|---|
| Lignes totales | 231 |
| Fonctions exportées | `processTransactions(txs, opts)`, `legacyHelper(x)` |
| Fonction interne | `fmt(d)` |
| Constante globale | `TYPES` (3 valeurs) |


---

## Diagnostic général

Le fichier tourne en ES5 et date clairement d'une autre époque. `processTransactions` fait tout dans un seul bloc — filtre par date, validation, conversion devise, catégorisation, calcul des totaux, tri. Ça marche, mais c'est difficile à lire et encore plus à modifier sans tout casser.

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

### **Priorité Haute**

**[Long Method] — ligne 25**  
`processTransactions` fait ~197 lignes et gère six trucs à la fois : normalisation des options, filtre par date, validation, conversion devise, catégorisation, calculs et tri. Impossible à lire d'une traite, impossible à tester proprement. La moindre modif dans le tri peut casser la validation sans qu'on le voie venir.  
→ Extraire chaque responsabilité dans sa propre fonction (`filterByMonth`, `validateTransaction`, `convertAmount`, etc.) et garder `processTransactions` comme simple orchestrateur d'une vingtaine de lignes.

---

**[Magic Numbers] — lignes 106–116 et 57**  
Les taux de change (0.92, 1.17…) et le seuil d'alerte par défaut (1000) sont éparpillés dans le code sans explication. Un taux périmé passera complètement inaperçu à la lecture.  
→ Passer ça en constantes nommées en haut du fichier (`const USD_TO_EUR = 0.92`) ou mieux, les injecter via `opts`.

---

**[Absent Guard Clause] — ligne 65**  
La boucle `for` part directement sur `txs.length` sans vérifier que `txs` existe. Pourtant `opts` est normalisé dès la ligne 44 — incohérence bizarre. Un appel `processTransactions(null)` lève un `TypeError` non contrôlé alors qu'on pourrait juste retourner un tableau vide avec une erreur dans `errors`.  
→ Ajouter un `if (!Array.isArray(txs)) throw new TypeError(...)` en entrée, cohérent avec ce que fait `exportCSV` dans le module moderne.

---

### **Priorité Moyenne**

**[Dead Code] — ligne 225**  
`legacyHelper` est exportée mais aucun `import` de cette fonction n'existe dans le projet. Ça gonfle l'API publique et ça perturbe quiconque essaie de comprendre ce qui est vraiment utilisé.  
→ Supprimer, ou si c'est consommé par du code externe non versionné, au moins laisser un commentaire qui l'explique.

---

**[Primitive Obsession] — lignes 85–100**  
Les erreurs sont accumulées comme des strings brutes (`'transaction ' + i + ' has invalid type'`). L'index `i` est celui de la boucle, pas l'`id` de la transaction. En prod c'est inutilisable — on ne peut pas traiter les erreurs programmatiquement ni retrouver facilement la transaction concernée.  
→ Pousser des objets structurés `{ code: 'INVALID_TYPE', txId: tx.id }` à la place.

---

**[Duplicate Code] — lignes 125–149**  
Le même pattern `lab.indexOf('mot') >= 0` est répété cinq fois en cascade `else if`. Ajouter une catégorie oblige à toucher cette cascade, et de toute façon la logique est redondante car la catégorie est déjà portée par les données modernes.  
→ Extraire une fonction `inferCategory(label)` avec une table de correspondance en regexp, ou supprimer si `tx.category` est déjà fiable.

---

### **Priorité Basse**

**[Comments as Deodorant] — lignes 189, 200, 122**  
Plusieurs commentaires excusent le code plutôt que de l'expliquer : `// un peu pourri mais ça marche`, `// au cas ou`, `// devrait être dans la donnée mais bon...`. C'est un signal que personne n'a jamais pris le temps de corriger ces zones.  
→ Supprimer les commentaires et corriger ce qu'ils désignent.

---

**[var en bloc ES5] — lignes 26–42**  
Toutes les variables sont déclarées en bloc en tête de fonction avec `var`, indépendamment de là où elles sont vraiment utilisées. `var` étant function-scoped, un `var d = new Date(tx.date)` dans le `for` est en réalité hoisté — comportement contre-intuitif.  
→ Remplacer par `const` / `let` déclarés au plus près de leur utilisation.