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

The current release implements public profile, a private persona layer, role/archetype strategies, individualized behavioural parameters, persistent relationship state, bounded long-term memory, relationship stages, contextual hints, a revelation layer, a bounded context builder, weighted local action selection, and event selection. Knowledge isolation is still lightweight and there is no vector/embedding store.

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

## Individual Behaviour Parameters

Each NPC receives a persistent randomized behaviour profile including:

- initiative
- consistency
- flirt
- warmth
- spontaneity
- jealousy
- ghosting risk
- disclosure tendency
- boundary respect
- emotionality

These values modify the role strategy rather than replacing it.

## Context

`buildNpcContext(profileId, situation)` creates the structured context currently passed to the host AI model.

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

The current AI layer turns the selected action and context into natural-language text through SillyTavern `generateRaw()`.

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
## NPC↔NPC relationships

### NPC↔NPC simulation

NPC-to-NPC relationships are empty by default. A relationship is created only by an explicit simulation event. The first built-in event is `profile_discovery`: two existing Vibe users can notice each other when the simulation finds a meaningful shared signal (for example a shared interest, city or dating goal). This creates an `acquaintance` and stores a bounded event history. Repeated contacts can gradually strengthen the relationship.

No social link is created merely because two NPCs exist in the same dating pool. The model does not assume pre-existing friendships, ex-partners or offline connections.

NPC-to-NPC relationships are event-driven and separate from the main NPC↔player relationship memory. Being present in the same dating app does not create a social connection.

A relationship starts only when a concrete simulation/activity event connects two NPC actors. The record stores a bounded event history, affinity, trust, sentiment, interaction count and a coarse relationship type. Existing saves can omit this state; the loader treats it as an empty set.

The generation context exposes only already-recorded NPC↔NPC relationships for the current actor. No random friendship, rivalry, ex-partner or acquaintance is created during profile generation.

