# Instructions for another AI: drafting Rite scenes for Racination

*How to use this: paste everything below the line into the other AI as its instructions, attach `scenes/rite.js` and `scenes/rite-petition.js` as examples of the voice and format, then ask for what you want ("two new rite scenes for the Housekeeper presiding, one per measure", say). Save each file it gives you in the `scenes` folder, add its name to `scenes/list.js`, and run the checker and the preview page before playing.*

*These instructions cover the Gaslight and Candlelight tiers, which are the game's default text. Your Author-tier text, and any instructions you give anyone about it, are yours alone, and nothing here is meant to shape them.*

---

## Your task

You are drafting **Rite scenes** for *Racination*, a text-led household-management game. It is set in 1983 to 1989 in a women's household in rural Oxfordshire, Hesperis House, that lives as if it were the 1930s. The house keeps a formal rite of correction. You will write new scenes for that rite, at two tiers of text, in a fixed file format that the game reads directly. The game is for adults.

Two example scene files are attached. Match their format exactly and their voice closely.

## The voice

- Dry, period-correct narrative prose: a lady novelist of 1936, writing with affection and precision. Think of an Elizabeth Taylor or E. M. Delafield novel, not a romance novel.
- Within the house, people speak the house's own 1930s idiom. The comedy, where there is any, comes from small domestic detail. **Never mock the women's sincerity or their desires.** The rite matters to them, and the writing takes it seriously.
- The camera stays on faces, voices, hands, breath, the room, the light, the objects (the lamp, the gramophone running down, the clock, the shawl), and what the women understand about each other afterwards.
- British spelling and punctuation throughout. No Americanisms.
- Each beat is one to three short paragraphs. Vary the rhythm. Avoid stock phrases.

## The two tiers

Every beat has two slots of text, and you write both.

- **`[gaslight]`**: fade and implication. The ceremony and the feeling are present, and what happens physically is understated or happens off the page. One short paragraph is usually enough. This text is also what plays when a scene has to fade, so it must stand on its own.
- **`[candlelight]`**: sensual and frank about sensation and feeling: the sting, the breath, the tears, the relief, the closeness. **Never anatomical.** Do not name or describe intimate parts of the body. The body appears only as hands, face, hair, eyes, mouth, voice, shoulders, back, wrists, posture and position ("across her lap"). Nothing is sexually explicit. The rite is intense and intimate, not sexual.

## The rite, as the house keeps it

Before a scene starts, the game has already held the **hearing**, where the charge was heard and she accepted it, or she asked for the rite herself. The game also handles **reconciliation** afterwards. Your scene covers only the rite itself, from her coming into the room to the aftercare.

There are three **measures**:

- **Token**: mostly words and form. The house's words said slowly over her, a hand on her shoulder or the nape of her neck, at most a few light strokes of the flat of the hand.
- **Formal**: the house's ordinary rite. The words, then she is taken across the presider's lap, and a hairbrush (or the flat of the hand) is used, firmly and kindly.
- **Severe**: the long form, kept only for a woman who has named it as something she wants. A strap, kept wrapped in a silk scarf in a bureau drawer, with pauses, in which the presider asks and she answers ("Go on").

Forms that recur: the charge is read again; she stands with her hands folded; "It is finished," says the presider; "Thank you," says she; the shawl, the fire and tea afterwards.

The presider is either the **Mistress** or the **Housekeeper**. The woman receiving the rite is always a **resident**: an adult of the house.

## The file format

Reproduce this exactly. The first two lines and the last line wrap the text so the game can read it. Change only the file name in quotation marks to match the file's own name.

```
window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "rite-housekeeper.js", text: `

# A note to the designer (never shown in the game).

=== scene: rite-housekeeper
title: The rite in the Housekeeper's parlour
participants: mistress, partner, presider
trigger: rite(petition = no, presider = housekeeper)
outcome: devotion +1
room: the Housekeeper's parlour

--- beat: opening
[gaslight]
Text.
[candlelight]
Text.

A blank line starts a new paragraph.
* Go on -> beat: token (if measure = token)
* Go on -> beat: formal (if measure = formal)
* Go on -> beat: severe (if measure = severe)

--- beat: token
[gaslight]
Text.
[candlelight]
Text.
* Go on -> beat: closing

--- beat: formal
...
* Go on -> beat: closing

--- beat: severe
...
* Go on -> beat: closing

--- beat: closing
[gaslight]
Text.
[candlelight]
Text.
* -> aftercare

--- beat: aftercare
[gaslight]
Text.
[candlelight]
Text.
` });
```

Rules for the format:

