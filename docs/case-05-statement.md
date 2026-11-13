# Statement — Case 05: Offline note sync

# Case 05 — Offline note sync

We want to see how you solve problems. In this challenge you will build a small solution, show how it works, and talk with us about the decisions you made.

## The challenge

People edit notes on devices that stay disconnected. Implement a sync simulator that preserves conflicts instead of silently overwriting work.

You can work on the editing interface or on the exchange of information between client and server, simulating both in the same process.

## How it should work

Start with no notes on the server. Each note has an `id`, text, and a revision number. A change sent by the client has `op_id`, `note_id`, `base_revision`, and text.

A note is created at revision 1 when the client sends base revision 0. To change an existing note, the base revision must equal the current revision on the server. If it is accepted, the change replaces the text and increases the revision by 1, even if the sent text is the same as the previous one.

When the base revision does not match the expected one, return `conflict` and the server's current data, or indicate that the note does not exist yet. Preserve the server's text and the client's proposal in the result of that operation. Do not merge the texts automatically, and do not use the device clock to pick a winner.

Before processing, check the operation's fields. An invalid operation does not occupy `op_id`. For each valid operation received for the first time, store its content and result, even if it was a conflict. If the same `op_id` arrives again with the same content, return the original result without applying the change again. If it arrives with different content, return `id_reused`.

Process the queue in the order received and return one result per operation. An error or conflict does not block the following ones. The result of a resend may contain stale data: it is the receipt of the original operation. A separate query must show the note as it is now.

To resolve a conflict, allow sending another operation, with a new `op_id`, the chosen text, and the current base revision. Client and server may be simulated in the same process. You do not need to implement deletion, automatic merging, real-time editing, disk storage, or HTTP communication.

## An example

Two devices are editing note N. Follow this sequence:

| Operation | What is sent | Result |
|---|---|---|
| O1 | Base 0, text “start” | Creates N at revision 1. |
| O2 | Base 1, text “edit A” | Updates N to revision 2. |
| O3 | Base 1, text “edit B” | Conflict: N keeps “edit A”. |
| Resend of O2 | Same content as before | Repeats the success receipt for revision 2, without applying another change. |
| O4 | Base 2, text “A + B” | Updates N to revision 3. |

If O3 is resent, its receipt still shows the original conflict at revision 2. A query of the note shows revision 3. Reusing O2 with different text must be an error.

## How to organize your time

Our suggestion is to spend up to four hours on the implementation, the tests, and the documentation. If you cannot finish everything in that time, send what you did and say what is still pending. The goal is a small solution that can be the starting point for our conversation.

## Tools and use of AI

Use the language and the tools you are most comfortable with. The solution may be an interface, an API, a terminal application, a library with a runnable example, or a simulator. Choose the form that best fits your focus, whether front end, mobile, back end, architecture, algorithms, or data.

The rules of the challenge apply to any approach, but you are free to decide how to organize and present the solution. You do not need to publish the application, pay for services, or use hardware. If you depend on an external service, offer a local way to demonstrate that it works.

You may use AI, documentation, and libraries. Say how those tools helped, what you kept or changed, and how you checked the result. We do not need the history of your conversations with the AI, because we want to know your decisions and the way you verified the code.

## What to deliver

The delivery has two parts:

- **A Git repository with the code, the tests, and the documentation of the solution.** The README must explain how to install whatever is needed, run the application, and run the tests. Include a demonstration we can reproduce, your main decisions, and what is still pending.
- **A video of up to 30 minutes explaining the solution.** Show the application working, walk through the most important pieces of code, and say why you chose that approach.

### Repository and documentation

Create the repository on the service you prefer. In the README, state the name or number of the case, the focus you chose, and how much time you spent. Anyone who clones the project should be able to follow the demonstration with the instructions you left.

When explaining the tests, highlight up to three situations that help someone understand your solution, such as a value at the boundary of a rule, the interaction between two rules, or an invalid input. State the expected result and what kind of error each test helps find. You may write other tests without needing to hit a coverage percentage.

Also describe two decisions you made during the work, explaining what you wanted to check, how you investigated, and what you concluded. One of them may be about a suggestion from the AI, if you used it. These notes can live in the README itself and do not need to follow a form.

Use fictional data and leave out credentials, real personal data, and employer code. The number of commits does not count in the evaluation.

### Video explaining the solution

The recording should help us follow your reasoning. Choose a scenario different from the example in this document, explain the result you expect, and run the solution so it can be compared with what happened. Also show an important test and the piece of code it helps check.

As you walk through the project, say why you chose an approach, what alternative you considered, and where the solution has limits. If something did not work, it is worth showing how you investigated.

You do not need to show your face, create slides, edit the recording, or repeat your CV. Use the time to explain the work, including how you checked the AI's suggestions, when there were any. If you need another presentation format, talk with the person accompanying your process.

## How to submit

When you are ready, reply on the same channel where you received the invitation, sharing:

- The repository link and the full hash of the commit we should evaluate.
- The video link, which may also live in the README.
- The name or number of the case, the chosen focus, and the approximate time spent.
- Any note needed to run the solution, if there is one.

The repository may be private. In that case, ask the person responsible for the usernames that should receive read access. Also check that we can open the video, without sending passwords or tokens. We will confirm receipt of the files and that we can access them.

The commit identifies the code that was submitted. If you keep working and want a change included in the evaluation, just say so and send the new hash. You may also correct links, permissions, and run instructions after submitting.
