# NPC Brain

## Layering

Every AI-driven Vibe character should eventually have:

1. Public Profile
2. True/Internal Persona
3. Archetype
4. Behavioral Traits
5. Relationship State
6. Knowledge
7. Memory
8. Current Situation
9. Context Builder
10. AI response generation

The current prototype implements layers 1–6 structurally for generated NPCs and provides a deterministic local action selector.

## Archetype

An archetype is a behavioral strategy template, not a complete personality.

Examples:

- windy
- entertainment
- casual_intimacy
- serious_relationship
- friendship
- networking
- eccentric
- boundary_pusher
- intense
- kindred_spirit

Two NPCs can share the same archetype and still have different trait values, names, ages, cities, interests, seeds and behavior.

## Traits

Traits are normalized to 0..1 and include:

- initiative
- curiosity
- patience
- emotionality
- spontaneity
- honesty
- attachment
- flirt
- boundarySensitivity
- responseSpeed
- consistency

## Context

`buildNpcContext(profileId, situation)` creates a structured context for the future AI model.

The model should receive only relevant information instead of the entire simulation database.

## Decisions

`chooseNpcAction(profileId, situation)` chooses a high-level action such as:

- wait
- view_profile
- like_photo
- like_profile
- match
- send_message
- ask_question
- flirt
- disengage
- suggest_meeting

This is a local decision layer. It does not generate natural language.

The future AI layer should turn the selected action and context into actual text.

## Important rule

Do not let the LLM arbitrarily rewrite global simulation state.

Recommended flow:

Simulation state
→ Decision Engine
→ Context Builder
→ AI wording
→ State update


## Current archetype catalog

The Vibe NPC factory includes these archetypes:

- Ветреный
- Ищущий развлечений
- Ищущий секса / интим без обязательств
- Ищущий серьёзных отношений
- Ищущий дружбы
- Ищущий полезных знакомств
- Ищущий единомышленника
- Сумасшедший / хаотичный
- Маньяк / опасно-навязчивый
- Перверт / нарушитель границ
- Навязчиво-влюбчивый
- Медленно сближающийся
- Коллекционер флирта
- Ищущий внимания
- Прагматичный

An archetype is a behavior template, not a complete personality. Each generated NPC receives randomized traits and a unique seed so two NPCs with the same archetype can behave differently.

Dangerous or boundary-violating archetypes are simulation archetypes, not desirable behavior. They must still respond to clear boundaries and should not be romanticized by default.
