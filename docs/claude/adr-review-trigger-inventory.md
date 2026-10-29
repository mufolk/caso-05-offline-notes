# Inventory of raw material for the review triggers

**Status:** raw material from before the fields were written. Decision and Review trigger now live in `docs/adr/`, filled 2026-10-29. This file is not those fields. ADR-008 and ADR-009 are not filed: folded into ADR-005 as seams on 2026-10-29. One correction in the ADR-001 block: starvation is risk 3 of RFC-001 §7, not risk 4. Risk 4 is the model, ADR-010.
**Date:** 2026-10-28
**Source:** RFC-001 §7 (risks), pending items from Session 0, and the conversations of 27 and 28 October.
**Imported into the repo:** 2026-10-28, from the project workbench. English, content unchanged except where a later decision is noted.

## Settled 2026-10-29, before any Decision or Review trigger sentence

Checked against the repo in this session. `packages/core/src/memory.ts` is in the tree. `packages/core/package.json` depends on `contracts` and on nothing else. No Zod import exists in the repo. Eight ADR files are filed (`001`–`007` and `010`).

**The plan is not left untouched.** A banner at the top of `docs/plano-de-ataque.md` demotes two Oct 24 claims. The body of the plan was not rewritten.

1. **Ledger.** RFC-001 §3 wins. No operation ledger. ADR-002 follows the RFC. The plan's row 002 is the stale title.
2. **Nest and Postgres built.** ADR-005 wins for this delivery, and it does not win by citing RFC-001 §8. That section still schedules NestJS and says Nest stays if time runs short. The cut on 2026-10-29 took the whole envelope, including Nest, on purpose. The banner says so. A one-line "superseded by RFC-001" on both points would have been false on the second.
3. **008 and 009 fold into ADR-005 as seams.** Not filed as intent, not cut. There is no schema, so a constraint and an `UPDATE … WHERE revision = $base` are not accepted decisions about code that exists. They are the shape of the unbuilt adapter, and they become their own ADRs when an adapter is written. ASM-21, ASM-22, ASM-26 and ASM-28 now point at ADR-005.
4. **A trigger may name a fact this delivery does not measure.** The same sentence names the instrument and says nothing here provides it. No threshold is invented to fill a field. Applied below to 001, 003, 005 and 010. The sentences themselves stay Gui's.

**ADR-005's trigger fact, chosen.** The duplicated rule: a predicate in the core and a persisted constraint that can disagree. Instrument that does not exist: a schema, and an insert the predicate would reject. The atomicity seam and the READ COMMITTED seam stay named on ADR-005 and do not become its trigger. Using either as the trigger would make ADR-005 about Postgres, which is the filing that was just refused. They get their own triggers if those ADRs are split out later.

**ADR-003's trigger fact, chosen.** Receipt retention (ASM-43, RFC-001 §7 risk 1). A receipt deleted inside the resend window makes the operation apply twice, which is the decision breaking. Instrument that does not exist: a receipt count, or an age, or a deletion. This delivery keeps every receipt and records none of the three. The `op_id` collision notes stay as the alternative's notes. The `-0` echo stays a consequence: the retry is unaffected, because the fingerprint collapses `-0` and `0`. Neither fact makes stored-receipt idempotency the wrong decision.

**ADR-001's trigger fact stays starvation.** Instrument that does not exist: a count of consecutive `conflict` results on one note before an `accepted`. No attempt threshold is chosen. The written trigger chooses the short edit lease. A per-note queue and assisted merge are refused there.

**ADR-010's trigger fact stays the accepted-proposal rate.** Instrument that does not exist: proposals offered against proposals that later come back `accepted`. This delivery has no model, no counter, and no flag. The plan's sketch says the flag already exists because the stub is the default. ADR-010's consequences already say the opposite, and the repo agrees with the ADR: there is nothing to turn off. The way out is a flag that would be built with the adapter and would default to the stub. It is not in the tree. No percentage is chosen.

Each block carries the **candidate observable fact**, **what the decision starts to cost** once that fact happens, and the **way out** discussed. The three things the field needs. The fields were written into the ADRs on 2026-10-29. This file stays the ingredients.

---

## ADR-001 — optimistic concurrency by revision

**Candidate observable fact:** starvation on a contested note. Whoever is resolving a conflict loses the race repeatedly, because every resend arrives already stale.
Recorded as risk 3 in RFC-001 §7. Risk 4 in that section is the model, ADR-010. An earlier line of this inventory had the two numbers swapped.

**What it starts to cost:** the user who worked the most is the one who loses the most work. The friction stops being "resolve a conflict" and becomes "never manage to save".

