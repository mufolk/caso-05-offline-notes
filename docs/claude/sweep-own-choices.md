# Sweep — own choices in RFC-001 that no REQ authorises

**Status:** raw material. Nothing here is numbered or named — the ASM ids, the wording in `reqs.md` and the test names are Gui's.
**Method:** read `docs/rfc/001-protocolo-de-sincronizacao.md` end to end and extracted every rule the statement does not decide: the blocks marked **Own choices**, plus rules stated in prose or in an implementer block that no REQ covers.
**Date:** 2026-10-28 · **Swept by:** Alfred

**Kind column:** `B` = behaviour a test can prove, so it belongs in the matrix with a Proof. `A` = architecture or an absence, which no test can observe — it belongs in an ADR or in the README's assumptions, with no Proof cell to fill.

---

## §2 — Goals and non-goals

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 1 | No authentication. The RFC already marks it "Own choice, not a quote". | The statement never mentions identity. Every other non-goal in that table carries a quote; this one cannot. | A |
| 2 | State in memory (`Map`); the official demonstration is a script that prints receipts, React screen is a bonus. | "Cliente e servidor podem ser simulados no mesmo processo" permits it, but does not prescribe the shape of the demo. DEL-02. | A |

## §3 — Data model

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 3 | No operation ledger. Truth = current note state + receipts. | The statement requires storing content and result per valid op. It never asks that a note be rebuildable. The price is declared: no replay. ADR-002. | A |
| 4 | The note is exactly `{id, text, revision}` — no timestamp, no author. | "Cada nota tem id, texto e um número de revisão." A clock field is refused on purpose, so there is nothing to resolve by. | B |
| 5 | Lookup is exact string equality — no trim, no case fold. `"  A  "` and `"A"` are two notes. | The statement says nothing about identity of keys. Listed as risk 5 in §7: the first test that looks like a bug. | B |
| 6 | The receipt stores the content that produced it, not just the result. | "guarde seu conteúdo e resultado" authorises storing it; comparing it on resend is the design choice that makes `id_reused` possible at all. | B |

## §4.1 — Predicates

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 7 | Closed key set. Any extra enumerable own key → `invalid`. | "confira os campos da operação" does not say whether unknown fields are tolerated. Way out is an explicit version (ADR-007). | B |
| 8 | The payload must be a plain object — `null`, array, `Date`, class instance all → `invalid`. | Not addressed at all. An empty array is the case that forces the rule. | B |
| 9 | No coercion and no trim of stored values: emptiness is checked on the trimmed string, the value is stored as sent. | Silent. This is what makes #5 observable. | B |
| 10 | `op_id` / `note_id`: any non-empty string after trim. UUID not required. | The official table uses `O1`, which rules out a format check. | B |
| 11 | `text: ""` is legal. | The statement says *texto*, not *texto não vazio*, and REQ-06 increments on identical text. | B |
| 12 | `base_revision` is a finite integer `>= 0`; `Number.isInteger` rejects strings, bigints, `null`, `undefined` before the range check. | "número de revisão" is the only wording. `-1` fails. | B |
| 13 | `-0` passes the predicate and is treated as `0` by `===` in the fingerprint. | Nowhere near the statement. Pure JavaScript edge, decided on purpose. | B |
| 14 | Content is `{note_id, base_revision, text}` compared with `===` per field. `op_id` is the key, never part of the fingerprint. | "com o mesmo conteúdo" does not define content. This definition is the whole of REQ-15 and REQ-16. | B |
| 15 | No length cap on `text`, `op_id`, `note_id` in the core; the bound lives at the HTTP edge. | Silent. An absence — nothing to assert. | A |

