# Assumptions (ASM) — Case 05

**What this file is.** Every rule the solution obeys that the statement does **not** decide. The REQ matrix in `docs/reqs.md` is a transcription of the enunciado: each row carries a verbatim quote and has the statement's authority. These rows have no quote, by definition — they are choices, and a reviewer is entitled to disagree with any of them.

**Method.** `docs/rfc/001-protocolo-de-sincronizacao.md` read end to end: every block marked **Own choices**, plus rules stated in prose or in an implementer block that no REQ covers. Raw sweep and the Session 2 build order: `docs/claude/sweep-own-choices.md`.

**Ids.** `ASM-nn` is sweep row `nn`. The numbering is the sweep's, so the build-order tables need no rename. Gaps in a section are rows that live in another section.

**Columns.** *What the statement leaves open* is the column that proves the row is an assumption and not a requirement someone forgot to quote. *Kind*: `B` = behaviour a test can prove, so the Proof cell is owed. `A` = architecture or an absence, which no test can observe; its Proof cell reads `—` and the justification lives in an ADR or in the README.

**Counts.** 43 rows: 31 `B`, 12 `A`.
`B`: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 27, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41.
`A`: 1, 2, 3, 15, 21, 22, 23, 26, 28, 36, 42, 43.

---

## Goals and non-goals (RFC §2)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-01 | No authentication. | The statement never mentions identity. Every other non-goal in the RFC's table carries a quote; this one cannot. | A | §2 · README limits | — |
| ASM-02 | State in memory (`Map`). The official demonstration is a script that runs a sequence and prints receipts; a React screen is a bonus. | "Cliente e servidor podem ser simulados no mesmo processo" permits it without prescribing the shape of the demo. DEL-02. | A | §2 · ADR-005 | — |

## Data model (RFC §3)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-03 | No operation ledger. Truth is the current state of each note plus the receipts. A note cannot be rebuilt from scratch. | The statement requires storing conteúdo and result for every valid first arrival. It never asks that a note be replayable. | A | §3 · ADR-002 | — |
| ASM-04 | The note is **exactly** `{id, text, revision}` — no timestamp, no author. The entity has no clock field to resolve by. | The quoted obligation is the three fields (pending REQ-22). The exclusion, and the reason for it, is the choice. | B | §3 · REQ-22 | |
| ASM-05 | Lookup of notes and receipts is exact string equality — no trim, no case fold. `"  A  "` and `"A"` are two notes. | Nothing in the statement addresses identity of keys. Risk 5 of §7: the first test that looks like a bug and is not. | B | §3, §4.5 · §7 risk 5 | |
| ASM-06 | The receipt stores the conteúdo that produced it, not only the result. | "guarde seu conteúdo e resultado" authorises storing it; comparing it on a second arrival is the design choice that makes `id_reutilizado` possible at all. | B | §3, §5 | |

## Predicates (RFC §4.1)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-07 | Closed key set. Any extra enumerable own key is `invalid`. | "confira os campos da operação" does not say whether unknown fields are tolerated. Way out is an explicit version and a new accepted key set. | B | §4.1 · ADR-007 | |
| ASM-08 | The payload must be a plain object. `null`, an array, a `Date`, a class instance are all `invalid`. | Not addressed. An empty array is the case that forces the rule: it has no extra keys. | B | §4.1 | |
| ASM-09 | No coercion and no trim of stored values: emptiness is checked on the trimmed string, the value is stored as sent. | Silent. This is what makes ASM-05 observable. | B | §4.1 | |
| ASM-10 | `op_id` / `note_id`: any non-empty string after trim. UUID is not required. | The official table uses `O1`, which rules out a format check. | B | §4.1 | |
| ASM-11 | `text: ""` is legal. | The statement says *texto*, not *texto não vazio*, and REQ-06 increments on identical text. | B | §4.1 | |
| ASM-12 | `base_revision` is a finite integer `>= 0`. `Number.isInteger` rejects strings, bigints, `null` and `undefined` before the range check. | "número de revisão" is the only wording. `-1` fails. | B | §4.1 | |
| ASM-13 | `-0` passes the predicate and `===` treats it as `0` in the fingerprint. | Nowhere near the statement. A JavaScript edge, decided rather than discovered. | B | §4.1 | |
| ASM-14 | Conteúdo is `{note_id, base_revision, text}`, compared with `===` per field. `op_id` is the key, never part of the fingerprint. | "com o mesmo conteúdo" never defines conteúdo. This definition is the whole of REQ-15 and REQ-16. **Two halves:** the shape is a type, written in Stage 1; the comparison rule is what the Proof cell owes. | B | §4.1 | |
| ASM-15 | No length cap on `text`, `op_id` or `note_id` in the core. The bound lives at the HTTP edge, where body size is already limited. | Silent. An absence — nothing to assert. | A | §4.1 · ADR-005 | — |

