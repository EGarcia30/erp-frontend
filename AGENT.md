This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.                                                           
                                                                                                                                                                   
  # === Commands ===                                                                                                                                               
                                                                                                                                                                   
  # Install dependencies                                                                                                                                           
  npm install                                                                                                                                                      
                                                                                                                                                                   
  # Run development server                                                                                                                                         
  npm run dev

  # Build production bundle
  npm run build

  # Run linting
  npm run lint

  # Run all tests
  npm test

  # Run a single test
  npm test -- <test-pattern>

  # Run tests with coverage
  npm run test:coverage

  # Start API/Backend server (if separate)
  npm run server

  ---
  === Architecture Overview ===

  This is a React-based ERP (Enterprise Resource Planning) frontend application focused on sales management (Ventas).

  Project Structure

  erp-frontend/
  ├── src/
  │   ├── components/        # Reusable UI components
  │   ├── pages/             # Page-level components (routes)
  │   ├── services/          # API/data service layer
  │   ├── context/           # React Context providers
  │   ├── hooks/             # Custom React hooks
  │   ├── utils/             # Utility functions
  │   └── App.js             # Main app entry point
  ├── public/                # Static assets
  ├── package.json           # Dependencies and scripts
  └── vite.config.js         # Vite bundler config

  Key Architecture Patterns

  1. State Management: Uses React Context for global state (auth, cart, notifications)
  2. Component Hierarchy:
    - pages/ contains route-specific views
    - components/ contains shared, composable UI elements
    - Hooks layer abstracts common logic
  3. Routing: File-based routing or router-based navigation between modules (Ventas, Historial, Login, Promociones, etc.)
  4. API Layer: Services layer centralizes API calls with potential retry/error handling

  Major Modules

  - Ventas (Sales): Primary module for managing sales/transactions
  - Historial (History): Sales history/reporting
  - Login: Authentication flow
  - Promociones (Promotions): Sales promotions/discounts

  ---
  === Development Notes ===

  Commit History Insights

  Recent refactoring focused on:
  - Improving code structure for readability
  - Terminology standardization (Cuentas → Ventas)
  - Enhanced Login UI with error handling
  - Payment modal integration with change tracking

  Before Making Changes

  - Verify payment modal and change tracking logic in recent commits
  - Check for stale memory records that reference removed/renamed functions
  - Recent state changes may not be reflected in memory records

  HIGH PRIORITY - VERIFY BEFORE ANY COMMIT:
    ├── src/App.jsx # Main router + global app structure
    ├── src/pages/ # MODULES UNDER ACTIVE MODIFICATION
    │ ├── Promociones.jsx # Recently modified - validate complete logic
    │ ├── Ventas.jsx # Main transactions flow - verify payments
    │ └── Historial.jsx # Reports - validate services integration
    ├── src/services/ # CRITICAL API layer - DO NOT modify without tests
    ├── src/components/ # Existing components catalog - review before creating new ones
    └── src/context/ # Global state - changes impact entire app

  ---
  === Best Practices ===

  - Use existing services layer for API calls
  - Follow established component naming conventions
  - When refactoring, verify changes don't break existing integrations
  - Keep state in Context minimal; use local state where component-scoped