/*
  RACINATION — data/romance.js
  ---------------------------------------------------------------
  Events for Milestone 6: bondings, jealousy, the truth coming out
  about a yes, the Mistress making amends, and the failure-state
  ladder (diaries, talk, the police, the trial).

  Most are brought by the game itself ("followUpOnly"); a few
  happen by chance. The format is the one in WRITING-EVENTS.md.
  Extra pieces used here:

    when: { coercionAbove: 5, rungBelow: 3 }   the hidden Coercion score and its rung
    when: { sameCourtship: true, resident: {} } picks a woman in a courtship with one of her own polarity
    effects: { bond: true }        the resident and {other} (or the Mistress) are bonded
    effects: { bondMistress: true } the resident is bonded to the Mistress
    effects: { breakBond: true }   the resident's bond is broken
    effects: { amends: 8 }         draws the Coercion score down (only below rung 3)
    effects: { truth: true }       the truth about the resident's last yes is now known

  None of these is erotic. Ceremony, feeling and consequence only.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.romanceEvents = [

  /* ---------- Bonding ---------- */

  {
    id: "bonding-request", kind: "incident", title: "A request to be bonded", followUpOnly: true, every: 0,
    when: { resident: {}, other: {} },
    text: "{resident.name} and {other.name} came to the Study together, hand in hand and not quite looking at each other, and asked to be bonded before the house. They have been courting since the spring. The household has known for months, and has been pretending not to.",
    choices: [
      { label: "Bond them before the whole house, at Evensong", rhetoric: "belief",
        result: "They were bonded at Evensong, with the household in its best, candles in every sconce and the Mistress's own words over them. Somebody cried. Several people cried. {resident.first} and {other.first} came out of the Chapel looking as if the century had been called off.",
        effects: { bond: true, household: { devotion: 1, racination: 0.5 } } },
      { label: "Bond them quietly, in the Morning Room",
        result: "They were bonded quietly in the Morning Room, with only the Mistress and the Housekeeper by, and a bunch of primroses in a jam jar. It was, they said afterwards, exactly right.",
        effects: { bond: true } },
      { label: "Ask them to wait a season",
        result: "They have been asked to wait a season. They have agreed, and are waiting, visibly, at every meal.",
        effects: { resident: { doubt: 2 }, other: { doubt: 2 } } }
    ]
  },

  {
    id: "bonding-mistress", kind: "incident", title: "The Mistress's own bond", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "{resident.name} has asked, in the Study with the door shut, whether she might be bonded to the Mistress herself. The household will know by supper. Some of it will be glad. Some of it will ask what it means to be bonded to the woman who sets the rules.",
    choices: [
      { label: "Yes, before the house", rhetoric: "belief",
        result: "They were bonded at Evensong. The household was gracious about it, and watchful.",
        effects: { bondMistress: true, household: { doubt: 1 }, conviction: 3 } },
      { label: "Yes, privately",
        result: "They were bonded privately. The household knows, and says nothing, and notices everything.",
        effects: { bondMistress: true, household: { doubt: 1.5 } } },
      { label: "Not while she lives under your rule",
        result: "{mistress.name} told her, gently, that a woman cannot be bonded to the one who sets her duties and her rites. {resident.first} went away unhappy, and respects her the more for it.",
        effects: { resident: { doubt: 2, devotion: 2 }, conviction: 2 } }
    ]
  },

  {
    id: "jealousy", kind: "incident", title: "Jealousy", followUpOnly: true, every: 0,
    when: { resident: {}, other: {} },
    text: "{resident.name} has been watching {other.name} being courted, and minding. There was a scene on the back stairs: not loud, but the house heard it.",
    choices: [
      { label: "Speak to {resident.first} kindly, alone",
        result: "{mistress.name} talked to {resident.first} in the garden. She cried, and was comforted, and has asked to go on the Garden rota for a while to be out of the way.",
        effects: { resident: { doubt: -2 } } },
      { label: "Let it run its course", rhetoric: "play",
        result: "It ran its course. {resident.first} is cool to {other.first} at supper, and will be for some time.",
        effects: { resident: { doubt: 2 }, other: { doubt: 1 } } }
    ]
  },

  {
    id: "bond-breaks", kind: "incident", title: "A bond broken", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "{resident.name}'s bond has come apart. Nobody is quite sure when it happened; only that the two of them now sit at opposite ends of the table and take care not to be in the same room after Compline.",
    choices: [
      { label: "Release them from it formally",
        result: "The bond was released in the Morning Room, as formally as it was made. It was sad and correct, and both of them slept better afterwards.",
        effects: { breakBond: true, resident: { doubt: -1 } } },
      { label: "Ask them to try again", needs: { authority: 3 },
        outcomes: [
          { chance: 0.4, result: "They tried again, and it took. The house is relieved and a little surprised.", effects: { authority: -3, resident: { racination: 2 } } },
          { chance: 0.6, result: "They tried, for the Mistress's sake. It did not take.", effects: { authority: -3, breakBond: true, resident: { doubt: 3 } } }
        ] }
    ]
  },

  {
    id: "same-polarity-debate", kind: "incident", title: "A question of doctrine",
    when: { beliefAbove: 30, sameCourtship: true, resident: {}, chance: 0.4 }, every: 26,
    text: "At supper, a believer asked whether it was right for two {resident.polarityPlural} to court, given what the house teaches about the sexes. {resident.name}, who is courting another, put down her spoon. The table went very quiet.",
    choices: [
      { label: "Rule that temperament governs, not doctrine", rhetoric: "play",
        result: "{mistress.name} said that the house assigns the sexes by temperament, and that temperament is not so tidy as theology. The believers were unsatisfied. {resident.first} was not.",
        effects: { resident: { doubt: -3 }, household: { doubt: 0.5 } } },
      { label: "Rule that it is irregular, but not forbidden", rhetoric: "belief",
        result: "{mistress.name} ruled it irregular, but not forbidden. Everyone was a little unhappy, which may mean it was just.",
        effects: { resident: { doubt: 2 }, conviction: 1 } }
    ]
  },

  /* ---------- The truth about a yes ---------- */

  {
    id: "truth-diary", kind: "incident", title: "A diary left open", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "The Housekeeper, turning down {resident.name}'s bed, found her diary open on the pillow. The page was about the rite. It said that she had said yes because she could not think where she would go if she said no.",
    choices: [
      { label: "Speak to her, and own the wrong", needs: { authority: 2 },
        result: "{mistress.name} went to {resident.first} with the diary closed in her hand, and said she was sorry. It was the hardest thing she has done in the house. {resident.first} did not forgive her that night, but she did not leave.",
        effects: { truth: true, authority: -2, amends: 6, resident: { doubt: -3 } } },
      { label: "Close the diary and say nothing",
        result: "The diary was closed and put back. The Mistress knows now. {resident.first} does not know that she knows.",
        effects: { truth: true, mistressDoubt: 4 } }
    ]
  },

  {
    id: "truth-confession", kind: "incident", title: "What she meant by yes", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "{resident.name} came to the Study and said, all at once, that she had not wanted the rite, or the courtship, or whatever it was she had said yes to; that she had said yes because it was the Mistress asking, and the Mistress keeps the roof over her head.",
    choices: [
      { label: "Thank her for telling you, and make it right", needs: { authority: 2 },
        result: "{mistress.name} thanked her, and meant it, and promised her it would not be asked again. {resident.first} went out shaking and lighter.",
        effects: { truth: true, authority: -2, amends: 6, resident: { doubt: -5 } } },
      { label: "Tell her she misremembers",
        result: "{mistress.name} told her she misremembered. {resident.first} said nothing more. The house has not made anything right.",
        effects: { truth: true, resident: { doubt: 6 }, record: "extracted" } }
    ]
  },

  /* ---------- Amends ---------- */

  {
    id: "amends", kind: "incident", title: "A wrong considered",
    when: { coercionAbove: 6, rungBelow: 3, chance: 0.5 }, every: 13,
    text: "{mistress.name} could not sleep, and sat up in the Study with the household book open at the pages she did not like to read: a letter kept back, a woman told she could not go, a rite that should not have been. She is not sure the house is what she meant it to be.",
    choices: [
      { label: "Own it before the household at Matins", rhetoric: "belief", needs: { authority: 4 },
        result: "At Matins {mistress.name} told the household plainly what the house had done wrong, and what would now be different. Nobody had heard a Mistress say such things. The house breathed out.",
        effects: { authority: -4, amends: 10, household: { doubt: -2, devotion: 1 } } },
      { label: "Make what amends she can, privately",
        result: "Letters were returned, apologies made in the Study, a rule quietly changed. Nothing was said at Matins.",
        effects: { amends: 5, mistressDoubt: -2 } },
      { label: "Close the book",
        result: "The book was closed and the lamp put out. Nothing has changed.",
        effects: { mistressDoubt: 3 } }
    ]
  },

  /* ---------- The failure-state ladder ---------- */

  {
    id: "ladder-diaries", kind: "incident", title: "The household keeps diaries", followUpOnly: true, every: 0,
    when: {},
    text: "The Housekeeper reports that several of the household have begun keeping diaries, and keep them locked. Pages are torn out, and burnt in the range. Nobody laughs on the back stairs any more. The house has become a place where women write things down.",
    choices: [
      { label: "Note it, and leave them be",
        result: "The diaries are left alone. The house is the quieter for them, and the colder.",
        effects: {} },
      { label: "Ask to see them", needs: { authority: 3 },
        result: "{mistress.name} asked to see the diaries. Nobody refused. Nobody has written a true word in one since. The house has recorded what it asked.",
        effects: { authority: -3, household: { doubt: 4 }, record: "withheldLetters" } }
    ]
  },

  {
    id: "ladder-talk", kind: "incident", title: "Someone has talked", followUpOnly: true, every: 0,
    when: {},
    text: "A letter has come for the Mistress from a solicitor in Oxford, acting for a woman who stayed at the house. It is very short and very careful, and it mentions the word ‘allegations’ twice. The village already knows. The village always knows.",
    choices: [
      { label: "Instruct a solicitor of the house's own (£120)",
        result: "A solicitor in Abingdon has been instructed, at a price. He has read the letter and gone grey.",
        effects: { money: -120, pit: 4, mistressDoubt: 4 } },
      { label: "Write to the woman directly", rhetoric: "belief",
        result: "{mistress.name} wrote to her directly. The letter has been passed to her solicitor. It did not help.",
        effects: { pit: 3, mistressDoubt: 6 } }
    ]
  },

  {
    id: "ladder-police", kind: "visitor", title: "An officer calls", followUpOnly: true, every: 0,
    when: {},
    text: "A detective sergeant from Abingdon and a woman police constable have called, by appointment, to take statements. They are courteous, thorough and unsmiling. They would like to speak to each member of the household alone, in a room with the door open.",
    choices: [
      { label: "Give them every room they ask for",
        result: "The officers took statements all day, in the Morning Room, with the door open. The household came out one by one and did not look at the Mistress. The officers will be in touch.",
        effects: { pit: 6, household: { doubt: 4 }, authority: -6 } },
      { label: "Stand on the house's dignity, and ask for a solicitor first",
        result: "The officers waited for the solicitor, politely, in the hall. Then they took statements anyway.",
        effects: { pit: 6, money: -60, household: { doubt: 5 }, authority: -8 } }
    ]
  },

  {
    id: "trial-charge", kind: "letter", title: "A summons", followUpOnly: true, every: 0,
    from: "Abingdon Magistrates' Court",
    when: {},
    text: "{mistress.name} is summoned to appear before the magistrates, to be committed to the Crown Court at Oxford on charges arising from the complaints made against the house. The summons is two pages long and uses her full name.",
    choices: [
      { label: "Engage counsel (£400)",
        result: "Counsel has been engaged, a woman from chambers in the Temple who looked round the Drawing Room once and asked for a glass of water.",
        effects: { money: -400, mistressDoubt: 8, followUp: { id: "trial-hearing", weeks: 4 } } },
      { label: "Represent herself", rhetoric: "belief",
        result: "{mistress.name} will speak for herself. Counsel would have advised against it, had she been asked.",
        effects: { conviction: 4, mistressDoubt: 4, followUp: { id: "trial-hearing", weeks: 4 } } }
    ]
  },

  {
    id: "trial-hearing", kind: "incident", title: "The Crown Court at Oxford", followUpOnly: true, every: 0,
    when: {},
    text: "The case has come on at the Crown Court. Former members of the household gave evidence, one after another, in their Tellurian clothes, and did not look at the dock. The Sunday papers sent artists. The jury has gone out.",
    choices: [
      { label: "Wait for the verdict",
        result: "The jury was out for four hours. When it came back, the foreman did not look at the dock either.",
        effects: { end: "trial" } }
    ]
  }
];
