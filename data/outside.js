/*
  RACINATION — data/outside.js
  ---------------------------------------------------------------
  Milestone 10a: the outside world. The village, the press and
  officialdom as three meters, and the families who want their
  daughters back.

  Events are in data/outside-events.js.
  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.outside = {

  start: { village: 50, press: 5, official: 5 },

  /* ---------- How each meter is spoken of ---------- */
  words: {
    village: [
      { below: 25, word: "hostile", line: "The village is hostile. Mrs Pargeter at the shop serves the house last, and slowly." },
      { below: 45, word: "scandalised", line: "The village is scandalised, and enjoying it. The house is discussed in the Bell every night." },
      { below: 65, word: "curious", line: "The village is curious about the house, and not unkind." },
      { below: 101, word: "charmed", line: "The village is charmed. The house's roses are spoken of at the WI with something like pride." }
    ],
    press: [
      { below: 15, word: "unknown", line: "The newspapers have never heard of the house." },
      { below: 35, word: "a paragraph", line: "The house has been a paragraph in the Oxford paper, under the crossword." },
      { below: 60, word: "a story", line: "The house is a story. A man from a Sunday paper has been seen in the Bell." },
      { below: 85, word: "a scandal in the making", line: "The house is a scandal in the making. There are photographers in the lane on Saturdays." },
      { below: 101, word: "the front page", line: "The house is one bad week from the front page." }
    ],
    official: [
      { below: 15, word: "unnoticed", line: "Officialdom has not noticed the house." },
      { below: 35, word: "on a list", line: "The house is on a list somewhere in the council offices." },
      { below: 60, word: "a file", line: "The house has a file, with a coffee ring on it." },
      { below: 85, word: "a case", line: "The house is a case. Letters come with reference numbers." },
      { below: 101, word: "a matter for the authorities", line: "The house is a matter for the authorities, several of them at once." }
    ]
  },

  /* ---------- The weekly drift ---------- */
  village: {
    pull: 0.02,                // each week the village drifts back towards curiosity by this share of the gap
    rest: 55,
    quietWeek: 0.3,            // a week with no guests and a Pit below 40
    perGuest: -0.15,           // guests in crinoline at the bus stop
    perSeverity: -0.12,        // the village hears about the Ordinances
    hostilePit: 0.3,           // a hostile village lets the Pit in
    charmedPit: -0.2           // a charmed one keeps it out
  },
  press: {
    decay: 0.3,
    perSeverity: 0.08,
    perAppalledGuest: 0.6,
    perHit: 3,                 // a cassette hit, once
    perExposed: 4,             // a Working seen on the downs, once
    perJournalist: 5,          // the journalist resident found out, once
    villageCharmed: 0.7,       // a charmed village closes ranks
    villageHostile: 1.3        // a hostile one talks
  },
  official: {
    decay: 0.2,
    perRung: 0.4,              // each week, for each rung of the Coercion ladder
    villageHostile: 0.2,
    perEscalation: 8           // a family going to a solicitor or the police
  },

  // The Ladies' stored nudges, when they arrive (never confirmed).
  ladies: { villagePerStrength: 4, pressPerStrength: -4, officialPerStrength: -2 },

  /* ---------- Families ----------
     Each woman with a family tie has a family whose concern rises and falls unseen.
     goodReason: the game's own judgement that they are right to worry. */
  family: {
    base: 0.25,
    doubtAbove: 60, doubt: 0.5,
    perSeverity: 0.06,         // letters home start to sound strange
    contact: { open: -0.5, letters: -0.15, none: 0.5 },
    content: -0.4,             // a racinated, devoted woman on open contact reassures them
    reasons: { extracted: 1.0, gate: 1.0, severance: 0.8, shunned: 1.0, loveEnded: 0.3 },
    stages: [
      { at: 40, event: "family-letter" },
      { at: 60, event: "family-visit" },
      { at: 80, event: "family-solicitor" },
      { at: 95, event: "family-police" }
    ],
    words: [
      { below: 25, word: "content" },
      { below: 50, word: "a little anxious" },
      { below: 75, word: "worried" },
      { below: 101, word: "frantic" }
    ]
  }
};