**Ways out discussed:** none yet. Obvious candidates to evaluate — a queue per note, a short edit lease, or assisted merge with human confirmation. Worth measuring first: how many attempts until a conflict is resolved. No count is chosen. The instrument would be consecutive `conflict` results on one note before an `accepted`, and this delivery has no such counter. See the settled block at the top.

---

## ADR-002 — source of truth

**Divergence, settled 2026-10-29.** The plan of attack says "operation ledger as truth; note state is a projection". RFC-001 §3 decided the opposite: there is no ledger, the receipts already store every valid operation with its content and result. ADR-002 describes the RFC. The plan's title stays in the body, demoted by the banner at the top of `docs/plano-de-ataque.md`. Numbered as ASM-03 in `docs/assumptions.md`.

**Candidate observable fact:** a replay or audit requirement appearing that demands rebuilding a note from scratch. Today that is not possible — it is the price declared in the RFC.

**What it starts to cost:** the absence of the ledger stops being a saving and becomes a debt; recomposing history from receipts is possible but partial.

**Way out discussed:** none yet.

---

## ADR-003 — idempotency by receipt plus fingerprint

Already has its own file: `docs/claude/adr-003-op-id-collision-notes.md` (`op_id` collision between clients, authn vs authz, *defense in depth*).

**Trigger fact, chosen 2026-10-29.** Receipts grow forever, and nobody knows how long they must be kept. Risk 1 of RFC-001 §7. Numbered as ASM-43. This is the fact that makes the decision wrong. The collision notes and the `-0` echo below are not the trigger. See the settled block at the top.

**What it starts to cost:** deleting a receipt before its client resends makes the operation apply twice. Idempotency has a shelf life equal to the retention window.

**Ways out discussed:** none. The retention window still has to be decided, along with what happens to a resend that falls outside it.

**Third observable fact, not yet noted there:** a receipt or a query starts returning `base_revision`. Numbered against ASM-13. Today `accepted` carries no `base_revision`, and `===` treats `-0` as `0`, so a write that normalized `-0` to `0` is invisible. The three calls in ASM-13's Proof cell still pass. "The receipt row keeps the number as sent" protects a seam that does not exist. `check` returning `Object.is(base_revision, -0)` is the predicate's return value, and it is already proved; it says nothing about the row. ASM-13 is the second thing that event touches: publishing the field makes "the receipt row keeps the number as sent" falsifiable, and that Proof cell owes a fourth call, which is what can take the row off `partial`.

**What it starts to cost:** the moment that field is echoed, a normalized row and a preserving row disagree, and a client that sent `-0` can be shown `0`. The retry is unaffected, because the fingerprint collapses the two either way. The lie is only in the echo.

**Way out discussed:** decide at the write, before any client has been shown the number. The row keeps the bits and the new field echoes them, or the predicate normalizes `-0` to `0` on the way in so the row and the fingerprint cannot diverge. The migration is that one policy. This block is not the Review trigger. That field is receipt retention. The `-0` echo stays a consequence.

---

## ADR-004 — the receipt is immutable; query is a separate path

No inventory block existed for this one. The fact in the Review trigger — a client required to learn the live note from a resend, because it has no `query` — was written with the field on 2026-10-29. The official pair it cites, the resent conflict still at revision 2 and `query` at 3, is the statement's own example.

---

## ADR-005 — the boundary between core and envelope

**Divergence, settled 2026-10-29.** The plan of attack describes ADR-005 with Nest and Postgres built. What shipped is the boundary only: no Nest, no Postgres, no React. RFC-001 §8 still names NestJS plus a React screen and says Nest stays in the cut order; that session was cut on purpose, including Nest. ADR-005 records the boundary as accepted and the adapter as not built. The banner on the plan says the same, and it does not pretend §8 was the document that won.

**Candidate observable fact (from the conversation about `Result`):** the discriminated union of `Result` needing to be persisted. In Postgres the receipt fits as `jsonb` with a constraint per type — but then the rule lives in two places.

**What it starts to cost:** the promise of "zero dependencies in the core" still stands, but the boundary gains a point of duplication that has to be kept in sync.

**Way out discussed:** none.

**Second candidate observable fact (ASM-45, the rejected `index` stamp).** Results cross a boundary that does not guarantee order. "One in-memory call, nothing between the call and the caller" is a property of the core's current packaging, not of the protocol. A JSON array preserves order, so a single HTTP call still holds. What breaks the correlation is a batch split across requests, a queue, or any client that merges responses.

**What it starts to cost:** position stops being a key the caller can trust. `invalid` carries no `op_id`, and one batch can return two results with the same `op_id`, so neither failure has a key left once order is gone.