## Revision table (RFC §4.2)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-16 | One `conflito` covers both sides of the mismatch: `base < revision` and `base > revision`. | "Quando a revisão base não corresponder à esperada" draws no distinction. A fifth result would be a protocol we were not given. Trigger: more than one server. | B | §4.2 | |
| ASM-17 | Base `0` on a live note is the mismatch row — `conflito`, not a reset and not a create. | The statement gives base 0 only as the create path. `note?.revision ?? 0` collapses this row silently. | B | §4.2 | |
| ASM-18 | The exact key list of each receipt type. | "Preserve o texto do servidor e a proposta do cliente" names what to preserve, not the keys. | B | §4.2 | |
| ASM-19 | The `nota_inexistente` receipt carries the client text only — no server text, no server revision, because neither exists. | Not addressed. It is also what keeps this result distinct from `conflito`. | B | §4.2 | |
| ASM-20 | The token `nota_inexistente`. | "indique que a nota ainda não existe" names the branch, never the code. Open point 1 of `docs/reqs.md`. | B | §4.2, §5 | |

## Unit of work and lock (RFC §4.3)

ADR pointers are deliberately absent from ASM-21, ASM-22 and ASM-28: they land on ADR-008 / ADR-009 territory, and whether those ADRs survive as written, fold into ADR-005, or are cut is still open. Session 4 adds the pointer once the ADR exists.

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-21 | The core is `async`, so one `process(op, uow)` serves the in-memory unit of work today and a Postgres one in the envelope. | The statement names no lock, no transaction and no async. | A | §4.3 | — |
| ASM-22 | One global writer lock in the in-memory adapter — not per `op_id`, not per `note_id`. | Silent. Trigger already written: concurrent writers to distinct notes. | A | §4.3 | — |
| ASM-23 | Hand-rolled mutex, no package, so `packages/core` keeps zero dependencies. | Silent. | A | §4.3 · ADR-005 | — |
| ASM-24 | Predicates run before the lock and before any I/O; they never read the registry. | "Uma operação inválida não ocupa `op_id`" forbids the write. Running before the lock is the stronger choice laid on top of it. | B | §4.1, §4.3 | |
| ASM-25 | Registry lookup, note write and receipt write are one locked transaction. | Silent in memory; risk 2 of §7 in the envelope. Observable as an invariant: no note without its receipt. | B | §4.3 | |
| ASM-26 | `query` takes the same lock, purely so the in-memory and Postgres adapters do not diverge. | Silent. In memory the window it guards does not exist. | A | §4.3, §4.5 | — |
| ASM-27 | `run` is not reentrant. The batch fold is `for (op of ops) await process(op, uow)`, never `run(() => loop)`. | Silent. Getting it wrong deadlocks the queue rather than misbehaving. | B | §4.3 | |
| ASM-28 | No `await` after the first write, because the in-memory unit of work has no rollback. Compute the receipt, then write. | Silent. Postgres gets the pair free with `ROLLBACK`. | A | §4.3 | — |
| ASM-29 | The empty `catch` on `tail` keeps one rejection from killing the queue, while the caller still sees the error. | Silent. Serves REQ-18; the mechanism is the choice. | B | §4.3 | |

## Queue (RFC §4.4)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-30 | An empty queue returns `[]`. | "devolva um resultado por operação" says nothing about zero operations. | B | §4.4 | |
| ASM-31 | No snapshot at the start of a batch: operation *k+1* sees the note and the registry as of *k*. | Implied by the statement's own example; a snapshot turns the official `[O1, O2, O3]` into three frozen `nota_inexistente` receipts. | B | §4.4 | |

