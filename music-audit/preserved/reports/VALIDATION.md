# Independent validation

Generated 2026-10-16T17:05:55.888Z

Runtime: real Strudel 1.2.6 transpiler, REPL and event queries.

| Track | State | Reason |
|---|---|---|
| Dominic Fike — Babydoll | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Eminem — Without Me | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Jon Lajoie — Everyday Normal Guy 2 | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Gigi Perez — Sailor Song | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Kanye West — Can't Tell Me Nothing | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Ravyn Lenae — Love Me Not | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| She & Him — I Thought I Saw Your Face Today | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |
| Akon — Lonely | PASSED | Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check |

Selftests: [{"name":"valid","expected":"PASSED","actual":"PASSED","status":"PASSED","reason":"Real Strudel transpilation, REPL evaluation, and queryArc; audio is a separate check"},{"name":"invalid-method","expected":"FAILED","actual":"FAILED","status":"PASSED","reason":"note(...).auditInventedMethod is not a function"},{"name":"invalid-syntax","expected":"FAILED","actual":"FAILED","status":"PASSED","reason":"Unexpected token (1:5)"},{"name":"silence","expected":"FAILED","actual":"FAILED","status":"PASSED","reason":"No events in requested windows"}]

HTML: SEE_RESULTS

Node event generation is not audio playback.

No subjective fidelity score is assigned without listening.

Missing implementation is PENDING, never PASSED.

Each file is read into a snapshot before evaluation; runtime report records source SHA256.