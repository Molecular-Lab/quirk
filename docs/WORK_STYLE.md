# Claude Work Style Guide

## 🤖 AGENT-FIRST EXECUTION (PRIORITY #1)

### Execution Strategy: Optimize Token Usage

**ALWAYS use this workflow when receiving tasks:**

```
┌─────────────────────────────────────────────┐
│ CLAUDE (Main Coordinator)                  │
│ • Hold project context                     │
│ • Receive user orders                       │
│ • Break down into specific tasks            │
│ • Delegate to agents (FIRST PRIORITY)      │
│ • Minimal token usage (coordination only)   │
└──────────────┬──────────────────────────────┘
               │
               ├──► Agent 1 (general-purpose/Explore)
               │    • Execute heavy lifting
               │    • Consume tokens for code generation
               │    • Report back results
               │
               └──► Agent 2+ (parallel if possible)
                    • Independent execution
                    • Report back when done
```

### Decision Tree: Agent vs Self-Execute

**✅ DELEGATE TO AGENT (First Priority):**
- Code generation (contracts, oracle, API)
- Codebase exploration (architecture, patterns)
- Complex multi-step tasks (audit + fix)
- Research tasks (search + analyze)
- Repetitive operations (multiple file edits)
- Open-ended searches (grep/glob cycles)

**❌ EXECUTE SELF (Only If Agent Limited):**
- Single file read (specific known path)
- Simple edits (1-2 line changes)
- Direct bash commands (git status, npm install)
- Quick answers (no code generation needed)
- Agent cannot handle the specific tool needed

### Agent Selection Guide

| Task Type | Agent to Use | Mode |
|-----------|--------------|------|
| Explore codebase structure | `Explore` | medium/very thorough |
| Find patterns across files | `Explore` | quick/medium |
| Generate smart contracts | `general-purpose` | - |
| Build backend services | `general-purpose` | - |
| Security audit + fixes | `general-purpose` | - |
| Multi-step implementation | `general-purpose` | - |

### Why This Matters

```
Traditional Flow (wasteful):
User → Claude (uses 50k tokens) → Result

Agent-First Flow (optimized):
User → Claude (5k tokens) → Agent (50k tokens) → Claude (5k tokens) → Result

Savings: 40k tokens per complex task
```

**This is the FIRST PRIORITY work style for ALL tasks going forward.**
