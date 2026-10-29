# ADR-006 — Domain failures are values, not exceptions

**Status:** Accepted in the `ProcessResult` union · **Date:** 2026-10-29 · **Context:** RFC-001 §5

## Context

The statement wants one result per operation, in the order received, and an error or a conflict must not stop the rest of the queue. `process` returns a `ProcessResult`. `processAll` folds the queue and returns an array of the same length. A conflict takes the normal path. The empty `catch` on the in-memory lock covers a throw; after the predicates, that throw is a bug in `process`, not an outcome the statement names (ASM-29).

## Decision

TODO (Gui)

## Alternatives considered

**Throw on conflict and on invalid input.** Buys a shorter call site and a stack trace. Costs a queue that stops unless every caller remembers to catch, which is how "an error does not block the next" gets lost. Worth choosing where the HTTP layer already turns throws into status codes and each request carries one operation.

**Throw on `invalid`, return the rest.** Buys a hard failure for a malformed caller and a value for a domain outcome. Costs two channels for "this did not apply", and a batch loop that has to catch and switch. Worth choosing if a malformed payload is a bug in the caller rather than a row the queue must report.

## Consequences

Good. Conflict, `note_not_found`, `id_reused`, and `invalid` are cases a caller has to handle to exhaust the union. The batch continues because a result came back, not because a catch swallowed it.

Bad. Every call is a switch. A throw is outside that promise: the "one result per operation" claim is about domain outcomes. The union also does not stop a wider object at the boundary where excess-property checks do not fire, which is how a leaked receipt would typecheck (ASM-40).

## Review trigger

TODO (Gui)
