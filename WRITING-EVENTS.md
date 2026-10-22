# Writing your own events

Events live in three files:

- `data/letters.js` holds letters, which arrive with the post at Matins.
- `data/events.js` holds visitors and household incidents, which happen midweek on the week's business screen.
- `data/stories.js` holds the household's longer stories: recruits, the two crises, asking to leave, secrets and the Mistress's contacts. Its opening comment lists a few extra conditions and effects used there.

Each event is a block between `{` and `}`, with a comma after it. To add one, copy an existing block, paste it after another, and change the words.

## A worked example

```js
{
  id: "sewing-machine", kind: "incident", title: "The sewing machine jams",
  when: { resident: { duty: "sewing" }, chance: 0.5 },
  text: "The treadle machine has jammed with {resident.first}'s foot still on it, and a length of crêpe has gone into its works like a scarf into a mangle.",
  choices: [
    { label: "Send it to Oxford to be mended (£8)", needs: { money: 8 },
      result: "The machine went to Oxford in the back of the carrier's van and came back a week later, oiled and chastened.",
      effects: { money: -8, room: { id: "sewing", condition: 3 } } },
    { label: "Let {resident.first} take it apart herself", rhetoric: "play",
      outcomes: [
        { chance: 0.6, result: "{resident.first} took it apart on the kitchen table and put it back together with one screw left over. It runs better than before.",
          effects: { resident: { racination: 2 } } },
        { chance: 0.4, result: "{resident.first} took it apart on the kitchen table. It is still on the kitchen table.",
          effects: { resident: { doubt: 2 }, room: { id: "sewing", condition: -5 } } }
      ] }
  ]
},
```

## The parts

**`id`** is a short name, unique to this event, in lower case with hyphens. Nobody sees it.

**`kind`** is `"letter"`, `"visitor"` or `"incident"`. Letters can leave it out.

**`title`** is the heading the player sees.

**`from`** (letters only) is shown above the letter, for example `"Miss Augusta Fane, Bath"`.

**`text`** is what happens. Write it in the house voice.

**`when`** says when the event can happen. Leave it as `{}` for "any time". You can combine any of these:

| Write | Means |
| --- | --- |
| `season: "winter"` or `season: ["spring", "summer"]` | Only in these seasons |
| `after: "1985-01-01"`, `before: "1987-12-31"` | Only between these dates |
| `pitAbove: 50`, `pitBelow: 30` | Depending on the Pit |
| `moneyBelow: 300`, `moneyAbove: 2000` | Depending on money, in pounds |
| `guestsAtLeast: 1` | Only with paying guests in the house |
| `residentsAtLeast: 3`, `departedAtLeast: 1` | Depending on the household |
| `housekeeper: true` (or `false`) | Only with (or without) a Housekeeper |
| `rule: { dressCode: ["strict", "exacting"] }` | Only under these rules |
| `beliefAbove: 30`, `beliefBelow: -30` | Depending on the Belief–Play axis |
| `authorityBelow: 20` | When the Mistress's Authority is low |
| `chance: 0.5` | Even when everything else fits, only half the time |
| `residentsBelow: 14` | Only when there is room in the house |
| `mistressInCrisis: true` | Only when her Doubt has outrun her Conviction for a season |
| `housekeeperRebels: true` | Only when the Housekeeper's Doubt outweighs the Mistress's Authority |
| `guest: true` | Picks one of this week's paying guests: `{guest.name}`, `{guest.job}`, `{guest.town}` |
| `contact: true` | Picks one of the Mistress's contacts: `{contact}` |
| `resident: { ... }` | Picks a resident (see below) |
| `other: { ... }` | Picks a second, different resident |

