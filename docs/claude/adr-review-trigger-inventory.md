# Inventory of raw material for the review triggers

**Status:** raw material. The Review trigger fields live in `docs/adr/`. On 2026-10-30 each one was rewritten so the first sentence is the observable fact that makes the decision wrong, and the next sentence is the exit. This file is not those fields. ADR-008 and ADR-009 are merged into ADR-005: not filed, not proposed as intent, and not an open cut. Two citations were already wrong against the accepted §7, which has not been renumbered in this repo: the first commit of that section has the same five items it has now. Starvation is risk 3, not risk 4; risk 4 is the model, ADR-010. Atomicity of the revision check and the write is not a numbered risk; risk 2 is `op_id` collisions. The separate write step is one of the proposal items §7 says this revision closed, and the closing note does not give it a number.
**Date:** 2026-10-28
**Source:** RFC-001 §7 (risks), pending items from Session 0, and the conversations of 27 and 28 October.
**Imported into the repo:** 2026-10-28, from the project workbench. English, content unchanged except where a later decision is noted.

## What was settled, and what changed on 2026-10-30

Checked against the repo in this session. `packages/core/src/memory.ts` is in the tree. `packages/core/package.json` depends on `contracts` and on nothing else. No Zod import exists in the repo. Eight ADR files are filed (`001`–`007` and `010`).

**The plan's decision sentences were corrected on 2026-10-30.** A banner that left the old sentence in the body was the two documents disagreeing. The Oct 24 wording is quoted beside the decision that shipped.

1. **Ledger.** RFC-001 §3 wins. No operation ledger. ADR-002 follows the RFC. The plan's "Modelo de dados", row 002, the limits list, and the video sketch say the same thing, and they quote the Oct 24 ledger sentence as what was reversed.
2. **Nest and Postgres built.** ADR-005 wins for this delivery, and it does not win by citing RFC-001 §8. That section still contains the old cut order, Nest stays; the closing paragraph records the cut that took Nest too. The cut on 2026-10-29 took the whole envelope, including Nest, on purpose.
3. **008 and 009 are merged into ADR-005, 2026-10-30.** Not filed, not proposed as intent, not an open cut. There is no schema, so a constraint and an `UPDATE … WHERE revision = $base` are not accepted decisions about code that exists. Their falsifiers are written on ADR-005: the constraint that accepts what `check` rejects, and two requests that both pass the revision comparison and both write. They do not split back out into their own files. ASM-21, ASM-22, ASM-26 and ASM-28 point at ADR-005.
4. **A trigger may name a fact this delivery does not measure.** The same sentence names the instrument and says nothing here provides it. No attempt count is chosen for starvation, and no retention window is chosen. The one level set on 2026-10-30 is ADR-010: fewer proposals come back `accepted` than are refused. Leaving that rate with no level was the blank field.

**ADR-005's trigger fact, chosen.** The duplicated rule: a predicate in the core and a persisted constraint that can disagree. Instrument that does not exist: a schema, and an insert the predicate would reject. The merged ADR-009 is a second paragraph on the same field, not a replacement of this fact: two requests both pass the revision comparison and both write, and the exit is `UPDATE … WHERE revision = $base`. The READ COMMITTED seam stays an ingredient and is not a trigger. Neither 008 nor 009 splits back out into its own file.

**ADR-003's trigger fact, chosen.** Receipt retention (ASM-43, RFC-001 §7 risk 1). A receipt deleted inside the resend window makes the operation apply twice, which is the decision breaking. Instrument that does not exist: a receipt count, or an age, or a deletion. This delivery keeps every receipt and records none of the three. The bare-code half from the collision notes is the second paragraph of the same field: once the key is scoped per client, or the receipt stores an owner, returning only the code is the wrong tradeoff. That paragraph does not make storing the receipt the wrong decision. The `-0` echo stays a consequence: the retry is unaffected, because the fingerprint collapses `-0` and `0`.