## Query (RFC §4.5)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-32 | `query` returns its own result type, outside the operation taxonomy. | "Uma consulta separada" asks for a separate path, not a separate type. Folding a read into the op union would make `invalid` speak about an `op_id` it does not have. | B | §4.5 | |
| ASM-33 | `malformed` applies the same `note_id` predicate, takes no lock, and is not `invalid`. | Silent. There is no `op_id` to resend; the caller fixes the argument. | B | §4.5 | |
| ASM-34 | `absent` is not `nota_inexistente`. One is live, the other is a stored receipt. A later create flips `query` and leaves the receipt alone. | Silent, and the easiest pair in the protocol to collapse into one code. | B | §4.5 | |
| ASM-35 | `found` echoes the argument as `note_id`. No separate `id`, no timestamp, no receipts. | Silent. | B | §4.5 | |
| ASM-36 | No list of notes. No `query(op_id)`. | "mostrar a nota" is singular. An absence. | A | §4.5 | — |
| ASM-37 | **Allowance:** a client may send its next operation with `base_revision` taken from its own `accepted` receipt. A `conflito` receipt never qualifies — its revision is frozen. | The statement's live base is always `query`, yet the official table runs on the accepted revision. Without this allowance the statement's own example needs a `query` it never shows. | B | §4.5 | |

## Taxonomy (RFC §5)

| ID | Rule | What the statement leaves open | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-38 | The token `accepted`. | The statement describes the write and never names the result. | B | §5 | |
| ASM-39 | `id_reutilizado` is not stored. The first receipt remains the only row for that `op_id`. | "retorne id_reutilizado" says return, not store. | B | §5 | |
| ASM-40 | `id_reutilizado` returns `{type, op_id}` only — never the stored receipt, never the colliding payload. | The statement says what to return on reuse: nothing. The courteous version turns `op_id` into an oracle over other clients' text. | B | §5 · ADR-003 | |
| ASM-41 | `invalid` returns `{type, errors}` with predicate names only, never values, and carries no `op_id` — the result must not read as a reservation. | Silent. The missing `op_id` is the semantic point. | B | §5 | |

## Assumptions proper (RFC §7)

| ID | Assumption | Why it is not a rule | Kind | Lives in | Proof |
|---|---|---|---|---|---|
| ASM-42 | `op_id`s are practically unique. The predicates do not enforce UUID format. | Risk 2. The official example's `O1` forbids enforcing the format. | A | §7 risk 2 | — |
| ASM-43 | Receipt retention is unbounded and undecided. Deleting a receipt before its client resends applies that operation twice. | Risk 1. Feeds the second gatilho of ADR-003. | A | §7 risk 1 · ADR-003 | — |

---

## Open items

1. **REQ-22 is owed in `docs/reqs.md`.** "Cada nota tem id, texto e um número de revisão." is a sentence of the enunciado carrying an obligation, and the matrix does not yet number it. ASM-04 cites it and records only the exclusion — no timestamp, no author. Until REQ-22 exists, ASM-04 points at nothing. This closes open point 2 of `reqs.md`, and it closes it in the matrix, not here. Mine to flag, Gui's to write.
2. **Two Proof cells that Stage 1 will not fill.** ASM-05 is pure behaviour, with no type to write. ASM-14 has a type half — the conteúdo shape, written in Stage 1 — and a behaviour half, the `===` per field with `op_id` excluded. Nine of Stage 1's ten rows are shapes; these two still owe tests.
3. **ADR pointers deferred** for ASM-21, ASM-22 and ASM-28, pending the ADR-008 / ADR-009 decision recorded in `claude/notas-gatilhos-adr-inventario.md`.
4. **ASM-03 and the plan's ADR-002 title.** `docs/plano-de-ataque.md` describes ADR-002 as "ledger of operations as truth; note state is a projection". RFC-001 §3 decided the opposite, and ASM-03 follows the RFC. The plan is reference material and is left untouched; the correction belongs in the ADR-002 title when it is written in Session 4.
