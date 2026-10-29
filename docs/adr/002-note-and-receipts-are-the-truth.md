# ADR-002 — Current note state plus receipts are the truth; there is no operation ledger

**Status:** Accepted in RFC-001 §3 and ASM-03 · **Date:** 2026-10-29 · **Context:** RFC-001 §3

The plan of attack titles this ADR the other way: a ledger of operations as truth, and the note as a fold. That title is stale. A banner dated 2026-10-29 at the top of the plan records the supersession; the old paragraphs stay. This file follows RFC-001 §3.

## Context

The statement requires storing the content and the result of every valid first arrival, including a conflict. It never asks for a note to be rebuilt from history. What the core stores is the current note, `{id, text, revision}`, and the receipt registry. There is no event log.

## Decision

TODO (Gui)

## Alternatives considered

**An operation ledger, with the note as a fold.** Buys replay, and an audit that can rebuild the note from scratch. Costs a log that only grows and a read that is a fold. This is what the plan of attack chose on paper. Worth choosing the moment someone asks for revision 2 as it was, and the current text is not enough.

**The note alone, with no stored receipts.** Buys the smallest store. Costs the resend rule: the statement requires the original result back, including when that result was a conflict. Worth choosing only for a protocol that is idempotent by content rather than by `op_id`.

## Consequences

Good. A resend is a lookup. `query` reads one record. Nothing is replayed to answer either.

Bad. A note cannot be rebuilt. Receipts are a partial history: content and result, not an ordered log of applies. `id_reused` writes no row of its own. Deleting a receipt cannot be told apart from a receipt that never existed, and a resend after that deletion applies the operation again (RFC-001 §7, risk 1).

## Review trigger

TODO (Gui)
