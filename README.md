# Vibe Dating Simulator — v1.12.1

Vibe is a third-party UI extension for SillyTavern that simulates a dating application. It is a game/prototype, not a real dating service.

`AGENTS.md` contains the implementation rules; `VIBE_CORE.md` describes the planned simulation and AI architecture. They are intentionally broader than the currently implemented release.

## What works now

- Full-screen mobile-oriented Vibe overlay with four tabs: **Знакомства**, **Чаты**, **Уведомления**, and **Профиль**.
- Three built-in prototype profiles, a like/skip flow, and one persistent chat per person.
- Chats, likes, skips, unread state, and activity items persist in the extension's settings.
- **Знакомства** has no unread badge. A player like opens/unlocks a chat, but is not presented as a mutual match.
- **Чаты** count unread conversations; several unread messages from one person count as one interaction.
- **Уведомления** are reserved for external activity such as a mutual match or photo like. They do not list unread messages.
- The floating widget can be enabled, resized, moved by press-and-hold, and returned to the lower-right corner with **Поиск**.
- The widget hides while Vibe is open. It uses the approved embedded-number artwork for 0–20 unread interactions.
- Widget and Memory settings are independent collapsible sections and reload saved values after the settings UI is injected.

## Development mode

Enable **Режим разработчика** in the extension settings to create local demo events:

- incoming message from Anna;
- mutual match with Katya;
- photo-like activity from Maxim;
- reset of prototype data.

This mode has no AI calls, no server plugin, and no external network requests. It is intended to test the Chats, Notifications, badges, and widget states before the simulation layer exists.

## Current limitations

- Profiles, initial messages, and replies are fixed prototype data; there is no AI generation yet.
- Player profile editing, photo upload, vision analysis, Profile Binding, Memory Core, Context Builder, and autonomous NPC events are planned, not implemented.
- Widget artwork exists for counts 0–20. There is no approved `20+` asset yet, so production event generation must define an overflow design before it can create more than 20 simultaneous unread interactions.
- Chats currently use `extension_settings` persistence and are therefore local prototype data, not private encrypted storage.

## Asset inventory

Widget assets:

- `assets/vibe-widget-icon.png` — normal state, 0 unread;
- `assets/vibe-widget-active-1.png` through `assets/vibe-widget-active-20.png` — exact embedded count states.

Navigation assets:

- `assets/vibe-dating-icon.png`
- `assets/vibe-chats-icon.png`
- `assets/vibe-notifications-icon.png`
- `assets/vibe-profile-icon.png`

Do not replace approved artwork without explicit approval.

## Release checklist

1. Install the extension from the repository and reload SillyTavern.
2. Confirm the widget opens Vibe with a short tap and moves only after press-and-hold.
3. In Developer mode, create each demo event and verify the corresponding tab and badge.
4. Open a specific chat and verify only that chat's unread state clears.
5. Close Vibe and verify the widget returns with its current unread artwork.
6. Run `node --check index.js` before publishing a ZIP release.

Keep source files in the repository and produce ZIP files only as release artifacts.


## Player profile editor — v1.12.1

Добавлен первый реальный слой профиля игрока: фото, имя, возраст, город, пол, кого ищу, цели знакомств, интересы, профессия, образование и «О себе». Данные сохраняются в настройках расширения. Полный AI-анализ фото, несколько фото, public-vs-true persona и Profile Binding остаются следующими этапами.


## Hotfix — v1.12.1

Исправлена критическая ошибка инициализации панели расширения, из-за которой Vibe переставал загружаться целиком:
- объект `settings` теперь создаётся до обращения к `settings.playerProfile`;
- восстановлен путь активной иконки виджета;
- миграция `activityNotifications` нормализована в массив.

Функциональность профиля игрока из v1.6.0 сохранена.


## Profile UI v1.12.1
Built strictly from the known-good v1.6.1 base. Added the new dating goal, fixed age field styling, and added a saved profile view/editor without changing widget/settings/chat/notification initialization.


## Notification-to-chat routing + NPC archetypes — v1.12.1

- Any actor-backed notification can open the single persistent chat with that character.
- A photo-like or match notification can open a chat with no automatic first message.
- A combined like+message event can create the same notification and an unread message in the same one-person chat.
- Activity and chat unread states remain separate.
- Added a first NPC archetype registry (`NPC_ARCHETYPES`) and dynamic NPC profile store. Each generated NPC gets a random name, profile details, a stable archetype id and randomized behavior parameters.
- Archetypes are behavior templates, not hard-coded scripts. They are intended to become inputs to the future AI Context Builder / Simulation Engine.


## NPC Brain foundation — v1.12.1

Added a structured Character Brain foundation for generated NPCs:

- deterministic seeded behavior;
- randomized personality traits per NPC;
- archetype-specific behavioral strategy;
- persistent brain state;
- structured NPC context builder;
- local high-level action selector;
- dynamic NPC persistence;
- compatibility migration for earlier generated NPCs.

This does not yet call an LLM. Natural-language generation is the next layer.


## NPC archetype expansion — v1.12.1

Expanded the archetype catalog to include the user's requested behavioral profiles, including windy, entertainment-seeking, casual intimacy/sex, serious relationship, friendship, practical networking, kindred spirit, chaotic, dangerous/obsessive, boundary-pushing/pervert, and several additional variants for greater simulation diversity.


## NPC Character Factory — v1.12.1

Added the concrete NPC generation layer:

- random identity;
- public dating profile;
- profile goals/interests;
- persistent visual-profile placeholder;
- private True Persona;
- Character Brain;
- deterministic seed;
- persistent dynamic profile record.

The factory can create a random NPC or a specific archetype. The actual natural-language AI call remains the next integration layer.


## AI integration — v1.12.1

The first real NPC reply path now uses SillyTavern's selected LLM through `getContext().generateRaw()`. The NPC Brain chooses a high-level action first, then a context-rich prompt is generated. A separate Vibe API key is not stored.


## Expectation / Revelation — v1.12.1

Implemented public-profile vs true-persona discrepancy tracking, contextual discovery, emotional reaction, and relationship trust/attraction updates. The AI context now includes only the discrepancies/revelations the simulation has made relevant.


## AI reply fix — v1.12.1

Removed the hard-coded NPC response. Player messages now call SillyTavern's current LLM via `getContext().generateRaw()`, using the NPC Brain, public profile, relationship state, memory and recent conversation as context.


## AI-initiated first messages — v1.12.1

NPCs can now autonomously send their first message after a like/match/social activity when their Brain's initiative allows it. The message is generated by the same SillyTavern model used for normal chat replies and is stored in the same persistent one-person chat. There is no second chat and no hardcoded first-message text.


## Notification dismissal — v1.12.1

Each external activity notification now has two separate actions:
- click the notification body/name to mark it read and open the single persistent chat;
- click `×` to delete only that notification without opening the chat.

Deleting a notification does not delete the chat, its messages, or relationship state.


## NPC public profile — v1.12.1

Generated NPCs receive the same public-profile field structure as the player. A profile is shown on demand. Notification actor/profile button opens the NPC profile, while the notification body opens the persistent chat and X deletes only the notification. Chat avatar opens the profile; chat body opens the conversation.


## Profile readability cleanup — v1.12.1

- Profile name is forced to a readable black color.
- The «Изменить» button now has explicit dark text and a light background.
- Age is displayed with the `лет` suffix.
- Removed the redundant player-profile preview section «Как вас увидят в знакомствах».
