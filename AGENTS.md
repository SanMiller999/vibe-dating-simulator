# Vibe Dating Simulator — AGENTS.md

## 0. Purpose

This repository is a SillyTavern third-party extension that simulates a realistic dating application called **Vibe**.

The project is a game/simulation, not a real dating service.

Codex must treat this file as the project's source-of-truth development guidance.
When requirements in the user request conflict with this file, prefer the newest explicit user instruction, but preserve the architectural principles below unless the user explicitly changes them.

---

# 1. Development Rules

## 1.1 Do not rewrite unrelated parts

When implementing a requested change:

- change only the files and code paths necessary;
- do not redesign unrelated UI;
- do not remove existing settings or features unless explicitly requested;
- do not replace selected artwork without explicit approval;
- preserve existing behavior that is not part of the requested change.

## 1.2 Never silently discard existing functionality

Before modifying a component, inspect how it currently works.

Especially protect:

- widget behavior;
- widget settings;
- memory settings;
- notification logic;
- chat persistence;
- navigation;
- existing assets.

## 1.3 Validate before finishing

For JavaScript changes:

- run syntax validation;
- inspect the changed code path;
- make sure referenced functions/assets exist;
- check that the extension can still initialize.

For asset changes:

- verify filenames exactly;
- verify transparency;
- verify dimensions/aspect ratio;
- verify all expected variants exist.

## 1.4 Prefer small, reversible changes

Do not make a giant refactor merely to implement a small feature.

Use focused changes with clear commits.

---

# 2. Product Identity

Vibe should feel like a believable dating/social application inside SillyTavern.

It should have:

- dating profiles;
- likes/dislikes;
- matches;
- persistent one-person chats;
- notifications/activity;
- photos and comments;
- a floating launcher widget;
- future AI-driven NPCs and roleplay-linked characters.

Vibe should look like a real product, while remaining a simulation/game.

---

# 3. Core UI

The main in-app sections are:

1. **Знакомства**
2. **Чаты**
3. **Уведомления**
4. **Профиль**

Bottom navigation icons are custom artwork and should remain visually consistent.

Do not replace the approved icons unless the user explicitly asks.

---

# 4. Dating Tab: «Знакомства»

This tab is ONLY for:

- browsing potential partners;
- like;
- dislike.

There is **NO unread counter** on «Знакомства».

There are **NO message notifications** on «Знакомства».

A like means:

- the player liked a profile;
- the profile becomes available for messaging / a match conversation;
- the player may immediately be taken to the chat.

Do not treat a player's own like action as an unread notification.

---

# 5. Chats

## 5.1 One person = one chat

This is a hard rule.

For a specific person, there must be exactly one persistent conversation.

Example:

```text
Anna
  └── one conversation
      ├── message 1
      ├── message 2
      ├── message 3
      └── ...
```

Never create multiple conversations with the same person just because:

- a new message arrived;
- a match event happened;
- the user reopened Vibe;
- the user returned later.

## 5.2 Chat presentation

The chat is one continuous scrollable message timeline.

Messages are preserved and appended chronologically.

Leaving the app must not create a new chat.

## 5.3 Unread chat logic

Unread state belongs to the **conversation/interaction**, not to each individual message.

If Anna sends 5 messages while her chat is unread:

- that is ONE unread chat interaction;
- the counter must increase by 1, not 5.

Opening Anna's specific chat marks Anna's unread chat interaction as read.

Opening only:

- Vibe;
- the Chats tab;
- the Notifications tab

does NOT automatically mark all chats as read.

---

# 6. Notifications

The Notifications tab is for **outside activity**, not for listing unread chat messages.

Examples:

- someone liked the player's photo;
- someone matched with the player;
- someone sent a gift;
- someone interacted with a profile/photo;
- other bot/NPC activity;
- future social events.

Do NOT display messages like:

> "3 unread messages"

inside the Notifications feed.

Unread message state is visible through:

- the widget;
- the Chats badge.

