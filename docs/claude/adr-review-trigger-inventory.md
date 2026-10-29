# Inventory of raw material for the review triggers

**Status:** raw material. No *Review trigger* field is written here — all of them stay blank, for Gui.
**Date:** 2026-10-28
**Source:** RFC-001 §7 (risks), pending items from Session 0, and the conversations of 27 and 28 October.
**Imported into the repo:** 2026-10-28, from the project workbench. English, content unchanged except where a later decision is noted.

Each block carries the **candidate observable fact**, **what the decision starts to cost** once that fact happens, and the **way out** discussed. The three things the field needs. What is missing is Gui choosing, drafting, and estimating the migration cost.

---

## ADR-001 — optimistic concurrency by revision

**Candidate observable fact:** starvation on a contested note. Whoever is resolving a conflict loses the race repeatedly, because every resend arrives already stale.
Recorded as risk 4 in RFC-001 §7.

**What it starts to cost:** the user who worked the most is the one who loses the most work. The friction stops being "resolve a conflict" and becomes "never manage to save".

**Ways out discussed:** none yet. Obvious candidates to evaluate — a queue per note, a short edit lease, or assisted merge with human confirmation. Worth measuring first: how many attempts until a conflict is resolved.

---

## ADR-002 — source of truth

**Divergence, now settled.** The plan of attack says "operation ledger as truth; note state is a projection". RFC-001 §3 decided the opposite: there is no ledger, the receipts already store every valid operation with its content and result. ADR-002 must describe the decision in the RFC, not the one in the plan — the plan's title is the stale one. Numbered as ASM-03 in `docs/assumptions.md`.

**Candidate observable fact:** a replay or audit requirement appearing that demands rebuilding a note from scratch. Today that is not possible — it is the price declared in the RFC.

**What it starts to cost:** the absence of the ledger stops being a saving and becomes a debt; recomposing history from receipts is possible but partial.

**Way out discussed:** none yet.

---

## ADR-003 — idempotency by receipt plus fingerprint

Already has its own file: `docs/claude/adr-003-op-id-collision-notes.md` (`op_id` collision between clients, authn vs authz, *defense in depth*).

**Second observable fact, not yet noted there:** receipts grow forever, and nobody knows how long they must be kept. Risk 1 of RFC-001 §7. Numbered as ASM-43.

**What it starts to cost:** deleting a receipt before its client resends makes the operation apply twice. Idempotency has a shelf life equal to the retention window.

**Ways out discussed:** none. The retention window still has to be decided, along with what happens to a resend that falls outside it.

**Third observable fact, not yet noted there:** a receipt or a query starts returning `base_revision`. Numbered against ASM-13. Today `accepted` carries no `base_revision`, and `===` treats `-0` as `0`, so a write that normalized `-0` to `0` is invisible. The three calls in ASM-13's Proof cell still pass. "The receipt row keeps the number as sent" protects a seam that does not exist. `check` returning `Object.is(base_revision, -0)` is the predicate's return value, and it is already proved; it says nothing about the row. ASM-13 is the second thing that event touches: publishing the field makes "the receipt row keeps the number as sent" falsifiable, and that Proof cell owes a fourth call, which is what can take the row off `partial`.

**What it starts to cost:** the moment that field is echoed, a normalized row and a preserving row disagree, and a client that sent `-0` can be shown `0`. The retry is unaffected, because the fingerprint collapses the two either way. The lie is only in the echo.

**Way out discussed:** decide at the write, before any client has been shown the number. The row keeps the bits and the new field echoes them, or the predicate normalizes `-0` to `0` on the way in so the row and the fingerprint cannot diverge. The migration is that one policy. The *Review trigger* field stays unwritten; this block is the ingredients.

---

## ADR-005 — the boundary between core and envelope

**Divergence to settle.** The Session 0 pending item says the scope is core, Next and Docker; **no Nest and no Postgres**, which become documented seams in ADR-005. The plan of attack describes ADR-005 with Nest and Postgres built. Decide which version holds before writing. RFC-001 §8 currently names NestJS plus a React screen, with the screen first in the cut order.

**Candidate observable fact (from the conversation about `Result`):** the discriminated union of `Result` needing to be persisted. In Postgres the receipt fits as `jsonb` with a constraint per type — but then the rule lives in two places.

**What it starts to cost:** the promise of "zero dependencies in the core" still stands, but the boundary gains a point of duplication that has to be kept in sync.

**Way out discussed:** none.

**Second candidate observable fact (ASM-45, the rejected `index` stamp).** Results cross a boundary that does not guarantee order. "One in-memory call, nothing between the call and the caller" is a property of the core's current packaging, not of the protocol. A JSON array preserves order, so a single HTTP call still holds. What breaks the correlation is a batch split across requests, a queue, or any client that merges responses.

**What it starts to cost:** position stops being a key the caller can trust. `invalid` carries no `op_id`, and one batch can return two results with the same `op_id`, so neither failure has a key left once order is gone.

**Way out discussed:** the server-stamped `index` already written in full in RFC-001 §4.4, on every member including `invalid`. The migration is adding that field. It is not a redesign. The migration-cost estimate is still Gui's, as is the *Review trigger* field itself — this block is the ingredients, not the field.

**Pointer, already placed.** ASM-45 in `docs/assumptions.md` cites ADR-005. The divergence above does not hold that pointer: Nest and Postgres built, or seams only, the fact still lives on this seam. ASM-21, ASM-22 and ASM-28 remain without a pointer until ADR-008 / ADR-009 is settled.

---

## ADR-008 and ADR-009 — invariants in Postgres and optimistic lock on UPDATE

**Open question before any trigger:** if Postgres left the scope, these two ADRs describe code that does not exist. Three paths, and it is Gui's decision:
1. keep them as ADRs of *intent*, with an explicit status of "decided, not implemented";
2. fold them into ADR-005 as seams;
3. cut them.

Until this is settled, ASM-21, ASM-22 and ASM-28 in `docs/assumptions.md` deliberately carry no ADR pointer.

**Related observable fact (risk 2 of RFC-001 §7):** the revision check and the write have to be atomic. Two concurrent requests on the same note can both pass the revision comparison. In memory it is free; in the envelope it is not. That is exactly what ADR-009 exists to solve.

---

## ADR-010 — the LLM proposes, it does not decide

Has a trigger sketched in the plan of attack, but it is a third party's sketch, not Gui's text:
accepted-proposal rate below some threshold → the feature costs more in confusion than it delivers in convenience → turn it off by a flag, which already exists because the stub is the default.

**What is missing:** the numeric threshold, and how it would be measured in a delivery with no telemetry. A trigger that is not observable in practice is decoration — worth Gui saying so out loud in the video, or choosing another fact.

---

## Related pending item, already noted in Session 0

"Three next steps, each born from the review trigger of an ADR" — planned for Session 4. The three come out of this list.
