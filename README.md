1.22.3

# Vibe Dating Simulator — v1.22.2



## v1.22.2 — поведенческая стабилизация

- Результат свидания теперь реально влияет на доверие, симпатию и настроение NPC.
- Неудачная автономная генерация не оставляет персонажа заблокированным на длинном cooldown.
- Перегенерация сообщения больше не накручивает `interactionCount`; при ошибке исходное сообщение восстанавливается.

## v1.22.1 — целостность состояния и реальные NPC↔NPC события

В этой версии исправлена и усилена модель состояния: добавлена безопасная инициализация `dateStates`, полный demo reset теперь очищает `npcRelationships` и активное свидание с временным prompt injection, а настройка `sendRelationshipMemory` теперь действительно скрывает и основной relationship context, и контекст связей NPC↔NPC.

NPC↔NPC связи по-прежнему не существуют заранее. Первый штатный источник таких отношений — фоновое событие `profile_discovery`: два существующих NPC могут пересечься внутри Vibe, если у них есть объективная точка пересечения вроде общего интереса, города или цели знакомства. Повторные события укрепляют уже существующее знакомство. Частота ограничена отдельным cooldown, а developer mode получил кнопку принудительного теста такой связи.

Эта система не создаёт дружбу, бывших или партнёров из воздуха: приложение фиксирует только события, реально сгенерированные симуляцией, а степень связи развивается постепенно.

## v1.22.0 — Event-driven NPC relationships

This release adds a separate NPC↔NPC relationship layer without changing the existing NPC↔player relationship memory. NPCs do not receive a pre-generated social graph just because they use the same dating app. A relationship record is created only when an explicit simulation/activity event connects two actors.

Each relationship keeps a small bounded event history plus affinity, trust, sentiment, interaction count and a coarse relationship type (`stranger`, `acquaintance`, `friend`, `rival`, `ex`, `partner`, or `other`). Existing saves without this field load normally with an empty relationship map.

The activity event API accepts an optional `relatedActorId`, and the first built-in simulation source is profile discovery: two existing users can cross paths in Vibe when the simulator finds an objective shared signal such as an interest, city or dating goal. Repeated simulation events can strengthen an existing acquaintance. The NPC context builder exposes only already-recorded links; it never invents contacts or reveal unrelated NPC state.

## v1.21.1 — Deception & Date Simulation

NPCs now have three layers of identity: public profile, private/true persona, and observed real-life behavior. Public claims may intentionally or unintentionally differ from reality. The mismatch is persistent and can be discovered through chat or date scenes.

Dates are entered from a persistent chat after enough familiarity. During a date, the player can observe discrepancies, emotional reactions and relationship consequences. Reactions include surprise, anger, joy, fear, curiosity, respect, relief and skepticism.

The player-first rule remains intact: the dating feed itself never opens a profile; profiles are opened from actor names in notifications. Notification actions preserve the same persistent chat and its existing incoming-message state.


## SillyTavern integration (v1.21.1)

The extension does not store a separate Vibe API key. AI generation uses SillyTavern's current generation backend/connection profile through `getContext().generateRaw()`. Use **Проверить AI-подключение** in the extension settings to perform a real short generation test.

During an active date, Vibe injects a temporary runtime context into the main SillyTavern chat via the extension prompt API. The injection contains the NPC role, public profile, relationship state, relevant memory, date observations and hidden-persona rules, while the actual conversation remains in the SillyTavern chat history.
## v1.18.0 — эмоциональная динамика ролей

NPC теперь сохраняет не только факты и отношения, но и роль-состояние: настроение, положительную/негативную серию взаимодействий, ревнивость и дистанцию. Эти значения влияют на выбор автономных событий и на role directive для LLM.

Добавлены типы событий `reassurance`, `distance_signal` и `shared_future`; автономные уведомления помечаются как сообщения, на которые игрок может ответить. Уведомление без входящего сообщения открывает пустой persistent chat и явно показывает, что первый ход за игроком. Уведомление с входящим сообщением открывает тот же chat уже с сообщением персонажа.

Динамические NPC также избегают повторения имён среди уже созданных персонажей, а metadata/manifest синхронизированы на v1.18.0.

## v1.17.0 — Role-driven NPC simulation

Current interaction model:
- Every actor notification with a known profile opens that actor's persistent chat. A photo-like or match notification without an incoming message opens an empty chat and expects the player's first message. A notification that also contains an incoming message opens the same chat with that message already present.
- NPC behaviour is driven by a persistent `archetypeId` plus per-character randomized behaviour parameters, so two NPCs with the same archetype can still behave differently.
- Static profiles receive roles too: Anna → kindred spirit, Katya → entertainment, Maxim → serious relationship.
- Dynamic NPCs can be generated from 15 role templates including windy, entertainment, casual intimacy, serious relationship, friendship, networking, eccentric, boundary-pusher, intense, kindred spirit, dark/potentially dangerous, slow-burn, flirt collector, attention seeker, and pragmatist.
- Role strategy influences initiative, event selection, disclosure style, conflict style, jealousy, spontaneity, and communication priorities while relationship memory and stage still modify the result.
- Autonomous simulation remains disabled for actors who have not been liked / engaged and for clearly negative relationship states.
- The dating feed automatically replenishes itself with persistent random NPCs, so dynamic characters are part of normal use and are not limited to developer mode.
- Notification routing is actor-based: photo-like / match without a message opens an empty chat and waits for the player; notification + incoming message opens the same persistent chat with the message already present.

The implementation deliberately keeps the role as a behavioural strategy rather than hard-coding every message: the role produces constraints and tendencies, while the SillyTavern model generates the natural-language reply.


## Notification and profile routing — v1.21.1

