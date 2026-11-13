# How the AI was used, and how that was checked

DEL-05. The plan asks for four to six entries, each in three lines: what was suggested, what was kept or changed, how it was checked. Six episodes are on record.

## 1. 2026-10-29, 01:32 — a base ahead of the server

The assistant framed a base ahead of the server as a choice between `invalid` and `conflict`, so that a broken client's text would be kept on purpose. I rejected that frame: the alternative written in RFC-001 §4.2 is a fifth result, and `client_text` is what every conflict stores, not a motive about a client judged broken. I checked that section, ASM-16, and the test `a base ahead of the server's revision is the same conflict`, which sends base 99 against revision 1 and expects `conflict`.

## 2. Two refusals to write the review triggers

Asked twice for the review-trigger text. The fields stayed blank, and the inventory stayed raw material: the status line imported in `4713536` says no review-trigger field is written there, and that commit message says both ADR notes remain blank by rule. Checked against the plan's prohibition on the AI writing **Decision** and **Review trigger**; the sentences in the files now are the ones dictated on 2026-10-29, in `1b12764`, on top of the empty structure at `a6fe2da`.

## 3. The red-team order, adopted and then reversed

The red-team order, adopted in that sitting, looked up a known `op_id` before the rest of the fields, so a stored id with a field missing came back `id_reused`. Reversed the same night: that order was the reviewer's, and a payload that fails the field check is not an operation, so it does not reuse an id and it does not replay a receipt. Checked against *"Before processing, check the operation's fields. An invalid operation does not occupy op_id."*, against the order in RFC-001 §4 (predicates, then registry lookup), and against `process.spec.ts` → *REQ-13 — an invalid payload does not occupy the op_id*.

## 4. The Cursor and Claude trailers, kept

`d538f5c` carries `Co-authored-by: Cursor <cursoragent@cursor.com>`. `4713536` carries `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` and a Claude session link. The trailers were not in the message that was passed for those commits; stripping them was refused. A later rewrite removed the plan files and the names. The trailers stayed. Checked with `git log`: both trailers are still on those two hashes.

## 5. 2026-10-29 — the adversarial pass called every row met

The pass had the statement, the code, and the matrix, and returned twenty-two met with an empty "not verifiable" column. For REQ-10 it cited `text: op.text` with no concatenation; for REQ-11 it cited that no source file reads a clock. I did not keep that as proof. The README already called both rows absences, and a verdict that reads the implementation and calls the reading evidence is green and wrong. REQ-10 is now the test that fails if the texts are joined. REQ-11 stays declared: stubbing the clock on one path does not show it is never read.

## 6. 2026-10-30 — the review trigger has to say what makes the decision wrong

The dictated fields named a cost and an exit, then spent the rest of the paragraph on what this delivery cannot measure. The collision notes still said ADR-003's field was open, and the inventory still said the way out for 001, 002 and 005 had not been chosen. ADR-008 and ADR-009 were "folded as seams," which is none of intent, merge, or cut. Rewritten so each Review trigger opens with the fact that makes the decision wrong, then the exit and what the migration costs. The accepted-proposal level was set in this pass: fewer proposals come back `accepted` than are refused. The lease, the tombstone, the ledger, and the generated constraint were already the exits. ADR-008 and ADR-009 are merged into ADR-005. The plan's ledger sentence was corrected the same day so it states the decision that shipped and quotes the old wording. Checked by reading each Review trigger against the fact already chosen in the inventory. The plan files were removed from this history after that check; the reversal that remains is the one ADR-002 records.
