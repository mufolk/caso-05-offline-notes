# ADR-007 — The core checks a closed key set itself

**Status:** Accepted in `predicates.ts` · **Date:** 2026-10-29 · **Context:** RFC-001 §4.1

The plan of attack titles this ADR "Zod at the edge, types inferred". There is no Zod in the repo, and the types in `packages/contracts` are written by hand. The RFC's sentence is the one that matches the code: Zod `.strict()` would express the same rule at an HTTP edge, and the core implements it with no library. That edge was cut with the envelope. The Decision field has to pick which sentence is yours.

## Context

"Confira os campos da operação" does not say whether an unknown field is tolerated. The core rejects a payload that is not a plain object, rejects any enumerable own key outside `{op_id, note_id, base_revision, text}`, checks emptiness on the trimmed string, and stores the value as sent. A failure is `invalid`, names the predicates, and does not consult the registry.

## Decision

TODO (Gui)

## Alternatives considered

**Zod in the core, with the types inferred from the schema.** Buys one source for the shape and the check. Costs a library in the package this delivery keeps free of them, and a domain that imports a validator. Worth choosing so the edge and the core cannot drift once an edge exists.

**Ignore unknown keys.** Buys a newer client sending a field an older server does not know. Costs a payload that means two things to two readers, and a fingerprint that can ignore a field the client believed was part of the content. Worth choosing for a protocol expected to gain fields. The way out already named for the closed set is an explicit version and a new accepted key set (ASM-07).

## Consequences

Good. An unknown key does not occupy an `op_id`. The predicate names are a closed union. The suite does not install a validator.

Bad. The rule lives in `predicates.ts` only. A later Zod edge would be a second copy, which is the same drift ADR-005 already flags for a persisted receipt. There is no length cap in the core (ASM-15). `-0` passes `Number.isInteger` and then collapses under `===`.

## Review trigger

TODO (Gui)