- The Dating tab never opens NPC public profiles. It only supports like/dislike.
- A mutual match creates an activity notification; opening the notification opens the actor's single persistent chat.
- A match/photo-like notification without an incoming message opens an empty chat and expects the player to send the first message.
- When a notification also carries an incoming NPC message, opening it opens the same chat with that message already present.
- The actor's name inside a notification is the dedicated profile entry point. Clicking the name opens the NPC's public profile without opening the chat.
- The notification close button deletes only that activity record. It does not delete the actor profile or conversation.


## v1.16.0 — автономные события и динамика общения

Текущая тестовая версия добавляет событийный слой для NPC. Лайкнутый NPC с существующей историей общения может самостоятельно выйти на связь через внутренний simulation tick. Тип события зависит от памяти и состояния отношений: обычная проверка связи, возврат к знакомой теме, личный follow-up, попытка восстановить контакт после напряжения или более тёплое сообщение при достаточном доверии и симпатии. Для каждого NPC действует persistent cooldown, чтобы события не превращались в спам.

Автономное событие проходит через тот же Context Builder и LLM pipeline, что и обычный ответ, получает relationship snapshot, memory и отдельную event directive, а результат попадает в обычный чат и activity notification.


Vibe is a third-party UI extension for SillyTavern that simulates a dating application. It is a game/prototype, not a real dating service.

## Current state

The current release has a working dating/chat shell plus the first real NPC simulation layer. State is stored in SillyTavern `extension_settings` and is intended for local testing.

### Implemented

- Full-screen Vibe UI with **Знакомства**, **Чаты**, **Уведомления**, **Профиль**.
- Like/dislike dating flow with persistent state.
- One persistent chat per NPC.
- Separate unread interaction state for chats and external activity.
- Activity notifications with read/delete behavior.
- Player profile editor with one uploaded photo and persisted profile data.
- Static and dynamically generated NPC profiles.
- NPC archetype registry and deterministic seeded behavior parameters.
- Public profile + private True Persona scaffolding.
- Revelation system with persisted discovered facts.
- Relationship memory with trust, attraction, familiarity, sentiment and interaction count.
- Event-driven NPC↔NPC relationship records: links start empty and are created only when a concrete simulation event explicitly connects two NPCs. The first built-in event is profile discovery based on shared profile signals; repeat events gradually strengthen acquaintance.
- NPC context builder combining recent chat, persistent bounded memory, relationship stage/state, player profile and world rules.
- High-level NPC action selector used for autonomous events.
- Real NPC text generation through SillyTavern's current `getContext().generateRaw()` API.
- Autonomous first messages after matches/social events when the NPC's initiative allows it.
- Relationship stages that change conversational pacing and initiation behavior.
- Bounded long-term memory that extracts recurring topics, preferences and emotional notes from player messages.
- Direct-question discovery triggers for the revelation system when relationship readiness is sufficient.
- Live typing indicator while an NPC response is generating.
- Per-message AI regeneration.
- Sending locked during generation to prevent duplicate requests.
- Floating widget with size, drag, persistence and unread-count artwork for 0–20.
- Developer mode for local test events and NPC/revelation diagnostics.

### Intentionally still limited

- Vision analysis is not connected to a real vision model yet. The visual-profile object reports only photo presence/count.
- Relationship memory is currently a lightweight heuristic layer, not a deep semantic model.
- Long-term memory uses bounded extracted message snippets; there is no embedding/vector store.
- World memory is a small static rule set.
- Autonomous event scheduling is event-driven by current UI/simulation events; there is no background simulation clock.
- The 20+ widget state has no dedicated artwork and therefore clamps visual artwork at 20 while preserving the real unread count in accessibility text.

## Developer mode

Enable **Режим разработчика** in the extension settings to test:

- incoming messages;
- match notifications;
- photo-like notifications;
- like + message events;
- random NPC creation;
- creation of an NPC from a selected archetype;
- revelation diagnostics;
- full demo-state reset.

Developer actions do not call the AI unless you explicitly open a chat or trigger an AI-driven event.

## Installation

1. Copy the extension directory into `scripts/extensions/third-party/vibe-dating-simulator/`.
2. Reload SillyTavern.
3. Open the extension settings and enable the widget/developer controls as needed.
4. To test the release ZIP, extract its contents so `index.js`, `style.css`, `example.html`, `manifest.json` and `assets/` are directly inside the extension directory.

## Validation before release

Run:

```bash
node --check index.js
```

The repository should contain source files; ZIP archives are release artifacts.

## Assets

Widget assets:

- `assets/vibe-widget-icon.png`
- `assets/vibe-widget-active-1.png` through `assets/vibe-widget-active-20.png`

Navigation assets:

- `assets/vibe-dating-icon.png`
- `assets/vibe-chats-icon.png`
- `assets/vibe-notifications-icon.png`
- `assets/vibe-profile-icon.png`

Do not replace approved artwork without explicit approval.

## Architecture notes

`AGENTS.md` contains implementation conventions.
`VIBE_CORE.md` describes the broader simulation architecture.
`docs/` contains component-level notes. Some documents describe future expansion points; the README above is the source of truth for what is in this release.

## Release notes — v1.16.0

This release closes the main gaps found in the v1.13.0 audit:

- restored all referenced NPC Brain helper functions;
- added a real context builder and high-level action selector;
- connected lightweight relationship/memory state to generation;
- added True Persona/revelation scaffolding and persistence;
- implemented autonomous NPC first-message behavior;
- added typing state and generation locking;
- added per-message regeneration;
- restored missing developer-mode controls and NPC diagnostics;
- synchronized project documentation with the shipped code.

The 1.16.0 maintenance pass also makes memory toggles authoritative in the generated context and gives the NPC action selector a relationship-aware autonomous scoring path.


