# Spend Wise Frontend

Esta pasta passa a ser a fonte do frontend.

- `main.jsx`: bootstrap React/Vite.
- `App.jsx`: orquestra estado, ações e composição das views.
- `views/DashboardView.jsx`: view do dashboard, com score, onboarding, insights, resumos e transações recentes.
- `views/TransactionsView.jsx`: view de transações, filtros e ações da lista.
- `views/SearchView.jsx`: view de busca global e navegação pelos resultados.
- `views/CalendarView.jsx`: view do calendario financeiro e selecao de dia.
- `views/ClosingView.jsx`: view de fechamento mensal e historico.
- `views/RulesView.jsx`: view de regras de categorizacao.
- `views/ImportView.jsx`: view de importacao OFX, revisao e envio.
- `views/NotificationsView.jsx`: view de notificacoes e alertas proximos.
- `views/RecurringView.jsx`: view de contas recorrentes.
- `views/CardsView.jsx`: view de cartoes de credito.
- `views/ShoppingView.jsx`: view de lista de compras.
- `views/ShortcutsView.jsx`: view de atalhos rapidos.
- `views/SharedAccountView.jsx`: view de conta compartilhada e convites.
- `views/ProfileView.jsx`: view de perfil, codigo WhatsApp e resumo da conta.
- `views/GoalsView.jsx`: view de metas e caixinhas.
- `views/ReportView.jsx`: view de relatorio mensal.
- As views extraidas usam imports estaticos para manter o PWA mais resiliente enquanto o cache/service worker e estabilizado.
- `components/appPrimitives.jsx`: barrel de compatibilidade que reexporta os módulos abaixo.
- `components/ui.jsx`: primitivas visuais, modal, botões, badges e empty states.
- `components/forms.jsx`: formulários e modais de entrada/edição.
- `components/transactions.jsx`: linha de transação.
- `components/commercial.jsx`: onboarding e cards comerciais.
- `components/AuthScreen.jsx`: tela de autenticação.
- `services/firebase.ts`: inicializacao Firebase com exports diretos de `db`, `auth`, `fs` e `authApi`.
- `services/financeRepository.ts`: operacoes de escrita das entidades financeiras centrais.
- `services/firestorePaths.ts`: helpers de caminhos Firestore para dados individuais e compartilhados.
- `services/userRepository.ts`: perfil, codigo WhatsApp, onboarding e household ativo.
- `services/householdRepository.ts`: criacao de household, convites, entrada por codigo e migracao para conta compartilhada.
- `services/categoryRulesRepository.ts`: regras de categorizacao, matching e escrita das regras.
- `services/statementImportService.ts`: parser OFX e persistencia dos lancamentos importados.
- `services/monthlyClosingRepository.ts`: fechamento mensal e reabertura.
- `hooks/useFinanceData.js`: assinaturas em tempo real do Firestore para transações, metas, atalhos, recorrentes, cartões, compras, fechamentos, regras e convites.
- `hooks/useUserProfile.js`: leitura e sincronizacao de perfil, WhatsApp e household ativo.
- `hooks/useMobileNavigation.js`: drawer mobile, itens da barra inferior e personalizacao de navegacao.
- `hooks/useFinanceModals.js`: estados dos modais financeiros, chat e edicao ativa.
- `hooks/useImportState.js`: estado temporario da importacao OFX e edicao de linhas.
- `*.test.js`: testes unitarios de dominio, services e repositories com mocks.
- `styles/app.css`: CSS principal do app.
- `domain/financeMetrics.js`: score de saúde financeira e insights automáticos.
- `domain/constants.js`: categorias, cores e formatação.
- `domain/naturalParser.js`: parser de texto natural da entrada rápida.
- `domain/transactions.js`: status e exibição de criador das transações.

Próximos passos técnicos:

1. Quebrar os estados restantes do `App.jsx` em hooks por fluxo.
2. Ampliar testes para fluxos de UI com componentes renderizados.
3. Iniciar contratos de dados com JSDoc ou TypeScript.
4. Adicionar TypeScript e testes unitários.
