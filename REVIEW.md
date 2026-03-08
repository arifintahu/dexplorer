Here's a comprehensive review of the **dexplorer** repository — a lightweight, frontend-only Cosmos blockchain explorer built with React, TypeScript, Redux, and Tailwind CSS.

---

## Code Quality Issues

### 1. No Tests (Critical) - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**: 
  - Installed Vitest, React Testing Library, and jsdom.
  - Added `test` script to `package.json`.
  - Created `src/setupTests.ts` and `src/utils/helper.test.ts`.
  - Verified tests pass.

### 2. Excessive `any` Types (30+ instances) - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Enabled `strict: true` in `tsconfig.app.json`.
  - Replaced `any` types with proper interfaces in `TopNavigation.tsx`, `streamSlice.ts`, `TransactionDetail.tsx`.
  - Refactored `Blocks.tsx` to remove unused state causing type issues.
  - Ran `pnpm check` to verify zero type errors.

### 3. Silent Error Swallowing - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Added error logging in `rpc/client/index.ts` for connection validation.
  - Added proper error handling and logging in `useAccountData` hook.
  - Verified `helper.ts` logic is intentional.

### 4. Large Page Components - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Refactored `AccountDetail.tsx` (985 lines) -> `useAccountData` hook + sub-components.
  - Refactored `ProposalDetail.tsx` (649 lines) -> `useProposalData` hook + sub-components.
  - Refactored `Home.tsx` (634 lines) -> `useHomeData` hook + sub-components.
  - All main page components are now <150 lines.

### 5. Code Duplication
- Identical error-handling patterns (catch → console.error → toast.error → setState) repeated across `Proposals.tsx`, `Parameters.tsx`, `Validators.tsx`, `Home.tsx`
- Identical search handlers with fake 1-second delays in `Transactions.tsx:106` and `Accounts.tsx:102`
- Duplicate transaction decoding try-catch blocks in `BlockDetail.tsx`, `AccountDetail.tsx`, `TransactionDetail.tsx`

### 6. Code Style Issues
- Loose equality (`==` instead of `===`) in `Transactions.tsx:48,50` and `Blocks.tsx:86`
- Index-based React keys (`key={index}`) in 10+ locations — anti-pattern that causes rendering bugs
- 13 files contain `console.log/warn/error` statements that shouldn't ship to production

### 7. Non-Serializable Redux State
- `streamSlice.ts` stores `Subscription` objects and the `tmClient` in Redux, requiring extensive middleware workarounds. These should live outside the store.

---

## Performance Issues

### 8. StargateClient Recreated Per Query - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Implemented `WeakMap` caching in `src/rpc/query/index.ts`.
  - `StargateClient` is now reused for the same `Tendermint37Client` instance.

### 9. No Route-Level Code Splitting - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Implemented `React.lazy()` and `Suspense` in `App.tsx`.
  - Added loading fallback component.

### 10. Missing Memoization
- `Home.tsx` `StatCard` and `RecentBlocksCard` re-render on every parent update
- No `React.memo` on frequently-rendered list items

### 11. Memory Leak Risk
- WebSocket subscriptions in `Connect/index.tsx` may not be properly cleaned up on unmount — `useEffect` cleanup is incomplete.

---

## Missing Features

### 12. No 404 / Error Boundary Routes - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Added `NotFound.tsx` page.
  - Added `ErrorBoundary.tsx` component.
  - Configured routes in `App.tsx` to handle 404 and catch errors.

### 13. No CI/CD Pipeline - [RESOLVED]
- **Status**: ✅ Fixed
- **Changes**:
  - Created `.github/workflows/ci.yml`.
  - Runs lint, type-check, test, and build on push/PR.

### 14. No Pre-commit Hooks
- ESLint and Prettier are configured but not enforced. No `husky` or `lint-staged` setup.

### 15. Poor Accessibility
- Icon-only buttons lack `aria-label`
- Modals don't trap focus or handle Escape key
- Connection status uses color only (no text alternative)
- Tables lack `scope` on headers and `aria-sort` on sortable columns

### 16. No Internationalization (i18n)
- All strings hardcoded in English. No framework for translation.

### 17. No Data Caching / Request Deduplication
- No HTTP caching, no time-based invalidation, no request deduplication. Parameters are fetched fresh every navigation.

### 18. No Input Validation on RPC URLs
- Users can connect to any RPC endpoint without URL validation — potential security risk.

---

## Priority Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Add a testing framework (Vitest) and write tests for RPC client, encoding, utils, and Redux slices |
| **P0** | Replace `any` types with proper interfaces; enable `strict: true` in tsconfig |
| **P0** | Cache `StargateClient` instead of recreating per query | [RESOLVED] |
| **P1** | Extract custom hooks (`useBlock`, `useTransaction`, etc.) to separate data fetching from rendering | [RESOLVED] |
| **P1** | Break down large page components into smaller sub-components | [RESOLVED] |
| **P1** | Add error boundaries and a 404 route | [RESOLVED] |
| **P1** | Add CI/CD (GitHub Actions) for lint + type-check + build | [RESOLVED] |
| **P2** | Add pre-commit hooks (husky + lint-staged) |
| **P2** | Fix accessibility issues (ARIA labels, focus trapping, keyboard nav) |
| **P2** | Add `React.lazy()` code splitting for routes |
| **P3** | Add i18n support |
| **P3** | Implement request caching/deduplication (e.g., TanStack Query) |

Would you like me to start implementing any of these improvements?