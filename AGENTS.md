# Agent instructions

## Subagents and model choice

- Use subagents sparingly. Spawn one only for genuinely independent work that benefits from running in parallel or in a separate context; do small or sequential tasks directly. Subagents must not spawn further subagents, and keep concurrent agents to a handful so usage limits are not exhausted.
- Set every subagent's model and reasoning effort explicitly to fit its task. Never let a fan-out inherit the main session's model and effort by default.
- Use a smaller, cheaper model (for example Sonnet) for mechanical or read-only work: searching and sweeping files, listing, summarising, doc-versus-code checks, and small edits that follow an exact recipe. Use low reasoning effort for pure search and medium for fact-checking or recipe edits.
- Use the largest model (for example Opus) only where a wrong call is costly: designing a change, persistence, sync, migration or concurrency code, multi-file refactors, adversarial review, and build or release verification. Use high effort by default; go higher only for the hardest verification of data-safety-critical changes.
- When unsure, use the smaller model for discovery and the larger one for the step that edits or verifies.