**ADR-001's trigger fact stays starvation.** The fact that makes the decision wrong: one note's conflicts stay consecutive and the attempt ends without an `accepted`. No attempt count is chosen. The exit is the short edit lease. A per-note queue and assisted merge are refused there. Instrument that does not exist: a count of consecutive `conflict` results on one note, and a client identity.

**ADR-010's trigger fact stays the accepted-proposal rate.** The fact that makes the decision wrong: proposals offered, and fewer of them come back `accepted` than are refused. The exit is a flag built with the adapter, defaulting to the stub. The plan's old sentence said that flag already exists because the stub is the default. It does not. There is no model, no counter, and no flag in the tree.

Each block carries the **candidate observable fact**, **what the decision starts to cost** once that fact happens, and the **way out**. The three things the field needs. The fields were written into the ADRs on 2026-10-29 and rewritten on 2026-10-30 so each one leads with the fact that makes the decision wrong. This file stays the ingredients. The exit in the ADR is the one that counts.

---

## ADR-001 — optimistic concurrency by revision

**Candidate observable fact:** starvation on a contested note. Whoever is resolving a conflict loses the race repeatedly, because every resend arrives already stale.
Recorded as risk 3 in RFC-001 §7. Risk 4 in that section is the model, ADR-010. An earlier line of this inventory had the two numbers swapped.

**What it starts to cost:** the user who worked the most is the one who loses the most work. The friction stops being "resolve a conflict" and becomes "never manage to save".

**Way out, written 2026-10-30.** A short edit lease. A per-note queue and assisted merge are refused in the ADR. No attempt count is chosen. The instrument would be consecutive `conflict` results on one note before an `accepted`, and this delivery has no such counter. See the settled block at the top.

---

## ADR-002 — source of truth

**Divergence, closed 2026-10-30.** The plan of attack said "operation ledger as truth; note state is a projection". RFC-001 §3 decided the opposite: there is no ledger. The plan's decision sentences now say so, and they quote the Oct 24 wording as what was reversed. ADR-002 follows the RFC. Numbered as ASM-03 in `docs/assumptions.md`.

**Candidate observable fact:** a replay or audit requirement appearing that demands rebuilding a note from scratch. Today that is not possible — it is the price declared in the RFC.

**What it starts to cost:** the absence of the ledger stops being a saving and becomes a debt; recomposing history from receipts is possible but partial.

**Way out, written 2026-10-30.** The ledger this ADR rejected, with the note as a fold. Not a backfill. See the ADR.

---

## ADR-003 — idempotency by receipt plus fingerprint

Already has its own file: `docs/claude/adr-003-op-id-collision-notes.md` (`op_id` collision between clients, authn vs authz, *defense in depth*).

**Trigger fact, chosen 2026-10-29, written as the first sentence 2026-10-30.** Receipts grow forever. Risk 1 of RFC-001 §7. Numbered as ASM-43. A receipt deleted or aged out, then resent, applies a second time. That is the fact that makes unbounded retention wrong. The bare-code half from the collision notes is the second paragraph of the same field. The `-0` echo below is not a trigger.

**What it starts to cost:** deleting a receipt before its client resends makes the operation apply twice. Idempotency has a shelf life equal to the retention window.

**Way out, written 2026-10-30.** A tombstone that keeps the `op_id` reserved and returns a bare expired result. No window length is chosen. The bare-code half, which this file's collision notes left open, is the second paragraph of the ADR: once the key is scoped per client or the receipt stores an owner, returning only the code is the wrong tradeoff, and the exit is the stored receipt or the diverging field, only to that owner.

**Third observable fact, not yet noted there:** a receipt or a query starts returning `base_revision`. Numbered against ASM-13. Today `accepted` carries no `base_revision`, and `===` treats `-0` as `0`, so a write that normalized `-0` to `0` is invisible. The three calls in ASM-13's Proof cell still pass. "The receipt row keeps the number as sent" protects a seam that does not exist. `check` returning `Object.is(base_revision, -0)` is the predicate's return value, and it is already proved; it says nothing about the row. ASM-13 is the second thing that event touches: publishing the field makes "the receipt row keeps the number as sent" falsifiable, and that Proof cell owes a fourth call, which is what can take the row off `partial`.

