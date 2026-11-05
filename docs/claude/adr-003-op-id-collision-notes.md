# Notes for the review trigger of ADR-003

**Status:** raw material for the bare-code half. Both halves are written in ADR-003's Review trigger as of 2026-10-30. Receipt retention is the first paragraph. This note is the second: the bare `{type, op_id}` becomes the wrong tradeoff once the key is scoped per client or the receipt stores an owner. The field this file used to leave open is that paragraph. It is not still blank.
**ADR:** 003 — idempotency by stored receipt plus payload fingerprint.
Not 010. What is at stake here is the idempotency key, not the LLM.
**Conversation date:** 2026-10-28
**Imported into the repo:** 2026-10-28, from the project workbench. English, content unchanged.

---

## 1. The risk, in one sentence

`op_id` is chosen by the client and lives in a global namespace. If the server returned the stored receipt whenever the same `op_id` arrived with different content, any client could guess keys and read content written by another client, without ever touching the note.

The current decision closes that channel: `id_reused` returns the code alone, never the content of the original receipt.

## 2. Why this line is not in the statement

The statement requires `id_reused` ("Reutilizar O2 com outro texto deve dar erro"), but says nothing about **what** to return in that error. The tempting shortcut — returning the original receipt, as a courtesy — is what turns `op_id` into an oracle.

The same instinct applied twice:
- do not leak content in `id_reused`;
- do not occupy an `op_id` on an invalid operation ("Uma operação inválida não ocupa op_id") — not only for the retry, but because nobody should be able to burn or occupy someone else's key.

The same idea twice is a principle, not luck: **the `op_id` registry is not a side channel between clients.**

## 3. The conceptual repair (the point that was crooked in conversation)

Roles and permissions do **not** solve this on their own.

- Authorisation protects the **note**. An `op_id` collision never goes through the note: client B never touched A's resource.
- What actually closes the hole is one of two structural changes:
  1. **Per-client scoping of the key** — the key becomes `(client_id, op_id)` instead of `op_id`. Collision between clients stops existing by construction.
  2. **Receipt ownership check** — the receipt stores its owner, and the server checks before returning anything.
- Authentication is a **prerequisite** for both, not the solution. Saying "roles solve it" in an interview sounds like confusing authn with authz.

Defensible position: the privacy line is *defense in depth*. It still holds with authentication in place, because it protects the case where authentication has already been bypassed.

## 4. The real cost (do not say "no cost")

It burdens one concrete case: the honest client with a bug of its own, which reused its own `op_id` with different content. It gets a bare code and no hint as to **which** field diverged — `note_id`, `base_revision` or text. A debugging cost, small, chosen deliberately.

A consequences section containing only good things is suspect. That sentence is worth a point.

## 5. Written into ADR-003 on 2026-10-30

The three things this section used to leave for later:

1. **The observable fact.** The registry key is `(client_id, op_id)`, or the receipt stores an owner the server checks before returning it. Authentication alone is not that fact. Section 3 stands: roles protect the note, and a colliding `op_id` never touches it.
2. **What the bare code starts to cost.** The leak is already closed by the key, and the honest client who reused their own id still learns nothing about which field diverged.
3. **The way out.** Return the stored receipt, or name the field that diverged, and only to that owner. Migration is the owner column or the scoped key, plus that richer error, about a day, once a client identity exists.

## 6. English vocabulary for the final text

`defense in depth` · `per-client scoping` · `receipt ownership check` · `leak channel` · `shared namespace` · `side channel` · `probing / key enumeration` · `authn vs authz`

## 7. Closed 2026-10-30

The field this note refused to draft is the second paragraph of ADR-003's Review trigger. The refusal is recorded in `docs/ai-log.md`, entry 2. The later write is entry 6. This file stays the notes for that half. It is not a second blank field.
