# ADR-004 — A receipt is immutable; query is a separate path

**Status:** Accepted in RFC-001 §4.5 and §5 · **Date:** 2026-10-29 · **Context:** RFC-001 §4.5, §5

## Context

The statement says the result of a resend may contain stale data, because it is the receipt of the original operation, and that a separate query must show the note as it is now. The demo's steps 7 and 8 are that pair on purpose: the resent conflict still says revision 2, and `query` at that moment returns 3.

## Decision

TODO (Gui)

## Alternatives considered

**Refresh the receipt when it is read.** Buys a client that can treat any response as current. Costs the sentence that separates the two, and makes "the original result" depend on when you asked. Worth choosing so a mobile client can have one endpoint.

**One result union for writes and reads.** Buys a single decoder. Costs `invalid` having to talk about an `op_id` a query does not have, and collapses `absent` into `note_not_found`. Those two are different: one is a live read, the other is a stored receipt that stays stored after the note is created (ASM-34). Worth choosing to keep the client's switch small.

## Consequences

Good. A given `op_id` is written once. `query` can move on without rewriting history. The statement's own example needs no special case.

Bad. A client that renders the receipt and never calls `query` shows stale text and looks fine. The next `base_revision` may be taken from that client's own `accepted` receipt (ASM-37), and that is safe only until another writer lands. A revision on a `conflict` receipt is never a safe base. Using it after the note has moved is another conflict, which is this decision holding, not a bug.

## Review trigger

TODO (Gui)
