## 1. Qu’est-ce qu’un test unitaire ? Donne un exemple tiré de FinTrack. 

On test une seule fonction, seule et isolée. Elle prends des informations en entrée, elle donne un résultat et on verifie que ce résultat est correct. 

Ex : simpleInterest(1000, 5, 2) 

Ca devrait retourner 100, mais cela retourne 10 000 parce que la division par 100 est oubliée dans le code.

## 2. Qu’est-ce qu’un test d’intégration ? Quand préférer un test d’intégration à plusieurs tests unitaires ? 

On test plusieurs morceaux en meme temps. Et on vérifie qu'ils se parlent bien.

On peut le préfèrer quand le bug peut venir de la connexion entre deux pièces, pas d'une seule pièce. Exemple : tester que la création d'une facture dans l'UI sauvegarde bien en base SQLite. Plusieurs tests unitaires séparés ne verraient pas si le "câble" entre les deux est cassé.

## 3. Qu’est-ce qu’un test E2E ? Quel est son principal défaut ? 

quand on fait un test E2E on simule un vrai utilisateur. on ouvre l'appli, on clique, on remplit des champs, on vérifie ce qui s'affiche.

Son gros défaut : c'est assez lent et fragile. Si un bouton change de nom ou l'UI bouge un pixel, le test peut casser, même si l'appli fonctionne bien.


## 4. Si tu devais répartir 100 tests sur FinTrack, combien d’unitaires, combien d’intégrations,combien de E2E ? Justifie. 

70 unitaires, 25 intégration, 5 E2E.

- Les 70 unitaires couvrent les fonctions pures de calculator.js, elle s'écrivent vite et détectent les bugs financiers précisément.
- Les 25 intégration vérifient que le formulaire, le calcul et l'affichage se parlent bien. 
- Les 5 E2E couvrent juste les parcours clés, créer une transaction, voir le solde parce que c'est lent et ça casse dès qu'un label change.  