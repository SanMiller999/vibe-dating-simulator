# AI Integration

Vibe uses the currently selected SillyTavern model through `SillyTavern.getContext().generateRaw()`.

Player message:
Player -> Character Brain -> Context Builder -> LLM -> NPC reply -> persistent chat.

Autonomous social event:
Like / match / activity -> Character Brain decides whether to initiate -> Context Builder -> LLM -> NPC reply -> same persistent chat + unread chat interaction.

A notification never creates a second conversation. Every actor notification resolves to that actor's one persistent chat. A social event can exist without a message; in that case opening the notification leaves the empty chat to the player. If the event includes an incoming message, opening the notification lands in the same chat with that message already present.

The dating feed also replenishes itself with persisted random NPCs. Each dynamic NPC has one archetype/role plus randomized individual behaviour parameters, so the role is stable while the individual personality varies. The generated context now includes relationship stage, long-term memory signals, revelation state and role strategy.

No separate Vibe API key is stored.


## v1.22.3 connection behavior

The extension does not store a separate API key. `generateRaw()` is called without an `api` override, so generation uses the current SillyTavern backend/connection configuration. The settings test performs a real short generation request and only treats an empty response as failure.
