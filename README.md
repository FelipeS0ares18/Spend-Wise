# Spend Wise

Aplicativo financeiro para controle de receitas, despesas, metas, recorrencias, cartoes, compras parceladas, importacao OFX e conta compartilhada.

Producao: https://appfinance-e6d2d.web.app

## Stack

- Vite + React
- Firebase Auth
- Firestore
- Firebase Hosting
- Firebase Functions
- PWA
- Twilio WhatsApp Sandbox
- Vitest
- React Testing Library
- Playwright
- TypeScript gradual

## Scripts

```bash
npm.cmd run test:run
npm.cmd run test:e2e
npm.cmd run typecheck
npm.cmd run build
node verify-index.js
npm.cmd audit --audit-level=low
firebase.cmd deploy --only hosting
```

## Arquitetura

```txt
src/
  views/
  components/
  domain/
  hooks/
  services/
  styles/
```

As camadas de dominio e services usam TypeScript nas partes criticas. A UI segue em React com separacao por views, componentes e hooks.

## Qualidade

- Testes unitarios e de UI com Vitest e React Testing Library.
- E2E basico com Playwright em modo isolado por `VITE_E2E=1`.
- Validacao de dados antes de persistir no Firestore.
- Build Vite com code splitting por views e chunks de vendors.

## Deploy

O app e publicado no Firebase Hosting:

```bash
npm.cmd run build
firebase.cmd deploy --only hosting
```