`resident` and `other` can be `{}` for anyone, or narrowed with any of the following:
- `polarity: "blonde"`
- `background: "nun"` (one of `oxford`, `nurse`, `wife`, `nun`, `punk`, `civil`)
- `duty: "garden"`
- `desire: "structure"`
- `tie: "family"` (one of `family`, `ex`, `job`, `debts`, `flat`)
- `skill: { letters: 2 }`
- `secret: "radio"` (a resident with that secret, not yet out; the ids are in `data/residents.js`)
- `racinationBelow: 40`, `racinationAbove: 70`, `doubtAbove: 50`, `doubtBelow: 20`, `devotionAbove: 60`

**`once: true`** means the event happens only once in a run. **`every: 13`** sets how many weeks pass before it can come again; the default is 26.

**`weight: 2`** makes an event twice as likely to be picked as an ordinary one.

**`followUpOnly: true`** means the event never happens by chance; only another event's follow-up can bring it.

**`onlyIfStillTrue: true`** makes a follow-up lapse quietly if its `when` no longer holds by the time it is due.

**`choices`** holds two to four answers. Each choice has:
- **`label`**: what the button says.
- **`result`**: what happens, shown after the choice is made.
- **`effects`**: see below.
- **`rhetoric: "belief"`** or **`rhetoric: "play"`** (optional): a believer's or a game-player's answer. It moves the Belief–Play axis.
- **`needs`** (optional): the choice is greyed out unless these are met. For example `needs: { money: 35 }`, `needs: { authority: 3 }`, `needs: { housekeeper: true }` or `needs: { skill: { letters: 2 } }`.
- **`outcomes`** (optional, instead of `result` and `effects`): two or more possible results, each with a `chance`. The chances must add up to 1.

## Effects

| Write | Does |
| --- | --- |
| `money: -45` | Pounds in or out; it appears in Sunday's accounts |
| `pit: 2` | The household Pit |
| `reputation: 2` | The house's reputation with guests |
| `authority: -3`, `conviction: 2`, `mistressDoubt: 1` | The Mistress's meters |
| `belief: 5` | The Belief–Play axis directly (positive is Belief) |
| `household: { racination: 1, devotion: 1, doubt: 1 }` | Every resident |
| `resident: { ... }`, `other: { ... }`, `housekeeper: { ... }` | One woman's meters |
| `removeTie: "job"` | The picked resident loses that tie to the outside world |
| `room: { id: "kitchen", condition: 10, period: 5 }` | A room (see `data/economy.js` for room ids) |
| `followUp: { id: "another-event", weeks: 3 }` | Brings another event in that many weeks |
| `record: "withheldLetters"` | Quietly counts something for later milestones |
| `arrival: { weeks: 3, background: "wife" }` | A new resident arrives (background optional) |
| `depart: "left"` | The picked resident leaves the house |
| `revealSecret: true` | Her secret is out and won't come up again |
| `restDuty: true` | Her duty is set to Rest |
| `dismissHousekeeper: true` | The Housekeeper's post falls vacant |
| `end: "abdication"` (or `"schism"`) | The run ends after this week |

## Tokens

These fill in names:
- `{resident.name}` (Miss Pell), `{resident.first}` (Constance), `{resident.surname}`, `{resident.title}`
- the same for `{other...}` and `{housekeeper...}`
- `{departed.name}` and `{departed.first}` for a woman who has left
- `{house}` for Hesperis House
- the Mistress's tokens: `{mistress.name}`, `{mistress.voice}`, `{mistress.scent}` and the rest

An event that uses `{resident...}` must have a `resident` in its `when`. The checker below tells you if you forget.

## Checking your work

1. Switch on **Testing tools** on the title screen.
2. On the **Household** page, press **Check the event files**. It lists any problems in plain words: a missing comma will usually stop the game loading altogether, which is a clue in itself.
3. Choose your event in **Fire an event now** and press **Fire it**. A letter appears at the next Matins (or this one, if you are on it); a visitor or incident appears in the week's business.

## Rules of the house

The project's content rules apply to events as they do everywhere. Everyone is an adult; no real people appear; nothing erotic happens in events (that comes with Milestone 6); and a choice that takes something from a woman against her will, such as burning her letter, should be possible but should cost the house, and should `record` that it happened.
