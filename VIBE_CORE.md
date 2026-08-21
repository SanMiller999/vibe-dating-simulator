# Vibe Core — Brain / Simulation Specification

## Purpose

Vibe is a realistic dating-app simulation inside SillyTavern.

The UI is only the shell. The long-term goal is a believable social simulation where:

- the player has a public dating profile;
- NPCs have public profiles and private/internal personalities;
- conversations persist;
- characters remember meaningful things;
- roleplay characters and Vibe can coexist as independent worlds;
- important relationship memory can bridge those worlds;
- characters do not have telepathy;
- the AI acts according to what the character realistically knows.

This document describes the intended "brain" of Vibe.

---

# 1. Core Principle

The AI must not be the source of truth for the whole world.

The simulation engine owns world state.

The AI interprets that state and generates natural language.

Conceptually:

World State
→ Simulation / Decision logic
→ Context Builder
→ AI
→ Character message / action
→ World State update

The model should not arbitrarily decide global facts such as:
"Anna now loves the player."

The simulation should determine relationship state; the model expresses it naturally.

---

# 2. Character Identity Model

A Vibe participant can be one of three conceptual types.

## Player Persona

The player's Persona is always written and controlled by the user.

AI must not write dialogue or actions for the player's Persona unless the user explicitly asks for generated text.

## SillyTavern Character

An existing SillyTavern character can have:

- a SillyTavern Persona / Character Card;
- a Vibe public profile;
- a Vibe conversation state;
- relationship memory with the player.

The character may exist simultaneously in Vibe and Roleplay.

## Vibe NPC

A character that exists only in Vibe.

The AI can generate its personality, profile, messages and behavior, subject to simulation state.

---

# 3. Independent Worlds

Vibe and Roleplay are independent worlds.

A character may exist in both.

They do not share:

- complete chat history;
- current scene;
- local world state;
- every event.

They may share a Relationship Memory Bridge.

Conceptually:

Character
├── Roleplay State
├── Vibe State
└── Relationship Memory

This is deliberate.

A character can have a separate dating life in Vibe and a different roleplay situation in SillyTavern.

---

# 4. Public Profile vs True Persona

A public Vibe profile is not guaranteed to be the full truth.

There is no user-facing generic "honesty" percentage.

The public profile may:

- be accurate;
- omit information;
- exaggerate;
- use old photos;
- differ in age/location/job;
- present a different social image.

The character's true/internal state comes from:

- SillyTavern Persona / Character Card for linked ST characters;
- internal NPC state for Vibe-only NPCs.

The AI should use the difference between public profile and true state to produce realistic discovery and reactions.

Do not expose an internal "lie detected" label unless explicitly requested.

---

# 5. Expectation Model

Before meeting someone, the player develops expectations based on:

- public profile;
- photos;
- captions;
- comments;
- messages;
- visible behavior.

A real meeting may reveal differences.

Examples:

- photo is old;
- hair changed;
- appearance differs in person;
- age differs from profile;
- personality feels different from profile;
- profile is technically true but creates a misleading impression.

The system should model:

Expected Person
vs
Observed / True Person

The AI should react naturally.

The user should experience this through dialogue and scenes, not a mechanical "truth mismatch" popup.

---

# 6. Visual Profile / Photo Memory

A profile photo can be analyzed once by a vision model.

Preferred pipeline:

Photo
→ Vision analysis
→ Stored visual profile
→ Reusable context

Do not resend the same photo on every message if a stored analysis exists.

Visual profile may contain:

- approximate apparent age;
- hair;
- facial hair;
- clothing;
- accessories;
- apparent build;
- expression;
- visible environment;
- notable objects;
- other useful visual facts.

Each photo can also have:

- caption;
- tags/facts;
- comments;
- history.

NPCs may mention visible photo details naturally.

---

# 7. Knowledge Model

Never confuse truth with knowledge.

For each important fact, distinguish:

## True State

What is actually true in the simulation.

## Character Knowledge

What this specific character knows.

## Discovered Information

What the character has learned through interaction.

## Relationship Memory

What matters to the relationship between the two participants.

A character must not magically know hidden facts.

Example:

True:
player has a dog named Rex.

Public profile:
"Likes dogs."

Discovered:
Anna learns during chat that the dog's name is Rex.

Anna can later remember Rex.

She should not know Rex before learning it.

---

# 8. No Telepathy Rule

This is mandatory.

Characters only know things they could realistically know.

A character must not:

- know private information they were never told;
- know what happened in another world without a memory bridge;
- know the player's exact location without a valid source;
- act as though they are physically nearby when they are not;
- instantly understand hidden thoughts.

