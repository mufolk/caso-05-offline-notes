# ADR-005 — The core does not import a framework or a database; the envelope is an adapter

**Status:** Accepted as a boundary; the adapter is not built · **Date:** 2026-10-29 · **Context:** RFC-001 §2, §8

## Context

The statement does not ask for disk or HTTP. The vacancy does. `process` and `query` take a `UnitOfWork` they do not own. The in-memory adapter is the only implementation. `packages/core/package.json` depends on `contracts`, the types package in this repo, and on nothing else. No Nest, Postgres, Zod, or model client is imported.

The plan's ADR-008 and ADR-009 are folded into this file as seams, decided 2026-10-29. They are not filed. There is no schema in the repo, so neither a Postgres constraint nor `UPDATE … WHERE revision = $base` is an accepted decision about code that exists. Both are named here as the shape of the unbuilt adapter: an invariant would live in a constraint, and the optimistic lock would be that `UPDATE`, not a distributed lock. They become their own ADRs when an adapter is written. ASM-21, ASM-22, ASM-26 and ASM-28 point here.

## Decision

The core may not know a framework, a database, a validator, or a model client, and a reviewer checks that by opening `packages/core/package.json`, whose only dependency is `contracts`.

## Alternatives considered

**Write the rules inside a Nest service.** Buys one stack the vacancy recognizes, and one place for the revision check and the SQL. Costs a suite that needs a process, and a protocol that is hard to tell apart from the framework. Worth choosing for a four-hour submission graded on "did you use Nest".

**Build the Postgres adapter in this delivery and keep the core pure.** Buys the lock as code rather than as a sentence. Costs the hours the cut rule exists to protect. Worth choosing if the claim in the video is "this is how I would ship it" and the core is already green, which it is. The React screen is first in the RFC's cut order; Nest was meant to stay. Tonight the whole envelope was cut so the ADRs would exist.

## Consequences

Good. `pnpm test:core` is the whole statement: no Docker, no database, no API key. A later adapter implements the same four methods.

Bad. "Zero runtime dependencies" survives opening the file. "Zero entries under `dependencies`" does not: `contracts` is one. There is no second copy of the types to drift, because there is no adapter. The in-memory lock is stronger than a Postgres read at READ COMMITTED would be (ASM-26), and the core suite cannot show that difference. Position in the batch is the only correlation key (ASM-45); that stops being true if results cross a boundary that does not preserve order.

## Review trigger

Revisit at the first insert a persisted constraint accepts and `check` in `predicates.ts` would reject. The instrument is a schema and that insert. This delivery has neither, so the disagreement cannot be observed here. The exit is one source: the predicate stays the rule, and the constraint is generated from the closed key set or it is not shipped. Migration is hours to regenerate on an empty store, and a backfill if a violating row has already landed. Caught at the first disagreement, it stays hours. The atomicity seam and the READ COMMITTED seam are not this trigger.
