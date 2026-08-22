# Bootstrap and Request Logging Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make startup database work retryable and bounded while preventing credentials and tokens from reaching request logs.

**Architecture:** Keep bootstrap orchestration responsible for database readiness and fail startup when readiness is exhausted. Run activity generation in one CLS transaction per month from inside the task's retry boundary. Sanitize request metadata at the middleware logging boundary, then align Prisma packages and reduce eager MariaDB pool connections.

**Tech Stack:** NestJS 11, Jest 29, Prisma ORM 7.8, `@nestjs-cls/transactional`, MariaDB driver adapter, Express.

**Spec:** User-approved change list in the 2026-08-22 task conversation.

## Global Constraints

- Preserve existing idempotency through generation logs and `createMany({ skipDuplicates: true })`.
- Preserve non-sensitive request metadata without mutating the Express request.
- Redact authorization, cookie, token, secret, API-key, and password representations recursively.
- Pin `prisma`, `@prisma/client`, and `@prisma/adapter-mariadb` to exactly `7.8.0`.
- Do not modify unrelated failing Nest test scaffolds.

---

### Task 1: Bootstrap failure and timing

**Files:**
- Modify: `src/app-bootstrap.service.ts`
- Test: `src/app-bootstrap.service.spec.ts`

**Interfaces:**
- Consumes: `PrismaService.$queryRawUnsafe`, `ActivityTask.generateActivityRecordsForAllStudents`, `StudentTask.changeSchedule`.
- Produces: a rejected `onApplicationBootstrap()` when DB readiness is exhausted and start/completion duration logs for each bootstrap task.

- [ ] Write tests asserting the original DB error rejects bootstrap and that successful tasks log start/completion.
- [ ] Run `npm test -- --runInBand src/app-bootstrap.service.spec.ts` and observe the expected failures.
- [ ] Rethrow after logging in `onApplicationBootstrap()` and add a small timed-task helper using `Date.now()`.
- [ ] Run the focused test and confirm it passes.

### Task 2: Monthly activity transactions inside retry boundary

**Files:**
- Modify: `src/activity/activity.task.ts`
- Create: `src/activity/activity.task.spec.ts`

**Interfaces:**
- Consumes: injected `TransactionHost<TransactionalAdapterPrisma>` and existing activity/schedule services.
- Produces: one `withTransaction()` call per target month, with transaction-start errors caught by the existing retry handler.

- [ ] Write tests for per-month transactions, skipping an existing generation log, and retry scheduling after `withTransaction()` rejects.
- [ ] Run `npm test -- --runInBand src/activity/activity.task.spec.ts` and observe the expected failures.
- [ ] Remove the method decorator, inject `TransactionHost`, and move each month's check/create/log operations into `withTransaction()`.
- [ ] Run the focused test and confirm it passes.

### Task 3: Request-log secret redaction

**Files:**
- Create: `src/common/request-log-sanitizer.ts`
- Create: `src/common/request.middleware.spec.ts`
- Modify: `src/common/request.middleware.ts`

**Interfaces:**
- Consumes: URL, Express headers, and JSON-compatible body data.
- Produces: `sanitizeRequestLogData()` returning a non-mutating sanitized copy with `[REDACTED]` values.

- [ ] Write a malicious-input test covering bearer authorization, cookies, query tokens, nested passwords, token aliases, arrays, and API keys plus a legitimate control.
- [ ] Run `npm test -- --runInBand src/common/request.middleware.spec.ts` and observe raw secrets in the logged payload.
- [ ] Implement recursive key normalization/redaction and use it in `RequestMiddleware` before logging.
- [ ] Rerun the focused test and confirm both malicious and legitimate controls pass.

### Task 4: Prisma and MariaDB configuration

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/configs/prisma/prisma.service.ts`
- Regenerate: `src/generated/prisma/**`

**Interfaces:**
- Produces: Prisma packages pinned to `7.8.0`; MariaDB pool configured with `connectionLimit: 10`, `minimumIdle: 2`, `connectTimeout: 10000`, and `acquireTimeout: 10000`.

- [ ] Install exact Prisma 7.8.0 package versions.
- [ ] Update the adapter pool options.
- [ ] Run `npm run prisma:generate` and `npm run build`.
- [ ] Run `npm ls prisma @prisma/client @prisma/adapter-mariadb` and confirm all three versions are 7.8.0.

### Task 5: Verification

**Files:**
- Inspect all changed files and generated output.

**Interfaces:**
- Produces: evidence that startup behavior, transaction retry coverage, redaction, type checking, and formatting work together.

- [ ] Run all focused new tests in one Jest command.
- [ ] Run `npm test -- --runInBand` and separately report unrelated existing failures.
- [ ] Run `npm run build`, Prettier check, `git diff --check`, and inspect `git diff`.
- [ ] Re-run the request-log security trigger and confirm no supplied secret appears while ordinary fields remain.
