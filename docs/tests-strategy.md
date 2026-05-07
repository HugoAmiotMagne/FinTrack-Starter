# Stratégie de test — FinTrack

## 1. Qu'est-ce qu'un test unitaire ? Donne un exemple tiré de FinTrack.

On teste une seule fonction, seule et isolée. Elle prend des données en entrée, produit un résultat, et on vérifie que ce résultat est correct.

Exemple : `simpleInterest(1000, 5, 2)` devrait retourner `100`, mais retournait `10 000` parce que la division par 100 avait été oubliée dans le code. Le test unitaire a détecté l'erreur immédiatement.

---

## 2. Qu'est-ce qu'un test d'intégration ? Quand le préférer à plusieurs tests unitaires ?

On teste plusieurs modules ensemble et on vérifie qu'ils communiquent correctement.

On le préfère quand le bug peut venir de la connexion entre deux pièces, pas d'une seule pièce isolée. Exemple : vérifier que la création d'une transaction dans le formulaire met bien à jour le solde affiché. Plusieurs tests unitaires séparés ne détecteraient pas si le "câble" entre les deux est cassé.

---

## 3. Qu'est-ce qu'un test E2E ? Quel est son principal défaut ?

Un test E2E simule un vrai utilisateur : on ouvre l'application dans un navigateur réel, on clique, on remplit des champs, on vérifie ce qui s'affiche.

Son principal défaut : c'est lent et fragile. Si un bouton change de nom ou qu'un élément se déplace dans l'interface, le test peut échouer même si l'application fonctionne correctement.

---

## 4. Si tu devais répartir 100 tests sur FinTrack, combien d'unitaires, d'intégration, de E2E ? Justifie.

**70 unitaires — 25 intégration — 5 E2E**

- **70 unitaires** : ils couvrent les fonctions pures de `calculator.js`, `export-csv.js` et `transactions-legacy.js`. Ils s'écrivent vite, s'exécutent en millisecondes et détectent les bugs financiers avec précision.
- **25 intégration** : ils vérifient que le formulaire, le moteur de calcul et l'affichage du solde se comportent correctement ensemble.
- **5 E2E** : ils couvrent uniquement les parcours critiques — ajouter une transaction, vérifier le solde mis à jour — parce que les tests E2E sont coûteux à maintenir et cassent dès qu'un libellé change dans l'interface.