Example:

If Anna is physically next to the player in Roleplay and the player sends her a Vibe message, Anna may naturally react:

"You seriously just messaged me in Vibe? I'm standing right here."

If Anna is hundreds of kilometers away, she must behave as distant.

---

# 9. Current Situation / World Awareness

The current situation may contain:

- world;
- location;
- specific scene;
- nearby people;
- distance to player;
- current time;
- current activity;
- availability;
- physical presence.

This should influence AI output.

Example:

Current roleplay:
Anna = same room as player.

Vibe message:
"Where are you?"

Possible natural answer:
"Literally two meters from you."

The AI should not fabricate physical circumstances inconsistent with current situation.

---

# 10. Relationship Memory Bridge

Vibe and Roleplay can share meaningful relationship memory without becoming one world.

The bridge can store:

- where/how they met;
- meaningful conversations;
- important facts learned;
- promises;
- conflicts;
- emotionally important events;
- relationship changes.

Do not copy the full chat history across worlds.

Instead, compress important cross-world relationship facts.

Example:

Relationship memory:
- met through Vibe;
- talked about dogs;
- player works as a designer;
- first meeting occurred on August 19;
- Anna was upset after a two-day disappearance.

That summary can affect a later Roleplay conversation.

---

# 11. Memory Core

Memory should be layered.

## Short-Term Memory

Recent messages needed for immediate continuity.

## Long-Term Memory

Stable facts and important events.

## Discovery Memory

Facts the character has learned about the player.

## Relationship Memory

Important facts and emotional events specifically about the relationship.

## World Memory

Important events in the broader simulation.

## Emotional Importance

Memories can carry importance.

Examples:

Small:
"likes coffee"

High:
"first confession"

Very high:
"major betrayal"

Higher-importance memories should survive longer and be more likely to be retrieved.

---

# 12. Memory Compression

When a conversation becomes long:

Do not blindly keep sending all old messages.

Preferred flow:

recent messages
+
relevant memories
+
relationship summary

Old conversation can be summarized and turned into structured memory.

The user should not need to manually trigger summarization.

---

# 13. Context Builder

The Context Builder selects only relevant information for the current AI call.

Possible context:

- character persona;
- public Vibe profile;
- player profile;
- visual profile;
- current relationship state;
- relevant recent messages;
- relevant memories;
- expectation state;
- current location/time/situation;
- roleplay/Vibe world context.

Do not dump the entire database into every AI request.

---

# 14. Relationship State

Relationships should be represented as state, not only prose.

Possible dimensions:

- attraction;
- interest;
- trust;
- affection;
- comfort;
- jealousy;
- tension.

Possible statuses:

- stranger;
- liked;
- matched;
- talking;
- flirting;
- dating;
- exclusive;
- friend;
- ghosted;
- blocked.

Values should be able to move independently.

Example:

High attraction + low trust is valid.

---

# 15. Communication Model

One person = one persistent conversation.

A conversation should contain:

- conversation_id;
- participants;
- messages;
- last activity;
- unread state;
- relationship reference.

All messages with that participant belong to the same chronological timeline.

Never create a new chat merely because the user:

- returned to Vibe;
- received another message;
- reopened the application;
- received a match event.

---

# 16. Unread Interaction Model

Unread is an interaction-level concept.

For a chat:

5 new messages from Anna while the chat is unopened = one unread chat interaction.

Not five.

Unread chat interaction clears when the specific chat is opened/read.

Opening:

- Vibe;
- the Chats tab;
- the Notifications tab

must not clear all unread chats.

---

# 17. Social Activity Model

External social activity is separate from messages.

Examples:

- someone liked a photo;
- someone matched with the player;
- someone sent a gift;
- someone commented on a photo;
- someone liked a profile;
- future social events.

These belong to an activity/event stream.

Suggested activity fields:

- id;
- type;
- actor;
- sourceId;
- createdAt;
- read;
- title;
- text;
- metadata.

Messages should not be duplicated into the Notifications feed.

---

# 18. Notification Semantics

## Chats tab

Shows unread conversations.

Its counter is:

number of unread chat interactions.

## Notifications tab

Shows external activity.

Its counter is:

number of unread external activity items.

It should not say:

"3 unread messages."

Messages belong to Chats.

## Dating tab

No unread counter.

No activity counter.

It is only:

- browse;
- like;
- dislike.

---

# 19. Match Behavior

Player likes a profile.

This should:

- record the like;
- unlock/create the single persistent chat;
- optionally show a match state;
- allow writing to the person.

The player's own like action is not an unread notification.

If the NPC independently likes the player and a mutual match occurs:

