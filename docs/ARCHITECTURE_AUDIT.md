# Architecture Audit — Phase 10

## Current state

The extension currently keeps the simulation engine inside `index.js`.
This is functional, but creates coupling between systems.

## Identified logical areas

| Area | Current location | Future extraction target |
|---|---|---|
| State and save handling | index.js | state-manager.js |
| NPC profiles and generation | index.js | npc-engine.js |
| Memory handling | index.js | memory-engine.js |
| Dating flow | index.js | dating-engine.js |
| Events and simulation ticks | index.js | event-engine.js |
| Diagnostics | index.js | diagnostics.js |

## Phase 10 decision

No runtime split is performed yet.

Reason:

- preserve save compatibility;
- avoid changing function order dependencies;
- keep SillyTavern integration stable.

## Next safe refactor order

1. Extract pure helper functions.
2. Add module wrappers.
3. Move one subsystem at a time.
4. Run syntax and save compatibility checks after each move.
