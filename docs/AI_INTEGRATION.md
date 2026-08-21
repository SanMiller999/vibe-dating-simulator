# AI Integration

Vibe uses SillyTavern's current LLM through the stable `getContext()` API.

Flow:

Player message → Character Brain → Context Builder → `generateRaw()` → NPC reply → chat state/memory update.

The current selected SillyTavern provider/model is used. Vibe does not store a separate API key.

The prompt separates public profile, internal personality, relationship state, memory, current situation and recent conversation.

If the host generation API is unavailable, Vibe shows an error instead of inventing a reply.
