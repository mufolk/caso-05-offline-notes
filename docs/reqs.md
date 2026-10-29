# Requirements matrix — Case 05 (offline note sync)

**Source:** statement of Case 05, read in Session 0 (27/10/2026).
**Method:** every sentence of the statement carrying an obligation became one numbered REQ.
**Quote column:** verbatim from the statement, in the original Portuguese — a translated quote is no longer a quote.
**Requirement column:** the rule as I restated it while reading.
**Proof column:** the test that proves it. Filled in during Session 2, as each test lands.

---

## System requirements (REQ)

| ID | Requirement | Statement (verbatim) | Proof |
|---|---|---|---|
| REQ-01 | No notes on the server at the start. | "Comece sem notas no servidor." | REQ-01 — the server starts with no notes |
| REQ-02 | Every client operation has `op_id`, `note_id`, `base_revision` and text. | "Uma alteração enviada pelo cliente tem op_id, note_id, base_revision e texto." | accepts the official operation and stores each field as sent |
| REQ-03 | A note is created at revision 1 when the client sends base revision 0. | "Uma nota é criada na revisão 1 quando o cliente envia a revisão base 0." | REQ-03 — a missing note with base 0 is created at revision 1 |
| REQ-04 | An existing note is only changed if the base revision equals the current revision number. | "Para alterar uma nota existente, a revisão base deve ser igual à revisão atual no servidor." | ASM-44 — missing/base>=1, exists/base mismatch, and missing/base 0 are three different rows |
| REQ-05 | If accepted, replace the text and add 1 to the revision number. | "Se for aceita, a alteração troca o texto e aumenta a revisão em 1…" | REQ-05 — an accepted change replaces the text and adds 1 |
| REQ-06 | If the text is identical, still add 1. | "…mesmo que o texto enviado seja igual ao anterior." | REQ-06 — identical text still adds 1 |
| REQ-07 | A conflict returns the server's current data. | "Quando a revisão base não corresponder à esperada, retorne conflito e os dados atuais do servidor…" | REQ-07, REQ-08 — conflict preserves the server text and the client proposal |
| REQ-08 | Preserve the server's text and the client's proposal in the operation result. | "Preserve o texto do servidor e a proposta do cliente no resultado dessa operação." | REQ-07, REQ-08 — conflict preserves the server text and the client proposal |
| REQ-09 | An operation with base greater than zero for a non-existent note returns `note_not_found`. | "…ou indique que a nota ainda não existe." | REQ-09 — note_not_found carries the client's text and no server fields |
| REQ-10 | Do not merge texts automatically. | "Não junte os textos automaticamente…" | — absence, not behaviour. There is no merge path to test: the only write is "replace the text" (REQ-05), and `conflict` returns the two texts side by side, unjoined (REQ-08) |
| REQ-11 | Do not use the device clock to pick a winner. | "…nem use o relógio do dispositivo para escolher um vencedor." | — absence, not behaviour. The note is exactly `{id, text, revision}` (ASM-04) and no result type carries a timestamp, so there is no clock to resolve by |
| REQ-12 | Before processing, check the operation's fields. | "Antes de processar, confira os campos da operação." | names each missing or illegal field, with extra_keys in front |
| REQ-13 | An invalid operation does not take up an `op_id`. | "Uma operação inválida não ocupa op_id." | REQ-13 — an invalid payload does not occupy the op_id |
| REQ-14 | For every valid operation received for the first time, store its content and result, even if it was a conflict. | "Para cada operação válida recebida pela primeira vez, guarde seu conteúdo e resultado, mesmo que tenha dado conflito." | REQ-14 — a conflict is stored and resending it returns the frozen pair |
| REQ-15 | If the same `op_id` arrives again with the same content, return the original result without applying the change again. | "Se o mesmo op_id chegar de novo com o mesmo conteúdo, devolva o resultado original sem aplicar a alteração outra vez." | REQ-15 — a resend does not apply the change a second time |
| REQ-16 | If the same `op_id` arrives with different content, return `id_reused`. | "Se chegar com conteúdo diferente, retorne id_reutilizado." | EX-08 — reusing O2 with a different text is an error |
| REQ-17 | Process the queue in the order received and return one result per operation. | "Processe a fila na ordem recebida e devolva um resultado por operação." | one result per operation, in the order received |
| REQ-18 | An error or conflict does not block the following operations. | "Um erro ou conflito não impede as próximas." | REQ-17, REQ-18 — a conflict in the middle does not block the rest |
| REQ-19 | The result of a resend may contain stale data: it is the receipt of the original operation. | "O resultado de um reenvio pode conter dados antigos: ele é o recibo da operação original." | EX-06 — resend of O3 still shows the original conflict, at revision 2 |
| REQ-20 | A separate query must show the note as it is now. | "Uma consulta separada deve mostrar a nota como está agora." | EX-07 — a query shows revision 3 |
| REQ-21 | To resolve a conflict, allow sending another operation with a new `op_id`, the chosen text and the current base revision. | "Para resolver um conflito, permita enviar outra operação, com novo op_id, o texto escolhido e a revisão base atual." | resolving O3's conflict from the frozen revision conflicts again |
| REQ-22 | Each note has an id, a text and a revision number. | "Cada nota tem id, texto e um número de revisão." | REQ-20, REQ-22 — found shows the note as it is now, with its three fields |

