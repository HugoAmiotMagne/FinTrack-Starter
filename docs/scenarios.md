# Scénarios BDD — Export CSV

## Scénario 1 : Export avec une liste vide

**Étant donné** une liste de transactions vide  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** le fichier téléchargé contient uniquement la ligne d'en-tête `date,label,amount,category`

---

## Scénario 2 : Filtrage par mois en cours

**Étant donné** une liste contenant une transaction du mois en cours (janvier 2024)  
et une transaction du mois précédent (décembre 2023)  
**Quand** l'utilisateur exporte le CSV en janvier 2024  
**Alors** le fichier contient uniquement la transaction de janvier 2024  
et la transaction de décembre 2023 est absente du fichier

---

## Scénario 3 : Échappement des virgules selon RFC 4180

**Étant donné** une transaction dont le libellé contient une virgule (ex : `Café, croissant`)  
**Quand** l'utilisateur exporte le CSV  
**Alors** le champ est entouré de guillemets doubles dans le fichier : `"Café, croissant"`  
et les autres champs sans virgule restent sans guillemets