Notifications should contain actual activity records.

## 6.1 Match notification

If an NPC matches the player:

- create a notification/activity item;
- show the NPC name;
- make the activity notification clickable;
- clicking it marks that activity as read;
- clicking it navigates to the one persistent chat for that NPC.

The same actor-routing rule applies to other actor notifications such as `photo_like` and `profile_like`. If the activity has no incoming message, opening it shows an empty chat and the first message belongs to the player. If the activity also generated an incoming message, opening it shows that existing message in the same persistent chat.

If there is no matching chat yet, create/open the one persistent chat for that NPC.

## 6.2 Future activity types

The activity system should be extensible for:

- `match`
- `photo_like`
- `gift`
- `profile_like`
- `photo_comment`
- other social activity

Do not hard-code the Notifications screen around one event type.

---

# 7. Shared Unread Interaction Concept

There are two major unread channels:

1. unread chat interactions;
2. unread external/social activity.

The floating widget may show a combined total of unread interactions, while the in-app badges remain separated by purpose.

Recommended meaning:

```text
Chats badge = unread chat conversations
Notifications badge = unread external activity
Widget count = combined unread attention count
```

«Знакомства» must not contribute to an unread badge simply because the player liked someone.

---

# 8. Floating Widget

The widget is the floating launcher for Vibe.

## 8.1 Interaction

- short tap = open Vibe;
- press-and-hold = drag/move;
- widget can be repositioned freely;
- widget has a configurable size;
- widget can be disabled;
- «Поиск» in settings returns it to the bottom-right position and highlights it.

## 8.2 Visibility

When Vibe is open:

- hide the floating widget completely.

When Vibe closes:

- show the widget again;
- restore the correct current artwork state;
- preserve unread state.

## 8.3 Normal state

When there are **zero unread interactions**:

- show the normal white envelope artwork;
- the heart is pink;
- no number is shown.

## 8.4 Active states

When there are unread interactions:

- use the corresponding numbered artwork;
- number must represent the real unread interaction count;
- supported range is 1–20;
- the number is part of the artwork itself, NOT a separate HTML/CSS badge.

Mapping:

```text
0  -> normal pink-heart envelope
1  -> vibe-widget-active-1.png
2  -> vibe-widget-active-2.png
...
20 -> vibe-widget-active-20.png
```

The widget artwork must not use a number that does not match the real unread count.

## 8.5 Reading flow

Expected behavior:

```text
new interaction
    ↓
widget changes to corresponding numbered image
    ↓
user taps widget
    ↓
Vibe opens, widget hides
    ↓
user reads the relevant chat/activity
    ↓
unread count decreases
    ↓
if unread count becomes 0:
    restore normal pink-heart envelope
```

If unread interactions remain, the widget should use the corresponding remaining number when Vibe closes.

---

# 9. Widget Asset Requirements

Widget assets are 21 states:

```text
vibe-widget-icon.png
vibe-widget-active-1.png
...
vibe-widget-active-20.png
```

Requirements:

- transparent background;
- cleanly cropped artwork;
- consistent visible scale;
- no neighboring artwork;
- no black background rectangles;
- all variants visually aligned;
- white envelope artwork;
- normal state has a pink heart;
- numbered states use the approved black circular badge with white outline and white number.

Do not regenerate or replace the approved widget artwork unless explicitly requested.

---

# 10. In-App Navigation Icons

The four navigation icons are:

- Знакомства
- Чаты
- Уведомления
- Профиль

They should be visually compact inside the bottom navigation.

Do not make them huge.

The navigation should remain balanced and readable on mobile screens.

Badge counters must be smaller than the icon itself.

---

# 11. Settings Panel

SillyTavern extension settings must retain these sections:

## 11.1 Виджет

This is collapsible.

Contains:

- show/hide widget;
- widget size;
- short-tap / hold instruction;
- **Поиск** button.

Do not remove this section.

## 11.2 Настройки памяти

This is also collapsible.

Contains:

