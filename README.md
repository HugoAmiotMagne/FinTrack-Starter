# FinTrack

[![CI](https://github.com/hugoamiot/fintrack-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/hugoamiot/fintrack-starter/actions/workflows/ci.yml)

Application de gestion de budget personnel.

## Stack

- React 18
- Vite

## Installation

```bash
npm ci
npm run dev
```

L'appli est dispo sur http://localhost:5173.

## Structure

- `src/calculator.js` — moteur de calcul
- `src/transactions-legacy.js` — module historique de traitement des transactions
- `src/seed.js` — données de démarrage
- `src/App.jsx` — interface

## TODO

- [ ] Ajouter des tests
- [X] Mettre en place un linter
- [x] CI
- [ ] Export CSV
- [ ] Refacto du module legacy

---

*Projet fil rouge B3 Dev — My Digital School Bordeaux*
