# CLAUDE.md

## Commands

- **Run Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Type Check**: `pnpm check`
- **Preview**: `pnpm preview`
- **Test**: `pnpm test`

## Project Overview

Dexplorer is a lightweight, frontend-only Cosmos blockchain explorer built with React, TypeScript, and Vite. It connects directly to Cosmos SDK chains via WebSocket RPC.

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **State**: Redux Toolkit & Zustand
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **RPC**: @cosmjs/stargate, @cosmjs/tendermint-rpc

## Coding Standards

### Core Principles
- **Immutability**: NEVER mutate objects. Return new state objects.
- **Type Safety**: strict `no-any` policy. Define proper interfaces.
- **Functional**: Use functional components and hooks.
- **Clean Code**: Functions < 50 lines, Files < 400 lines. Group by feature.

### Architecture & Pattern
- **Component Structure**: Group by feature. High cohesion.
- **State Management**:
  - Store `StargateClient` instances outside of Redux (non-serializable).
  - Use custom hooks for data fetching (`useBlock`, `useTransaction`).
- **Error Handling**: `try/catch` all async ops. Throw user-friendly errors.

### Workflow & Requirements
- **Git**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- **TDD**: Write tests first (Red -> Green -> Refactor).
- **Testing Goal**: 80% coverage (Unit, Integration, E2E).
- **Review**: Check against `REVIEW.md` issues before committing.
- **Security**: No hardcoded secrets. Sanitize inputs.

## Known Issues (Fix Priority)
- **High**: Silent error swallowing.
- **High**: Large components (`AccountDetail`, `ProposalDetail`, `Home`).
- **High**: Non-serializable data in Redux.
- **High**: Code duplication.
- **Medium**: Performance issues (re-renders, bundle size).