**Way out discussed:** the server-stamped `index` already written in full in RFC-001 §4.4, on every member including `invalid`. The migration is adding that field. It is not a redesign. This block is not ADR-005's Review trigger. That trigger is the duplicated rule, and it is written in the ADR. The stamp stays an ingredient.

**Pointer.** ASM-45 cites ADR-005. The scope question does not move that pointer. ASM-21, ASM-22, ASM-26 and ASM-28 point at ADR-005 as of 2026-10-29.

**Trigger fact for this ADR, chosen the same day.** The duplicated rule, the first candidate below. See the settled block at the top. The second candidate (ASM-45, the rejected `index`) stays an ingredient and is not the trigger.

---

## ADR-008 and ADR-009 — folded into ADR-005 as seams

**Settled 2026-10-29: path 2.** Not filed. Not kept as intent ADRs. Not cut. Both describe SQL that is not in the repo, so neither is an accepted decision about code that exists. They are named seams of ADR-005: a future constraint that mirrors an invariant, and the optimistic lock as `UPDATE … WHERE revision = $base`. They become their own ADRs when an adapter is written. ASM-21, ASM-22, ASM-26 and ASM-28 point at ADR-005. The facts below stay ingredients for that split. They are not ADR-005's review trigger. That trigger is the duplicated rule, chosen in the settled block at the top.

**Related observable fact (risk 2 of RFC-001 §7):** the revision check and the write have to be atomic. Two concurrent requests on the same note can both pass the revision comparison. In memory it is free; in the envelope it is not. That is exactly what ADR-009 exists to solve.

**Second observable fact (ASM-26).** A Postgres `query` exists and is a plain `SELECT` at READ COMMITTED. The core suite stops being evidence about reads. In-memory `query` holds the writer lock for the whole read, so it cannot produce the read that observes a note at revision N+1 before, or without, the matching receipt.

**What it starts to cost:** read-skew against the real adapter is invisible to every green core run. A reviewer who treats the suite as proof that `query` and the receipt move together is reading a stronger adapter than the one that ships.

**Way out discussed:** argue the read when the Postgres `query` is written. The in-memory lock stays as it is; the argument belongs to the adapter. No snapshot shape is chosen here. This block is not ADR-005's Review trigger. That trigger is the duplicated rule. The READ COMMITTED seam stays an ingredient until an adapter is written.

**Third observable fact (ASM-25, ASM-28).** Registry lookup on the in-memory unit of work becomes `async`. Today the callback passed to `run` does not suspend: `receipts.get`, `notes.set` and `receipts.set` are synchronous `Map` calls, so "no `await` after the first write" is true by inspection, and no execution produces a half-written pair. That is the construction ASM-28's `—` rests on. The atomicity called free in the fact above is this construction, and it is free only while that body does not suspend. An `async` lookup is a suspension inside the locked region. Exclusion still holds: `tail` is held across the whole callback, so nothing interleaves. Keeping that suspension before the writes, rather than between the two `Map.set`s, stops being structural and becomes a rule someone has to not break. "Unreachable" becomes "unreachable as currently written."

One event, two rows, the same shape as ADR-003's third fact touching ASM-13. ASM-25's Proof cell owes the overlap test only after this seam exists; the seam is what makes removing the lock change the outcome. ASM-28 is the second thing the event touches: left as written, the `—` keeps resting on a construction the body no longer has.

**What it starts to cost:** the `—` no longer means a half-written pair cannot happen. An `await` between the two writes is then a possible edit, the suite stays green, and the only thing still keeping the pair together in memory is review of the body. The adapter that needs all-or-nothing is the Postgres one, which has `ROLLBACK`.

**Way out discussed:** take the trade on purpose. The seam lands so one `process` serves a Postgres unit of work (ASM-21). ASM-25's overlap call becomes a real debt and gets paid. ASM-28's `—` moves onto `ROLLBACK` in that adapter, and the in-memory body keeps "compute the receipt, then write" as review. This block is not ADR-005's Review trigger. That trigger is the duplicated rule. The pointer is ADR-005 until an adapter exists and these seams split back out.

---

## ADR-010 — the LLM proposes, it does not decide

The plan sketches a trigger that is not Gui's text: accepted-proposal rate below some threshold, then turn the feature off by a flag that already exists because the stub is the default.

**Fact chosen, 2026-10-29.** The rate stays the fact. No threshold is chosen. The instrument, which this delivery does not have, is proposals offered against proposals that later come back `accepted`. The flag in the plan's sketch is not in the repo. ADR-010 already says there is no adapter, no flag, and no count. The way out is a flag built with the adapter, defaulting to the stub. It is not something this delivery can flip.

---

## Related pending item, already noted in Session 0

"Three next steps, each born from the review trigger of an ADR" — planned for Session 4. The three come out of this list.
