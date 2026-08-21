# NPC Character Factory

The NPC Factory turns an archetype into a persistent individual NPC.

Pipeline:

Archetype
→ deterministic seed
→ random identity
→ public dating profile
→ visual-profile placeholder
→ true/internal persona
→ Character Brain
→ persistent dynamic profile

## Public Profile

Contains information that can be shown to other participants:

- name
- age
- city
- dating goals
- interests
- about
- looking-for preferences
- photo/visual placeholder

## True Persona

Internal information that should not be automatically exposed:

- temperament
- social energy
- openness
- risk tolerance
- mood
- private facts
- secrets

## Important

Public Profile and True Persona are intentionally separate.

The player may receive a flattering or incomplete profile.
The simulation may later reveal differences naturally.

## Persistence

Generated NPCs are stored under:

`state.dynamicProfiles`

and saved with the existing chat state.

A generated NPC must keep the same identity when the user returns later.
