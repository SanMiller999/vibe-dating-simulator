# Vibe Dating Simulator — v1.5.2

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