## §4.2 — Revision table

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 16 | One `conflict` for both sides of row 4: `base < revision` and `base > revision`. | "Quando a revisão base não corresponder à esperada" draws no distinction. A fifth result would be a protocol we were not given. Trigger declared: more than one server. | B |
| 17 | Base `0` on a live note is row 4 (`conflict`), not a reset and not a create. | The statement gives base 0 only as the create path. The naive `note?.revision ?? 0` collapses this row — the most likely silent divergence in a generated core. | B |
| 18 | The exact key list of each receipt type. | "Preserve o texto do servidor e a proposta do cliente" names what to preserve, not the keys. | B |
| 19 | The `note_not_found` receipt carries the client text only — no server text, no server revision, because they do not exist. | Not addressed. It is also what keeps this result distinct from `conflict`. | B |
| 20 | The token `note_not_found` itself. | "indique que a nota ainda não existe" names the branch, never the code. Open point 1 of `reqs.md`. | B |

## §4.3 — Unit of work and lock

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 21 | The core is `async`, so one `process(op, uow)` serves the in-memory UoW and a Postgres UoW. | The statement names no lock, transaction or async. | A |
| 22 | One global writer lock in the in-memory adapter — not per `op_id`, not per `note_id`. | Silent. Trigger already written: concurrent writers to distinct notes. | A |
| 23 | Hand-rolled mutex, no package, so `packages/core` keeps zero dependencies. | Silent. ADR-005. | A |
| 24 | Predicates run before the lock and before any I/O; they never touch the registry. | "Uma operação inválida não ocupa `op_id`" forbids the write; running before the lock is the stronger choice on top of it. | B |
| 25 | Registry lookup, note write and receipt write are one locked transaction. | Silent in memory. In the envelope the revision check and the write still have to be atomic, and §7 does not number that fact. The invariant is observable: no note without its receipt. | B |
| 26 | `query` takes the same global writer lock. In-memory `query` is deliberately stronger than a Postgres `query` at READ COMMITTED. | Silent. Single process, one writer, no concurrent readers to starve. The read is trivially consistent. The core suite cannot produce the skew a plain `SELECT` can. | A |
| 27 | `run` is not reentrant — the batch fold must be `for (op of ops) await process(op, uow)`, never `run(() => loop)`. | Silent. Re-entry is the race after a macrotask drain. The fold is held by review of `processAll`: the queue tests stay green either way, and a wrapped fold hangs rather than fails. `processAll` also owes REQ-18: a conflict in the middle, one result per operation, in order. | B |
| 28 | No `await` after the first write, because the in-memory UoW has no rollback. Compute the receipt, then write. | Silent. Postgres gets the pair free with `ROLLBACK`. | A |
| 29 | The empty `catch` on `tail`, so one rejection does not kill the queue while the caller still sees the error. | Silent. Covers a thrown callback only. A conflict is a value and never reaches this catch. REQ-18's batch is ASM-27; the mechanism is ADR-006. | B |

## §4.4 — Queue

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 30 | Empty queue returns `[]`. | "devolva um resultado por operação" says nothing about zero operations. | B |
| 31 | No snapshot at the start of a batch: op *k+1* sees note and registry after *k*. | The statement implies it by its own example; the RFC states that a snapshot would freeze `[O1, O2, O3]` into `note_not_found`. | B |

## §4.5 — Query

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 32 | `query` returns its own result type, not the operation taxonomy. | "Uma consulta separada" asks for a separate path, not a separate type. Putting a read in the op table would make `invalid` speak about an `op_id` it does not have. | B |
| 33 | `malformed` uses the same `note_id` predicate, takes no lock, and is not `invalid`. | Silent. | B |
| 34 | `absent` is not `note_not_found`: one is live, the other is a frozen receipt. A later create flips `query` and leaves the receipt alone. | Silent, and the easiest pair to collapse into one code. | B |
| 35 | `found` echoes the argument as `note_id`, with no separate `id`, no timestamp, no receipts. | Silent. | B |
| 36 | No list of notes, no `query(op_id)`. | "mostrar a nota" is singular. An absence. | A |
| 37 | **Allowance:** a client may use the revision from its own `accepted` receipt as the next base. A `conflict` receipt is never in this allowance. | The statement's live base is always `query`; the official table nonetheless runs on the accepted revision. Without this, the official sequence needs a `query` the statement never shows. | B |