- create an external activity notification;
- allow that notification to link to the appropriate chat;
- mark the activity as read when opened.

---

# 20. Widget Meaning

The widget is an attention indicator.

Normal:

0 unread interactions
→ normal envelope with pink heart.

Active:

1–20 unread interactions
→ matching numbered artwork.

The artwork itself contains the number.

Mapping:

0 → vibe-widget-icon.png
1 → vibe-widget-active-1.png
...
20 → vibe-widget-active-20.png

The displayed number must equal the actual current unread attention count, subject to the 20-state design.

When Vibe opens:

- hide the widget.

When Vibe closes:

- show it again;
- restore the current correct state.

If the last unread item was read:

- immediately restore the normal pink-heart envelope.

---

# 21. Profile Architecture

Player and NPC profiles should ultimately support:

- photo(s);
- main photo;
- captions;
- name;
- age;
- city;
- gender;
- search preferences;
- dating goals;
- occupation;
- education;
- about text;
- interests;
- additional profile fields.

Player profile is editable by the player.

For linked SillyTavern characters:

Vibe Public Profile is editable independently from Character Card/Persona.

---

# 22. Profile Binding

A Vibe profile can represent:

- Player Persona;
- SillyTavern Character;
- Vibe-only NPC.

A linked SillyTavern Character has:

Public Vibe Profile
+
True SillyTavern Persona

These must remain separate data sources.

Character writing rules:

Player Persona → user
ST Character → AI
Vibe NPC → AI
Random Vibe user → AI

---

# 23. Roleplay Integration

The same character may exist in Roleplay and Vibe independently.

Use a stable binding identifier, not only a display name.

Conceptually:

```text
character_binding
- character_id
- vibe_profile_id
- relationship_id
```

This allows the same ST character to be recognized across contexts.

---

# 24. AI Behavior Philosophy

Characters should feel imperfect and human-like.

They can:

- misunderstand;
- be awkward;
- be inconsistent;
- hesitate;
- take time to answer;
- react emotionally;
- notice profile details;
- remember previous conversations;
- have different personalities.

But they should remain constrained by simulation state and knowledge.

The AI is not a narrator with god-mode access.

---

# 25. Random Users / Unexpected Activity

The simulated app can generate:

- ordinary messages;
- weird messages;
- unsolicited messages;
- rude comments;
- flirtation;
- sexual/awkward content;
- spam/scams;
- unexpected likes;
- random matches.

These should be event-driven rather than a pile of unrelated hard-coded messages.

Future implementation should support event probability and character behavior.

---

# 26. Current Product State

Already implemented/prototyped:

- mobile-focused Vibe overlay;
- close button;
- floating widget;
- widget movement;
- widget size setting;
- widget enable/disable;
- widget search/reset;
- widget normal/numbered assets;
- Chats tab;
- Notifications tab;
- Dating tab;
- Profile placeholder;
- unread counters;
- activity notification foundation;
- collapsible Widget settings;
- collapsible Memory settings.

Architecturally planned but not fully implemented:

- full player profile editor;
- photo upload;
- vision analysis;
- public-vs-true profile model;
- Profile Binding;
- Discovery Memory;
- Relationship Memory Bridge;
- full Memory Core;
- Context Builder;
- World Awareness;
- AI-driven autonomous NPC simulation.

---

# 27. Implementation Discipline

When coding future brain systems:

1. Build data models first.
2. Keep simulation state separate from UI state.
3. Keep memory separate from raw messages.
4. Keep roleplay context separate from Vibe context.
5. Keep true/internal state separate from public profile.
6. Keep player authorship separate from AI authorship.
7. Use explicit event types.
8. Avoid giant prompts that contain everything.
9. Prefer deterministic state updates followed by AI wording.
10. Preserve backward compatibility when possible.

---

# 28. Non-Negotiable Rules

Do not break these without explicit user approval:

- No telepathy.
- Player Persona is written by the user.
- One person = one persistent chat.
- Vibe and Roleplay remain separate worlds.
- Relationship Memory may bridge them.
- Public Profile does not equal True Persona.
- Dating tab has no unread counter.
- Chats own unread message state.
- Notifications own external activity state.
- The widget hides while Vibe is open.
- 0 unread = pink-heart envelope.
- 1–20 unread = exact matching widget image.
- Widget number must reflect the real unread total.
- Do not silently remove settings.
- Do not silently replace approved artwork.


# Expectation / Discrepancy / Revelation

Public profiles can differ from True Persona. The simulation tracks expectations, discrepancies, discovery and emotional reactions. Not every mismatch is revealed, and reactions depend on severity, intent, trust, attraction and discovery context.
