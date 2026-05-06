# Spend Wise Architecture

## Frontend source

The frontend source now lives in `src/` and is built with Vite.

- `src/main.jsx`: React/Vite bootstrap.
- `src/App.jsx`: main app orchestration, state, actions and view composition.
- `src/views/DashboardView.jsx`: dashboard page composition, including health score, guided onboarding, insights, summaries and recent transactions.
- `src/views/TransactionsView.jsx`: transactions page composition, filters and transaction list actions.
- `src/views/SearchView.jsx`: global search page composition and result navigation.
- `src/views/CalendarView.jsx`: financial calendar grid composition and day selection.
- `src/views/ClosingView.jsx`: monthly closing summary and closing history.
- `src/views/RulesView.jsx`: category rule form and rule list.
- `src/views/ImportView.jsx`: OFX upload, review and import page.
- `src/views/NotificationsView.jsx`: local notification status and upcoming alert lists.
- `src/views/RecurringView.jsx`: recurring bills page.
- `src/views/CardsView.jsx`: credit cards summary and actions page.
- `src/views/ShoppingView.jsx`: shopping list page.
- `src/views/ShortcutsView.jsx`: quick shortcuts page.
- `src/views/SharedAccountView.jsx`: household sharing and invitations page.
- `src/views/ProfileView.jsx`: profile, WhatsApp connection code and account summary page.
- `src/views/GoalsView.jsx`: goals and savings boxes page.
- `src/views/ReportView.jsx`: monthly report and category breakdown page.
- Extracted views are currently imported statically to keep the PWA resilient while the service worker/cache behavior is stabilized.
- `src/components/appPrimitives.jsx`: compatibility barrel that re-exports component modules.
- `src/components/ui.jsx`: base UI primitives, modal shell, buttons, badges, empty states and field helpers.
- `src/components/forms.jsx`: transaction, quick-entry, goal, shortcut, card, recurring, shopping and deposit forms.
- `src/components/transactions.jsx`: transaction row rendering.
- `src/components/commercial.jsx`: onboarding and commercial insight cards.
- `src/components/AuthScreen.jsx`: authentication screen.
- `src/services/firebase.js`: Firebase initialization with direct exports for `db`, `auth`, `fs` and `authApi`.
- `src/services/financeRepository.js`: write operations for core finance entities such as transactions, goals, shortcuts, recurring bills, cards and shopping items.
- `src/services/firestorePaths.js`: owner-aware Firestore path helpers for individual and shared household data.
- `src/services/userRepository.js`: user profile, WhatsApp connection code, onboarding preference and active household writes.
- `src/services/householdRepository.js`: household creation, invites, join-by-code and individual-to-shared data migration.
- `src/services/categoryRulesRepository.js`: category rule matching and category rule writes.
- `src/services/statementImportService.js`: OFX parsing and imported transaction persistence.
- `src/services/monthlyClosingRepository.js`: monthly closing and reopening writes.
- `src/hooks/useFinanceData.js`: real-time Firestore subscriptions for transactions, goals, shortcuts, recurring bills, cards, shopping, closings, rules and invites.
- `src/hooks/useUserProfile.js`: profile, WhatsApp and active household loading/synchronization.
- `src/hooks/useMobileNavigation.js`: mobile drawer, bottom navigation items and navigation customization state.
- `src/hooks/useFinanceModals.js`: transaction, quick-entry, goal, shortcut, chat, card, recurring, shopping and deposit modal state.
- `src/hooks/useImportState.js`: temporary OFX import state and row editing helpers.
- `src/styles/app.css`: global CSS, animations and static page-level styles.
- `src/domain/financeMetrics.js`: financial health score and automatic insights.
- `src/domain/constants.js`: shared categories, colors and formatting helpers.
- `src/domain/naturalParser.js`: quick-entry natural language parser.
- `src/domain/transactions.js`: transaction status and creator display helpers.
- `public/assets/js/pwa.js`: service worker registration and install button behavior.
- `public/assets/img/`: favicons and PWA images.
- `public/assets/manifest/`: PWA manifest.

## Production entry

Firebase Hosting serves the static files generated into `build/`.

- `build/index.html`: generated document shell and Firebase Hosting entrypoint.
- `build/assets/index-*.js`: bundled React app.
- `build/assets/index-*.css`: bundled styles.
- `build/assets/js/pwa.js`: copied PWA helper.
- `build/assets/img/`: copied favicons and PWA images.
- `build/assets/manifest/`: copied PWA manifest.

## Validation

Test, build and validate:

```powershell
npm.cmd run test:run
npm.cmd run build
node verify-index.js
```

The test suite covers core domain rules, OFX parsing and mocked repository writes. The verifier checks that the Vite bundle exists, all source JS/JSX files parse, PWA assets exist, manifest icons resolve, and the production output is ready for Firebase Hosting.

## Deploy

Run:

```powershell
firebase.cmd deploy --only hosting
```
