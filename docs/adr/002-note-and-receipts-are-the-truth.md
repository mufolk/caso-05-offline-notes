# ADR-002 — Current note state plus receipts are the truth; there is no operation ledger

**Status:** Accepted in RFC-001 §3 and ASM-03 · **Date:** 2026-10-29 · **Context:** RFC-001 §3

The plan of attack titles this ADR the other way: a ledger of operations as truth, and the note as a fold. That title is stale. A banner dated 2026-10-29 at the top of the plan records the supersession; the old paragraphs stay. This file follows RFC-001 §3.

## Context

The statement requires storing the content and the result of every valid first arrival, including a conflict. It never asks for a note to be rebuilt from history. What the core stores is the current note, `{id, text, revision}`, and the receipt registry. There is no event log.

`query` loads the note and does not look at the registry. What you lose is replay as an operation. The bytes of past accepted states are still sitting on `accepted` receipts (`text` and `revision`), keyed by `op_id`, with no scan and no fold, and an `id_reused` attempt has no row at all. "Unrecoverable" means the server will not rebuild the note. It does not mean those accepted texts have been deleted.

## Decision

The server answers `query` from the current note alone, `{id, text, revision}`, and that record is the live authority; an earlier revision is not a read the server offers, because there is no operation ledger and the receipts are not a fold.

## Alternatives considered

**An operation ledger, with the note as a fold.** Buys replay, and an audit that can rebuild the note from scratch. Costs a log that only grows and a read that is a fold. This is what the plan of attack chose on paper. Worth choosing the moment someone asks for revision 2 as it was, and the current text is not enough.

**The note alone, with no stored receipts.** Buys the smallest store. Costs the resend rule: the statement requires the original result back, including when that result was a conflict. Worth choosing only for a protocol that is idempotent by content rather than by `op_id`.

## Consequences

Good. A resend is a lookup. `query` reads one record. Nothing is replayed to answer either.

Bad. A note cannot be rebuilt. Receipts are a partial history: content and result, not an ordered log of applies. `id_reused` writes no row of its own. Deleting a receipt cannot be told apart from a receipt that never existed, and a resend after that deletion applies the operation again (RFC-001 §7, risk 1).

## Review trigger

The field says plainly that no replay path is designed. The fact is a requirement landing that asks for the note at an earlier revision, or for the order of applies. Nothing here measures that ask. Receipts cannot be promoted into the missing path: they are keyed by `op_id`, `id_reused` writes no row, and they are not a log of applies. The exit is the ledger this ADR rejected, with the note as a fold of it. That is a new store and a new read, not a backfill — the history that was never written is already gone. Migration is the ledger plus every reader that today uses the current note, paid once, when the requirement is real.