**What it starts to cost:** the moment that field is echoed, a normalized row and a preserving row disagree, and a client that sent `-0` can be shown `0`. The retry is unaffected, because the fingerprint collapses the two either way. The lie is only in the echo.

**Way out discussed:** decide at the write, before any client has been shown the number. The row keeps the bits and the new field echoes them, or the predicate normalizes `-0` to `0` on the way in so the row and the fingerprint cannot diverge. The migration is that one policy. This block is not the Review trigger. That field is receipt retention, then the bare-code half. The `-0` echo stays a consequence.

---

## ADR-004 — the receipt is immutable; query is a separate path

No inventory block existed for this one. The fact in the Review trigger — a client required to learn the live note from a resend, because it has no `query` — was written with the field on 2026-10-29. The official pair it cites, the resent conflict still at revision 2 and `query` at 3, is the statement's own example.

---

## ADR-005 — the boundary between core and envelope

**Divergence, settled 2026-10-29.** The plan of attack describes ADR-005 with Nest and Postgres built. What shipped is the boundary only: no Nest, no Postgres, no React. RFC-001 §8 still names NestJS plus a React screen and says Nest stays in the cut order; that session was cut on purpose, including Nest. ADR-005 records the boundary as accepted and the adapter as not built. The banner on the plan says the same, and it does not pretend §8 was the document that won.

**Candidate observable fact (from the conversation about `Result`):** the discriminated union of `Result` needing to be persisted. In Postgres the receipt fits as `jsonb` with a constraint per type — but then the rule lives in two places.

**What it starts to cost:** the promise of "zero dependencies in the core" still stands, but the boundary gains a point of duplication that has to be kept in sync.

**Way out, written 2026-10-30.** One source: the predicate stays the rule, and the constraint is generated from the closed key set or it is not shipped. See the ADR.

**Second candidate observable fact (ASM-45, the rejected `index` stamp).** Results cross a boundary that does not guarantee order. "One in-memory call, nothing between the call and the caller" is a property of the core's current packaging, not of the protocol. A JSON array preserves order, so a single HTTP call still holds. What breaks the correlation is a batch split across requests, a queue, or any client that merges responses.

**What it starts to cost:** position stops being a key the caller can trust. `invalid` carries no `op_id`, and one batch can return two results with the same `op_id`, so neither failure has a key left once order is gone.

**Way out discussed:** the server-stamped `index` already written in full in RFC-001 §4.4, on every member including `invalid`. The migration is adding that field. It is not a redesign. This block is not ADR-005's Review trigger. That trigger is the duplicated rule, and it is written in the ADR. The stamp stays an ingredient.

**Pointer.** ASM-45 cites ADR-005. The scope question does not move that pointer. ASM-21, ASM-22, ASM-26 and ASM-28 point at ADR-005 as of 2026-10-29.

**Trigger fact for this ADR, chosen the same day.** The duplicated rule, the first candidate below. See the settled block at the top. The second candidate (ASM-45, the rejected `index`) stays an ingredient and is not the trigger.

---

## ADR-006 — errors as values

No inventory block existed for this one. The fact in the Review trigger — a domain outcome arriving as a rejection of `uow.run`, so the queue continues only because something swallowed it — was written with the field on 2026-10-29.

---

## ADR-007 — closed predicates, no validation library

No inventory block existed for this one. The fact in the Review trigger — one payload getting two answers, `check` accepting what a second checker rejects, or the reverse — was written with the field on 2026-10-29.

---

## ADR-008 and ADR-009 — merged into ADR-005

