# ADR-010 — A model may propose an operation; it does not write the note

**Status:** Accepted as a constraint; no adapter is built · **Date:** 2026-10-29 · **Context:** RFC-001 §7, risk 4

## Context

A conflict leaves two texts, and the obvious help is to merge them. The statement forbids automatic merge. The room left for a model is narrow: it drafts a text, that draft becomes an ordinary operation with a new `op_id` and `base_revision` equal to the current revision, and the draft walks the same four steps as a human edit. If the note moved while the model was thinking, the proposal conflicts and is stored as a conflict. No package in this repo calls a model. README §8 records that absence.

## Decision

TODO (Gui)

## Alternatives considered

**The model writes the note.** Buys a resolved conflict with no extra round trip. Costs handing an untrusted writer the authority the revision check exists to deny, and a special case the rest of the protocol does not have. Worth choosing if the metric is "conflicts disappear".

**No model.** Buys none of the risk the RFC already names: a plausible wrong sentence, accepted by a hurried user. Costs the link between this protocol and the vacancy, which is the only reason the feature is on the list. Worth choosing if that link cannot be said in one sentence. The plan's own test is that sentence; failing it means cutting the feature rather than decorating the repo with a client.

## Consequences

Good. The model, if added, has no authority by construction. A stale proposal is an ordinary conflict. Nothing in `process` would need a branch for it.

Bad. There is no adapter, no flag, and no count of how often a proposal would be accepted. The protocol also will not save the hurried user: it cannot tell a model from a person, so a bad proposal with a fresh `op_id` and the live revision is accepted, like any other edit.

## Review trigger

TODO (Gui)
