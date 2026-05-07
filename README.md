# FinTrack

[![CI](https://github.com/HugoAmiotMagne/fintrack-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/HugoAmiotMagne/fintrack-starter/actions/workflows/ci.yml)
[![Playwright Tests](https://github.com/HugoAmiotMagne/fintrack-starter/actions/workflows/playwright.yml/badge.svg)](https://github.com/HugoAmiotMagne/fintrack-starter/actions/workflows/playwright.yml)

Application web de gestion de budget personnel. Elle permet de visualiser son solde, ses crédits et débits du mois, d'ajouter des transactions à la volée et d'exporter l'historique en CSV. Construite avec React 18 et Vite, elle ne dépend d'aucune base de données — les données sont gérées en mémoire à partir d'un jeu de seed.

> B3 Dev — My Digital School Bordeaux

---

## Prérequis

- Node.js **20.11.0** (version fixée dans `.nvmrc` — utiliser `nvm use` si nvm est installé)

## Installation

```bash
git clone https://github.com/HugoAmiotMagne/fintrack-starter.git
cd fintrack-starter
npm ci
```

---

## Lancement

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement sur `http://localhost:5173` |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build de production localement |

---

## Tests

### Unitaires (Jest)

```bash
npm test                        # exécute tous les tests unitaires
npm test -- --coverage          # génère le rapport de couverture dans coverage/
```

Les fichiers de test se trouvent dans `src/` à côté du code source (`*.test.js`).

### E2E (Playwright)

```bash
npx playwright install          # à faire une seule fois (télécharge les navigateurs)
npx playwright test             # lance les tests sur Chromium, Firefox et WebKit
npx playwright test --ui        # mode interactif avec interface graphique
```

Les scénarios E2E sont dans `tests-e2e/` (`*.spec.js`). Le serveur de développement est démarré automatiquement par Playwright si nécessaire.

### Linting et formatage

```bash
npm run lint        # ESLint sur src/
npm run format      # Prettier sur l'ensemble du projet
```

---

## Structure du projet

```
fintrack-starter/
├── src/
│   ├── App.jsx                    # Interface React — rendu, état, formulaire
│   ├── calculator.js              # Calculs financiers (solde, intérêts, formatage)
│   ├── calculator.test.js
│   ├── export-csv.js              # Génération du fichier CSV
│   ├── export-csv.test.js
│   ├── seed.js                    # Transactions initiales pour le démarrage local
│   ├── string-utils.js            # Utilitaires chaînes de caractères
│   ├── string-utils.test.js
│   ├── transactions-legacy.js     # Module historique de traitement des transactions
│   └── transactions-legacy.test.js
├── tests-e2e/
│   ├── smoke.spec.js              # Vérification que l'appli démarre correctement
│   ├── transactions.spec.js       # Ajout et affichage d'une transaction
│   └── export-csv.spec.js        # Téléchargement et contenu du fichier CSV
├── docs/
│   ├── audit.md                   # Audit qualité du module legacy + éco-impact Lighthouse
│   ├── scenarios.md               # Scénarios BDD pour l'export CSV
│   └── tests-strategy.md          # Stratégie de test (unitaires, intégration, E2E)
├── .github/workflows/
│   ├── ci.yml                     # Pipeline lint + tests unitaires
│   └── playwright.yml             # Pipeline tests E2E
├── index.html
├── vite.config.js
├── playwright.config.js
└── package.json
```

---

## Documentation

- [Audit qualité et éco-impact Lighthouse](docs/audit.md)
- [Scénarios BDD — Export CSV](docs/scenarios.md)
- [Stratégie de test](docs/tests-strategy.md)