- automatic memory;
- context size;
- chat memory size;
- AI response limit;
- use player profile;
- use visual profile;
- use relationship memory;
- use world memory.

Do not remove this section.

Settings must continue to load saved values after the settings HTML is injected.

---

# 12. Memory / AI Architecture

Vibe is designed around a future AI layer.

Important systems:

```text
Player Persona
Public Profile
True Persona
Visual Profile
Discovery Memory
Relationship Memory
Expectation Model
Current Situation
World Awareness
Simulation Engine
Context Builder
AI
```

These are architectural concepts and are not all fully implemented yet.

Do not claim that a feature is implemented just because its architecture is documented.

---

# 13. Player Persona

The player's Persona is always authored by the user.

AI must NEVER write actions/dialogue for the player's Persona unless the user explicitly asks for generation.

Rule:

```text
PLAYER PERSONA -> USER
```

---

# 14. NPC / Character Types

Vibe supports three conceptual character sources:

## 14.1 Player Persona

Written by user.

## 14.2 SillyTavern Character

An existing character from a SillyTavern roleplay.

The character can have:

- a SillyTavern Persona/Character Card (true/internal state);
- a Vibe Public Profile (public dating profile).

These are separate.

## 14.3 Vibe NPC

A character that exists only inside Vibe.

AI writes for the NPC.

---

# 15. Public Profile vs True Persona

A character may show a Vibe profile that differs from their real Persona.

Example:

```text
Public Vibe profile:
Age 27
Moscow

True Persona:
Age 31
Saint Petersburg
```

This is intentional simulation behavior.

Do NOT add a user-facing "honesty 73%" slider.

There is no generic honesty setting.

Differences should be discovered naturally.

---

# 16. Expectation vs Reality

Before meeting someone, the player forms an expectation from:

- public profile;
- photos;
- captions;
- comments;
- conversation.

The actual person may differ because of:

- old photos;
- filters;
- flattering angles;
- changed appearance;
- exaggeration;
- omissions;
- deliberate lies.

AI should react naturally.

Do NOT produce a mechanical "LIE DETECTED" event unless a future user feature explicitly asks for it.

---

# 17. Photo AI

A profile photo should ideally be analyzed once using a vision model.

Concept:

```text
photo
  ↓
vision analysis
  ↓
stored visual profile
  ↓
NPC context
```

Do not repeatedly resend the same photo to the model on every message.

Visual facts may include:

- approximate age;
- hair;
- clothing;
- visible accessories;
- environment;
- notable objects;
- mood/expression;
- other visually useful facts.

Photo comments are separate social events.

---

# 18. Discovery Memory

A character should only know facts they realistically learned.

Example:

```text
PUBLIC:
"I like dogs."

TRUE:
I have a dog named Rex.

DISCOVERED:
The character learned the dog's name later in chat.
```

The AI must never use hidden/private information as if it had been learned naturally.

---

# 19. Relationship Memory Bridge

Roleplay and Vibe are separate worlds.

A SillyTavern character can exist in both.

They may share a **Relationship Memory Bridge**.

This bridge can remember:

- how the two met;
- important conversations;
- important facts learned from each other;
- promises;
- emotional events;
- major relationship changes.

Do NOT copy the full Vibe chat into the roleplay context.

Do NOT copy the full roleplay chat into Vibe.

Only meaningful relationship memory should cross the bridge.

---

# 20. No Telepathy

Hard rule.

A character only knows what they could realistically know.

If the character is in the same room as the player in roleplay:

- Vibe messages may reference that physical proximity naturally.

Example:

> "Are you seriously texting me through Vibe? I'm literally standing next to you."

If the character is far away:

- they must behave as being far away;
- they cannot imply physical presence with the player.

Current location, time, scene, and physical distance belong to **Current Situation / World Awareness**.

---

# 21. Current Situation

Future Context Builder should include facts such as:

- world;
- current location;
- nearby people;
- distance to player;
- time;
- current activity;
- availability;
- current scene.