## §5 — Taxonomy

| # | Own choice | What the statement leaves open | Kind |
|---|---|---|---|
| 38 | The token `accepted`. | The statement describes the write, never names the result. | B |
| 39 | `id_reused` is not stored; the first receipt stays the only row for that `op_id`. | "retorne id_reutilizado" says return, not store. | B |
| 40 | `id_reused` returns `{type, op_id}` only — never the stored receipt, never the other payload. | The statement says what to return on reuse: nothing. The tempting courtesy turns `op_id` into an oracle. Already has its own file: `docs/claude/adr-003-op-id-collision-notes.md`. | B |
| 41 | `invalid` returns `{type, errors}` with predicate names only, never values, and carries no `op_id` — the result must not look like a reservation. | Silent. The missing `op_id` is the semantic point. | B |

## §7 — Assumptions proper

| # | Assumption | Why it is not a rule | Kind |
|---|---|---|---|
| 42 | `op_id`s are practically unique; the predicates do not enforce UUID. | Risk 2. The official example's `O1` forbids enforcing the format. | A |
| 43 | Receipt retention is unbounded and undecided. Deleting one before a client resends applies that operation twice. | Risk 1. Feeds the second gatilho of ADR-003. | A |

---

## Counts

43 rows: **31 behaviour** (a test can prove them, so they want a Proof cell) and **12 architecture or absence** (no test possible — they belong to an ADR or to the README's assumptions).

Behaviour: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 27, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41.
Architecture or absence: 1, 2, 3, 15, 21, 22, 23, 26, 28, 36, 42, 43.

## Two things to decide while numbering

1. **Where they live.** A second table inside `docs/reqs.md` keeps one file for the reviewer; a sibling `docs/assumptions.md` keeps the REQ matrix purely a transcription of the statement, which is its stated method. The second reading is the more honest one — a REQ and an ASM do not have the same authority, and mixing them in one table blurs exactly the line the matrix exists to draw.
2. **`A` rows get no Proof cell.** Leaving the column blank for them looks like 13 unfinished rows. An explicit `—` plus the ADR number reads as a decision instead.

---

# The 31 behaviour rows, in Session 2 build order

Same rows, re-sorted into the order you meet them writing the core. Numbers are the ones above, so nothing has been renamed. Each stage names its **gate**: the thing that must be true before the next stage starts.

The order follows your own loop — you write the contract by hand, the AI writes the tests from the statement and from this list, you review them against both, then it implements.

## Stage 1 — `packages/contracts`: the shapes, before any logic

Written by hand. Every row here is a type decision, so it is cheapest now and expensive after the core exists.

| # | Rule | Breaks first at |
|---|---|---|
| 4 | The note is exactly `{id, text, revision}` — no timestamp, no author | the moment a "convenience" field is added to `found` |
| 38 | The token `accepted` | — |
| 20 | The token `note_not_found` | — |
| 18 | The exact key list of each receipt type | the `conflict` receipt, which must name both texts |
| 19 | The `note_not_found` receipt carries client text only | the temptation to echo a server text that does not exist |
| 41 | `invalid` is `{type, errors}` — predicate names, never values, and no `op_id` | an `op_id` on this result, which reads as a reservation |
| 40 | `id_reused` is `{type, op_id}` only | returning the stored receipt "to be helpful" |
| 32 | `query` has its own result type, outside the operation taxonomy | folding a read into the op union |
| 14 | Content is `{note_id, base_revision, text}`, `===` per field; `op_id` is the key, not the fingerprint | — |
| 5 | Lookup is exact string equality — no trim, no case fold, for notes *and* receipts | the first `.trim()` added for tidiness |

**Gate:** the five `ProcessResult` members and the three `QueryResult` members compile, and no result type carries a field the statement does not name.

## Stage 2 — predicates (§4.1), which run before everything

| # | Rule | Breaks first at |
|---|---|---|
| 8 | The payload must be a plain object — `null`, array, `Date`, class instance all `invalid` | an empty array, which has no extra keys |
| 7 | Closed key set; any extra enumerable own key is `invalid` | a client sending a harmless extra field |
| 10 | `op_id` / `note_id`: any non-empty string after trim; UUID not required | a format check that rejects the official `O1` |
| 11 | `text: ""` is legal | a non-empty check copied from habit |
| 12 | `base_revision` is a finite integer `>= 0` | `"1"` coerced, or `-1` accepted |
| 13 | `-0` passes and `===` treats it as `0` in the fingerprint | — |
| 9 | No coercion, no trim of stored values: emptiness on the trimmed string, stored as sent | the same `.trim()` as row 5, one layer down |
| 24 | Predicates run before the lock and never read the registry | checking the registry first, which burns the `op_id` |

**Gate:** an `invalid` payload leaves the registry untouched, and the next valid payload with that same `op_id` is accepted. That is REQ-13 proved from both sides.

## Stage 3 — registry lookup and idempotency (§4.3 step 2, §5)

| # | Rule | Breaks first at |
|---|---|---|
| 6 | The receipt stores the content that produced it, not only the result | storing the key alone, which makes `id_reused` impossible |
| 39 | `id_reused` is not stored; the first receipt stays the only row | overwriting the original on reuse |

**Gate:** same `op_id` plus same content returns the stored receipt with no apply; same `op_id` plus different content returns the code and writes nothing.

## Stage 4 — the revision table (§4.2)

| # | Rule | Breaks first at |
|---|---|---|
| 17 | Base `0` on a live note is `conflict`, not a reset and not a create | `note?.revision ?? 0`, which the RFC names and forbids |
| 16 | One `conflict` for both `base < revision` and `base > revision` | inventing a fifth result for the future base |

**Gate:** all four rows of the table are reachable, and every row writes a receipt — including the two that do not touch the note.

## Stage 5 — unit of work (§4.3)

| # | Rule | Breaks first at |
|---|---|---|
| 25 | Lookup, note write and receipt write are one locked transaction | an `await` slipped between the two `Map.set`s |
| 27 | `run` is not reentrant — the fold is `for (op of ops) await process(op, uow)` | wrapping the batch in `run`, which deadlocks. The suite cannot fail that wrap; it is review of `processAll` |
| 29 | The empty `catch` on `tail` keeps one rejection from killing the queue, while the caller still sees the error | a rejection that poisons `tail`. The two calls prove that. REQ-18 is the batch on row 27 |

**Gate:** the invariant holds over a random sequence — no note without its receipt, no receipt whose apply is missing.

## Stage 6 — queue (§4.4)

| # | Rule | Breaks first at |
|---|---|---|
| 31 | No snapshot at the start: op *k+1* sees the state after *k* | reading the notes map once before the loop |
| 30 | Empty queue returns `[]` | — |

**Gate:** the official `[O1, O2, O3]` sequence produces accepted, accepted, `conflict` — not three `note_not_found` receipts.

## Stage 7 — query (§4.5)

| # | Rule | Breaks first at |
|---|---|---|
| 33 | `malformed` uses the same `note_id` predicate, takes no lock, and is not `invalid` | reusing `invalid` for a read |
| 34 | `absent` is not `note_not_found` — one is live, the other is a frozen receipt | collapsing the two into one code |
| 35 | `found` echoes `note_id`; no separate `id`, no timestamp, no receipts | — |
| 37 | A client may use the revision from its own `accepted` receipt as the next base; a `conflict` receipt never qualifies | treating the frozen conflict revision as a live base |

**Gate:** the full official table runs end to end, including the resend of O3 still showing revision 2 while `query` shows 3.

---

**Why this order.** Shapes first because every later stage writes against them. Predicates second because they run first at runtime and because row 24 — nothing is stored before they pass — is the rule that makes the rest safe to get wrong once. The revision table waits until the registry is real, otherwise Stage 4 tests have to fake a first arrival. Query is last because it is the only part that reads without writing, and because row 37 cannot be proved until the whole official sequence exists.
