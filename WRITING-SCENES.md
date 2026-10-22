# Writing scenes

Scenes are the intimate moments of the game: rites, courtship evenings, bonding nights and, from Milestone 8, the Workings. Each is a small branching graph of **beats**. Each beat has up to three **slots** of text, one for each tier:

| Tier | What it is | Who writes it |
| --- | --- | --- |
| **Gaslight** | Fade and implication. The default, the fade path and the fallback. | Claude |
| **Candlelight** | Sensual and frank, never anatomical. | Claude |
| **Author** | Your own text, at whatever explicitness you choose. | You alone, in `authored.js` |

When a scene plays, each beat shows the highest tier the player has switched on in **Settings** that has text, and drops to the tier below when a slot is empty. So you can write Author text for a few beats of one scene and leave everything else on Candlelight.

## Where scenes live

- **`scenes/`** holds one file per scene, plus `scenes/list.js`, which lists them.
- **`authored.js`** in the game's main folder holds your Author text. The game loads it if it is there and runs without it if it is not. Keep your own copy safe: it is yours, and it is not in the repository.

## A scene file

Copy an existing file in `scenes/` and change it. The first two lines and the last line stay exactly as they are (change only the file name in quotation marks). Between them you write in the format below.

```
window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "my-scene.js", text: `

=== scene: my-scene
title: A quiet evening
participants: partner, beloved
trigger: courtship(with = resident)
outcome: racination +1, bond +1
room: the Morning Room

--- beat: opening
[gaslight]
The Gaslight text.
[candlelight]
The Candlelight text.

A blank line starts a new paragraph.
* Dance -> beat: dance
* Sit by the fire -> beat: fire

--- beat: dance
[gaslight]
...
* -> beat: goodnight

--- beat: goodnight
[gaslight]
...

--- beat: aftercare
[gaslight]
...
` });
```

Then add `"my-scene.js"` to the list in `scenes/list.js`.

**Never use the backtick character (`` ` ``) in the text.** It ends the text early, and the file will not load. The checker tells you if a file failed to load.

### The header

- **`=== scene: my-scene`** starts a scene. The id is lower case with hyphens, and must be different from every other scene's.
- **`title:`** is the heading the player sees.
- **`participants:`** names who is in the scene. Only these roles are allowed: `mistress`, `partner`, `beloved`, `presider`, `guest`. A scene naming anyone else will not load.
- **`trigger:`** says when the scene plays (see below).
- **`outcome:`** (optional) is a small bonus when the scene is completed with free consent: `racination`, `devotion`, `doubt` or `bond`, each capped at 2. The game's own rules decide the main effect of a rite; this only adds to it.
- **`room:`** (optional) is what `{room}` says.

### Triggers

| Trigger | When it plays | Who is cast |
| --- | --- | --- |
| `rite(petition = no)` | A rite on a charge | `partner` (the woman), `presider` (the Mistress or the Housekeeper), `mistress` |
| `rite(petition = yes)` | A rite she petitioned for | the same |
| `guestrite` | A paying guest's rite | `guest`, `mistress` |
| `courtship(with = resident)` | "Their evening", for two residents courting | `partner`, `beloved` |
| `courtship(with = mistress)` | "Your evening with her" | `partner`, `mistress` (and `beloved` is the Mistress too) |
| `bonding` | "Their bonding night", the week after a bonding | `partner`, `beloved` (who may be the Mistress) |
| `working(...)` | A Working, kept from the Evenings page | `partner`, `beloved` (who may be the Mistress) |

The things in brackets narrow a trigger. You can leave them out, or add others: `rite` also knows `measure` (token, formal, severe) and `presider` (mistress, housekeeper); `courtship` and `bonding` know `with` and `stage` (understanding, attachment, devotion, bonded); `guestrite` knows `interest` (curious, wants); `working` knows `planet` (sun, moon, mercury, venus, mars, jupiter, saturn), `site` (chamber, uffington, wayland, rollright, wychwood), `outdoor` (yes, no), `mode` (build, banish) and `with` (resident, mistress). When several scenes fit a moment, the game prefers the one that fits most exactly, and picks at random among equals.

### Beats and choices

- **`--- beat: opening`** starts a beat. The first beat in the file is where the scene begins.
- **`[gaslight]`** and **`[candlelight]`** start the slots. Every beat needs Gaslight text.
- A choice is a line starting with `*`: `* What the button says -> beat: dance`. Leave out the words for a plain "Go on": `* -> beat: closing`.
- A choice can lead to another beat, to `aftercare`, or to `end`. A beat with no choices ends the scene.
- A choice can depend on the moment: `* Go on -> beat: severe (if measure = severe)` only appears when the rite's measure is severe.
- **`--- beat: aftercare`** is optional. If a scene has none, the engine's own aftercare text (in `data/scenekit.js`) is used.
- A line starting with `#` is a note to yourself and is never shown.

### What the engine always adds

You cannot remove these, and do not need to write them:

- **The stop route.** Every beat gets a "Stop here, and sit with her" button that goes straight to aftercare.
- **Her word.** If a rite goes past a woman's limit, her house word arrives at the next beat and the scene goes to aftercare.
- **The Working's own gate.** A Working where a woman was not told what it is for plays no scene at all: it is the harm path.
- **The gates.** A scene only plays if everyone in it is an adult of 24 or over and the house is not in the failure state. If any woman's yes was not freely given, the scene takes the fade path: Gaslight text only, and never your Author text. The house also draws the curtain now and then on a scene where all is well, so a faded scene is never, by itself, proof of anything. Text that frames anything in terms of school, childhood or youth is withheld at every tier.

## Tokens

| Write | Gives |
| --- | --- |
| `{partner.name}`, `{partner.first}`, `{partner.surname}`, `{partner.title}` | Her name |
| `{partner.polarity}`, `{partner.hair}`, `{partner.eyes}` | blonde or brunette; her hair colour; her eye colour |
| `{houseword}` | The partner's house word |
| the same for `{beloved...}`, `{presider...}`, `{guest...}` | (a guest also has `{guest.job}` and `{guest.town}`) |
| `{mistress.name}`, `{mistress.voice}`, `{mistress.scent}`, `{mistress.hair}` and the rest | The Mistress |
| `{room}`, `{season}`, `{house}` | The room, the season, the house's name |
| `{planet}`, `{lady}` | In a Working: the planet ("Venus") and the house's name for her ("the Evening Lady") |
| `{phrase}`, `{image}` | In a Working: the phrase chosen, and the held image of what it is for |

## Your authored.js

Open the **preview page** (Settings, then "Open the preview page", or open `preview.html` directly) and press **Download an authored.js template**. It gives you a file listing every scene and beat with an empty `[author]` slot under each. Rename it `authored.js`, put it in the game's main folder beside `index.html`, and write under whichever markers you like. Leave a slot empty to let Candlelight show instead.

The format is the same as a scene file, but only `=== scene:`, `--- beat:` and `[author]` lines are read. Scene and beat ids must match the scene files exactly. The checker tells you about any Author text that can never play.

When a new scene is added, download a fresh template and copy across the new scene's part.

## Checking and previewing

- **The checker** (on the preview page, in Settings, and in the testing tools) lists files that did not load, missing slots, links to beats that do not exist, beats nothing leads to, participants that are not allowed, Author text that can never play, and wording the game withholds.
- **The preview page** shows any scene at any tier, with her consent freely given or not, and with her limit reached or not. You can step through it as a player would, or see every beat at once. A tag on each beat shows which tier its text came from; a dashed outline means it fell back to a lower tier. The Author tier there asks for its own 18+ confirmation each visit.