---

## The statement's own example, as assertions (EX)

The statement walks one sequence over note N. Each line is an executable assertion in `exemplo-do-statement.spec.ts`, named after the statement itself. A reviewer opening that file sees his own example passing.

| ID | Step | Expected | Covers |
|---|---|---|---|
| EX-01 | O1: base 0, text "início" | creates N at revision 1 | REQ-03 |
| EX-02 | O2: base 1, text "edição A" | updates N to revision 2 | REQ-04, REQ-05 |
| EX-03 | O3: base 1, text "edição B" | conflict; N keeps "edição A" | REQ-07, REQ-08 |
| EX-04 | resend of O2, same content | repeats the success receipt for revision 2, applying no further change | REQ-15 |
| EX-05 | O4: base 2, text "A + B" | updates N to revision 3 | REQ-21 |
| EX-06 | resend of O3 | receipt still shows the original conflict, at revision 2 | REQ-14, REQ-19 |
| EX-07 | query the note | shows revision 3 | REQ-20 |
| EX-08 | reuse O2 with different text | error | REQ-16 |

EX-06 is the one to highlight: it is the only line in the statement that forbids the "helpful" behaviour of refreshing a stored receipt.

---

## Non-goals, authorised by the statement

Not requirements — explicit permissions. Each one is quoted so the README and the ADRs can cite it instead of arguing.

- Client and server in a single process: "Cliente e servidor podem ser simulados no mesmo processo."
- No deletion, no automatic merge, no real-time editing, no disk storage, no HTTP: "Não precisa implementar exclusão, mesclagem automática, edição em tempo real, armazenamento em disco ou comunicação HTTP."
- No coverage percentage target: "Você pode escrever outros testes, sem precisar atingir um percentual de cobertura."
- No deployment, paid services or hardware: "Não é necessário publicar a aplicação, pagar por serviços ou usar hardware."

---

## Deliverables (DEL)

| ID | Deliverable | Where |
|---|---|---|
| DEL-01 | README with case, focus, time, and instructions to install, run and test. | `README.md` §1 (run) and §3 (layout). Time figure still blank — only Gui has it. |
| DEL-02 | Reproducible demonstration. | `demo/demo.ts`, run with `pnpm demo`. Self-verifying: each step declares its expectation and the script throws on any mismatch. |
| DEL-03 | Up to three highlighted tests, each with the expected result and the kind of bug it helps catch. | `README.md` §5 — the resent conflict, the reused `op_id`, and the invalid payload that does not burn its id. |
| DEL-04 | Two decisions taken during the work — what I wanted to check, how I investigated, what I concluded. One may be about an AI suggestion. | |
| DEL-05 | How the AI was used and verified. | |
| DEL-06 | What was left pending. | `README.md` §8 — seven items, each with what it would cost in production. Needs one more pass once the envelope's fate is settled. |
| DEL-07 | Video, under 30 minutes, with a scenario different from the example, the expected result stated before running, one important test with the code it guards, and where the solution has limits. | |

**Submission items, not numbered above:** repository link plus the full commit hash to be evaluated; video link (may also live in the README); case number, chosen focus and approximate time; fictional data only, no credentials, no employer code.

---

## Open points

Three things I left deliberately unresolved in Session 0. Two are now closed, each with the pointer that closes it. The third is a note, not a debt.

1. **Closed — REQ-09 names a code the statement does not.** The statement says only "ou indique que a nota ainda não existe". The identifier `note_not_found` is a naming decision, not a quote. It is declared in the error taxonomy of RFC-001 §5 and numbered as **ASM-20** in `docs/assumptions.md`.
2. **Closed — the note entity has no REQ of its own.** "Cada nota tem id, texto e um número de revisão." is a model obligation, so it is now **REQ-22**. The sentence has the statement's authority and belongs in this matrix; what the RFC adds on top — *exactly* those three fields, no timestamp, no author, hence no clock to resolve by — is a choice and lives as **ASM-04** in `docs/assumptions.md`.
3. **REQ-07 and REQ-09 come from one sentence.** They are two outcomes of the same check. Keeping them split is what forces two distinct tests; worth saying so out loud when the reviewer asks why the numbering looks uneven.