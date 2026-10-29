# ADR-003 — Idempotency by stored receipt plus a fingerprint of the content

**Status:** Accepted in RFC-001 §5 and in `process` · **Date:** 2026-10-29 · **Context:** RFC-001 §4.1, §5

## Context

The same `op_id` with the same content returns the original receipt and does not apply again. The same `op_id` with different content returns `id_reused`. The statement never defines "content", and it never says what `id_reutilizado` carries besides the error. The core's content is `{note_id, base_revision, text}`, compared with `===` on each field. `op_id` is the key, not part of the fingerprint. `id_reused` returns `{type, op_id}` and does not write.

## Decision

TODO (Gui)

## Alternatives considered

**The key alone, no fingerprint.** Buys a smaller row, and a resend path that always returns the stored receipt. Costs the inability to tell a retry from a reused key, so the statement's `id_reutilizado` cannot be produced. Worth choosing if the client is trusted never to reuse an id with a new payload.

**Return the stored receipt on collision.** Buys a useful error for the client that reused its own id and wants to see which field diverged. Costs a leak: anyone who can guess an `op_id` reads another client's text. The statement does not specify the payload of this error. Worth choosing in a single-tenant tool where that guess is not a threat. Notes: `docs/claude/adr-003-op-id-collision-notes.md`.

## Consequences

Good. A retry is stable, including a conflict receipt that stays frozen. A collision does not overwrite the stored row and does not reveal it. An invalid payload never reaches this check, so it does not occupy the id.

Bad. The honest client that reused its own id gets a bare code and no hint which of `note_id`, `base_revision`, or `text` diverged. Receipts are kept without a retention window (ASM-43). `===` treats `-0` and `0` as the same content, and nothing in the receipt echoes `base_revision`, so a row that normalized `-0` to `0` is invisible (ASM-13, still partial).

## Review trigger

TODO (Gui)