These facts should influence NPC responses.

---

# 22. Context Builder

The LLM should not receive the entire world state every time.

Context Builder should choose only relevant context:

```text
Persona
+
public profile
+
relevant memory
+
relationship state
+
current situation
+
current conversation
```

Then the AI generates the NPC response.

---

# 23. Memory Core

Future memory system should distinguish:

- short-term conversation memory;
- long-term facts;
- relationship memory;
- discovery memory;
- world memory;
- emotional importance.

Do not equate raw conversation length with memory.

Do not blindly send the entire history to the LLM.

---

# 24. Persistence

Chats should eventually persist as real data, not just temporary UI state.

One person must map to one conversation record.

Suggested conceptual model:

```text
Conversation
- conversation_id
- participant_id
- messages[]
- unread_state
- last_activity
- relationship_id
```

Messages should be chronological and persistent.

---

# 25. Activity Model

Social activity should be an extensible event system.

Suggested shape:

```text
ActivityNotification
- id
- type
- sourceId
- actorId
- createdAt
- read
- title
- text
- metadata
```

Potential types:

```text
match
photo_like
gift
profile_like
photo_comment
```

Messages are not activity notifications.

---

# 26. Current Development Stage

Important:

The project currently has a working UI/prototype foundation, including:

- floating widget;
- widget movement;
- widget settings;
- collapsible widget settings;
- collapsible memory settings;
- bottom navigation;
- dating tab;
- chats;
- notifications;
- profile placeholder;
- unread interaction counters;
- widget state artwork;
- notification/activity foundation.

The following are **architectural plans and not fully implemented**:

- full Player Profile editor;
- photo upload pipeline;
- Vision AI;
- Profile Binding;
- Memory Core;
- Relationship Memory Bridge;
- World Awareness;
- true SillyTavern Persona synchronization;
- production AI Context Builder;
- autonomous NPC simulation.

Codex must distinguish "planned" from "implemented".

---

# 27. Git Workflow

Before modifying:

```bash
git status
```

After modifying:

```bash
git diff
```

Run validation.

Then commit with a clear message.

Prefer small commits like:

```text
fix: separate chat and activity notifications
fix: restore widget state switching
ui: compact navigation icons
feat: add persistent conversation model
```

Never force-push or rewrite history unless explicitly requested.

---

# 28. When a requested change is ambiguous

Do not guess if the ambiguity could affect architecture or break existing behavior.

Ask for clarification.

For cosmetic changes, prefer the smallest reasonable interpretation.

---

# 29. Working Philosophy

Vibe should feel:

- believable;
- persistent;
- socially reactive;
- contextual;
- imperfect;
- not omniscient;
- internally consistent.

The AI should behave like a participant in the simulation, not like a narrator who knows everything.


## Notification chat-entry rule

- Every actor notification must resolve to the actor's persistent chat.
- `expectsPlayerReply: true` means the notification may open an empty chat where the player sends the first message.
- If the notification carries an incoming message, that message belongs to the same persistent chat; opening the notification must never create a second conversation.
- Role state is persistent and may influence event choice, mood and autonomous behavior.


## v1.19 notification routing clarification

- Dating feed: no public-profile navigation. Like/dislike only.
- Notifications: clicking the notification body opens the actor's persistent chat.
- Clicking the actor name opens the actor's public profile.
- Clicking `×` deletes only the notification.
- Match/photo-like without an incoming message: empty chat, player first.
- Match/photo-like with an incoming message: same chat, existing NPC message.


## Date Simulation Rules

Do not assume that a public profile is a factual description of real-life behavior. NPCs may exaggerate, omit or strategically present themselves. Discovery should happen through conversation or date observations, not by leaking hidden state. Dates update relationship memory and can produce emotional reactions.


- Date mode must integrate with the host SillyTavern chat via prompt injection rather than duplicating the roleplay conversation in the Vibe UI.
- The extension must reuse the current SillyTavern generation backend/connection profile and must not require or store a second API key.