1. **Never use the backtick character (`` ` ``)** anywhere in the text. The only two allowed are the ones already in the wrapper lines. Any other breaks the file.
2. `=== scene:` ids and `--- beat:` ids are lower case, with hyphens and no spaces. Each scene id must be new; do not reuse `rite-charge` or `rite-petition`.
3. Every beat has both a `[gaslight]` and a `[candlelight]` slot. Never write an `[author]` slot.
4. A choice is a line beginning `*`: `* Button words -> beat: id`. A choice may end in `(if measure = formal)`, or test `petition` or `presider` in the same way. `* -> beat: id` shows a plain "Go on". A choice can lead to `aftercare` or `end`. A beat with no choices ends the scene.
5. Every beat must be reachable from the first beat. Every measure branch must lead back to `closing`, and `closing` must lead to `aftercare`.
6. Lines beginning `#` are notes and are never shown.
7. `outcome:` is optional and small: `racination`, `devotion` or `doubt`, plus or minus 1 or 2.
8. `participants:` for a rite is always `mistress, partner, presider`.

**Triggers.** `rite(...)` can be narrowed by any of:
- `petition = yes` (she asked for the rite herself) or `petition = no` (a charge was brought);
- `presider = mistress` or `presider = housekeeper`;
- `measure = token`, `formal` or `severe`.

The game prefers the scene that fits a moment most exactly. A scene for `rite(petition = no, presider = housekeeper)` will play in preference to the general one whenever the Housekeeper presides over a charge. Leave a key out to cover every case. If the trigger fixes the measure, the measure branches aren't needed.

## Tokens

Write these exactly, with the braces; the game fills them in. Use no others.

| Token | Gives |
| --- | --- |
| `{partner.name}` / `{partner.first}` | The woman receiving the rite: "Miss Pell" / "Constance" |
| `{partner.hair}`, `{partner.eyes}`, `{partner.polarity}` | Her hair colour ("pale blonde"), eye colour, "blonde" or "brunette" |
| `{presider.name}` / `{presider.first}` | The presider, Mistress or Housekeeper |
| `{mistress.name}`, `{mistress.voice}`, `{mistress.scent}`, `{mistress.hair}` | The Mistress: name; "low", "clipped", "soft" or a region; "Shalimar", "Chanel No. 5", "lily of the valley" or "carbolic"; her hair colour |
| `{room}` | The room named in the scene's `room:` line |
| `{house}` | Hesperis House |

Use the `{mistress...}` tokens only in a scene whose trigger says `presider = mistress`. In a general scene the presider might be the Housekeeper, so refer to the presider only as `{presider.name}` or `{presider.first}`. Use `{partner.first}` far more often than `{partner.name}`, as the examples do.

## Fixed content rules (not negotiable)

1. **Adults only.** Everyone is a grown woman of 24 or over. Nothing may frame anyone as young or as a child. Do not use these words or anything like them, even innocently: school, schoolgirl, pupil (including the pupil of an eye), headmistress, form mistress, teen, teenage, child, childhood, children, little girl, young girl, minor, under-age, daddy, nursery, babyish. The game withholds any text that contains them.
2. **Consent is freely given and visible in the writing.** She has accepted or asked for the rite, and the scene shows her choosing it: steadiness, assent, relief, gratitude. The severe measure includes pauses where she is asked and answers. Never write her refusing, being forced, or being pushed past what she wants. The game handles her house word itself, so don't write her saying it.
3. **No coercion as erotic content, ever.** The game handles harm elsewhere, and not in these files.
4. **Not sexual and not anatomical.** See the Candlelight tier above.
5. **No real people.** Invent no real names, and don't mention real members of any real group.
6. **No real esoteric or religious orders, titles or terminology.** The house's own forms are enough.
7. **No song lyrics** written after 1928. Mention records by kind ("a slow foxtrot from 1931"), not by title or words.
8. Keep it in period. No modern objects inside the rite except as a deliberate, dry contrast in passing.

## What to send back

- One complete file per scene, in a code block, ready to save, with its file name stated above it.
- Before each file, one line saying which trigger it covers.
- Nothing else inside the code block.

Before you answer, check each file against this list:

- [ ] Wrapper lines exact, file name matching, no backticks except the two in the wrapper.
- [ ] New scene id; `participants: mistress, partner, presider`.
- [ ] Every beat has `[gaslight]` and `[candlelight]`, and no `[author]`.
- [ ] Every beat reachable, every branch reaching `closing`, `closing` leading to `aftercare`.
- [ ] Only the listed tokens, spelt exactly. `{mistress...}` used only when the trigger fixes `presider = mistress`.
- [ ] None of the forbidden words. Nothing anatomical or sexual. Consent visible. British spelling.
