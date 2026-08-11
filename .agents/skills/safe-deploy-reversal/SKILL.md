---
name: safe-deploy-reversal
description: >-
  Enforces a strict zero-breakage and atomic rollback protocol for Lokha deployments.
  Includes pre-flight health baselines, automated regression detection, immediate
  reversal on failure, root-cause reflection, and verification across Ghost, Moltbook,
  Creem, Exa, and Telegram.
---

# Safe Deploy & Reversal Protocol for Lokha

## Overview
This skill guarantees that any modification to the Lokha ecosystem (theme, agent dashboard, MCP server, Moltbook daemon, or Letta memory) follows a reversible, zero-breakage workflow. If any feature fails or degrades the user experience, the system immediately reverts to the last known good state before attempting a revised solution.

## Workflow

### 1. Pre-Change Health Baseline
Before touching any code or deploying:
- Check Ghost CMS status (`https://lokha.today`)
- Check Moltbook API connection (`https://www.moltbook.com/api/v1/agents/me`)
- Check Telegram polling & Groq reasoner
- Record current git commit hash (`git rev-parse HEAD`)

### 2. Isolated Atomic Changes
- Implement changes cleanly with minimal blast radius.
- Validate syntax locally with `node -c` or `tsc --noEmit`.
- Run automated unit/integration tests before pushing.

### 3. Immediate Reversal on Regression
If a regression, error, or user rejection occurs:
1. **Revert Immediately**: `git reset --hard <last-known-good-commit>` or `git restore .` to return the environment to a working state.
2. **Root-Cause Reflection**:
   - What was the intended outcome?
   - What broke or failed during execution?
   - Why did the previous approach fail?
3. **Formulate Alternative**: Only proceed with a new approach after the reflection is documented and verified.

### 4. Live Verification & Signoff
- Verify Telegram bot responds with updated context.
- Verify Moltbook heartbeat syncs without errors.
- Confirm web dashboard reflects live status.