**Settled 2026-10-30: merge.** Not filed. Not proposed as intent. Not an open cut. Both describe SQL that is not in the repo, so neither is an accepted decision about code that exists. Their falsifiers are on ADR-005. A constraint that accepts what `check` rejects is ADR-005's review trigger. Two requests that both pass the revision comparison and both write are the merged ADR-009: the exit is `UPDATE … WHERE revision = $base` in the same transaction as the receipt write. ASM-21, ASM-22, ASM-26 and ASM-28 point at ADR-005. The facts below stay ingredients. A READ COMMITTED `query` is not either trigger.

**Related observable fact:** the revision check and the write have to be atomic. Two concurrent requests on the same note can both pass the revision comparison. In memory it is free; in the envelope it is not. This is not a numbered risk in RFC-001 §7 — risk 2 there is `op_id` collisions. It is the merged ADR-009. The exit is written on ADR-005. It does not get its own file when an adapter is written.

**Second observable fact (ASM-26).** A Postgres `query` exists and is a plain `SELECT` at READ COMMITTED. The core suite stops being evidence about reads. In-memory `query` holds the writer lock for the whole read, so it cannot produce the read that observes a note at revision N+1 before, or without, the matching receipt.

**What it starts to cost:** read-skew against the real adapter is invisible to every green core run. A reviewer who treats the suite as proof that `query` and the receipt move together is reading a stronger adapter than the one that ships.

**Way out discussed:** argue the read when the Postgres `query` is written. The in-memory lock stays as it is; the argument belongs to the adapter. No snapshot shape is chosen here. This block is not ADR-005's Review trigger. That trigger is the constraint that accepts what `check` rejects. The READ COMMITTED seam stays an ingredient.

**Third observable fact (ASM-25, ASM-28).** Registry lookup on the in-memory unit of work becomes `async`. Today the callback passed to `run` does not suspend: `receipts.get`, `notes.set` and `receipts.set` are synchronous `Map` calls, so "no `await` after the first write" is true by inspection, and no execution produces a half-written pair. That is the construction ASM-28's `—` rests on. The atomicity called free in the fact above is this construction, and it is free only while that body does not suspend. An `async` lookup is a suspension inside the locked region. Exclusion still holds: `tail` is held across the whole callback, so nothing interleaves. Keeping that suspension before the writes, rather than between the two `Map.set`s, stops being structural and becomes a rule someone has to not break. "Unreachable" becomes "unreachable as currently written."

One event, two rows, the same shape as ADR-003's third fact touching ASM-13. ASM-25's Proof cell owes the overlap test only after this seam exists; the seam is what makes removing the lock change the outcome. ASM-28 is the second thing the event touches: left as written, the `—` keeps resting on a construction the body no longer has.

**What it starts to cost:** the `—` no longer means a half-written pair cannot happen. An `await` between the two writes is then a possible edit, the suite stays green, and the only thing still keeping the pair together in memory is review of the body. The adapter that needs all-or-nothing is the Postgres one, which has `ROLLBACK`.

**Way out discussed:** take the trade on purpose. The seam lands so one `process` serves a Postgres unit of work (ASM-21). ASM-25's overlap call becomes a real debt and gets paid. ASM-28's `—` moves onto `ROLLBACK` in that adapter, and the in-memory body keeps "compute the receipt, then write" as review. This block is not ADR-005's Review trigger. That trigger is the constraint that accepts what `check` rejects. The pointer stays ADR-005. These seams do not split back into their own ADRs.

---

## ADR-010 — the LLM proposes, it does not decide

The plan used to sketch a trigger with no level, and a flag that already existed because the stub was the default. That flag sentence was corrected in the plan on 2026-10-30. The flag is not in the repo.

**Fact chosen, 2026-10-30.** Proposals offered, and fewer of them come back `accepted` than are refused. That is the level. The instrument, which this delivery does not have, is proposals offered against proposals that later come back `accepted`. The exit is a flag built with the adapter, defaulting to the stub. There is nothing in the tree to flip.

---

## Related pending item, already noted in Session 0

"Three next steps, each born from the review trigger of an ADR" — planned for Session 4. The three come out of this list.
