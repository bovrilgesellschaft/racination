/*
  RACINATION — data/working.js
  ---------------------------------------------------------------
  Milestone 8: the Working (GDD §3.3). The Seven Ladies, the sites,
  the phrasebook, how strong a Working is, what it nudges, the
  coincidences the ledger records, the Chamber and its Charge.

  The rising and setting times are in data/ephemeris.js.
  The Working's events are in data/working-events.js.
  Its scenes are in the scenes folder.

  The Ladies are the house's own names. None is borrowed from any
  real order.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.working = {

  /* ---------- The Seven Ladies ----------
     body     which planet in the ephemeris (do not change)
     day      her day of the week: 0 Sunday, 1 Monday ... 6 Saturday
     build    what a Working at her rising does each week, while it lasts
     banish   what a Working at her setting does each week, while it lasts
     later    the system she will also touch once it exists (village, press, cassettes)

     Effects: reputation, pit, money (pounds), authority, doubt (every resident),
              courtship (progress to every courting couple)
  */
  ladies: [
    { id: "sun", body: "sun", planet: "the Sun", name: "the Golden Lady", day: 0,
      domain: "standing in the village",
      build: { reputation: 0.8 }, banish: { pit: -0.5 }, later: "village",
      phrases: ["Gold on the gate, gold on the step", "Morning in every window", "Let them speak well of us"],
      images: ["the vicar raising his hat at the gate", "the house's name said kindly in the shop", "a full church fête stall, sold out by noon"] },
    { id: "moon", body: "moon", planet: "the Moon", name: "the Silver Lady", day: 1,
      domain: "sleep and dreams",
      build: { doubt: -0.4 }, banish: { doubt: -0.3, pit: -0.2 },
      phrases: ["Silver on the sill, sleep in the house", "Down, down, the deep water", "Close every eye"],
      images: ["every bedroom dark and quiet by eleven", "the household waking rested and smiling", "a bad dream folded and put away in a drawer"] },
    { id: "mercury", body: "mercury", planet: "Mercury", name: "the Lady of Letters", day: 3,
      domain: "the post, publishing and the cassettes",
      build: { money: 8 }, banish: { pit: -0.4 }, later: "cassettes",
      phrases: ["Quick, quick, the quill and the stamp", "Every letter home", "Word over water"],
      images: ["the postman struggling up the drive with the sack", "a cheque from a bookshop in Bath", "the magazine on the mat with the house's notice in it"] },
    { id: "venus", body: "venus", planet: "Venus", name: "the Evening Lady", day: 5,
      domain: "romance and bookings",
      build: { courtship: 0.5, reputation: 0.4 }, banish: { doubt: -0.2 },
      phrases: ["Rose at the window, rose at the door", "Two hearts, one lamp", "Come up the drive"],
      images: ["the guest book full to the end of the season", "two women dancing in the Drawing Room", "a letter of booking, with a deposit"] },
    { id: "mars", body: "mars", planet: "Mars", name: "the Lady of the Spur", day: 2,
      domain: "courage against the council and the press",
      build: { authority: 0.6 }, banish: { pit: -0.5 }, later: "press",
      phrases: ["Spur and steel, stand and hold", "Nobody passes", "Iron in the spine"],
      images: ["the council's letter torn in two", "a journalist turned away at the gate", "the Mistress unbowed on the front step"] },
    { id: "jupiter", body: "jupiter", planet: "Jupiter", name: "Lady Bountiful", day: 4,
      domain: "money and patrons",
      build: { money: 15 }, banish: { money: 6, pit: -0.2 },
      phrases: ["Full the purse, full the board", "Plenty, plenty, plenty", "Open hand, open door"],
      images: ["the bank book in black ink", "a patron's cheque on the silver tray", "the coal shed full to the roof in November"] },
    { id: "saturn", body: "saturn", planet: "Saturn", name: "the Lady of the Keys", day: 6,
      domain: "banishing, binding and secrets",
      build: { pit: -0.4 }, banish: { pit: -0.8 },
      phrases: ["Lock and key, lock and key", "What is out stays out", "Hush, and hold"],
      images: ["the gate shut and the lane empty", "a letter burnt in the grate unread", "the Pit outside, pressing its face to the glass, and the glass holding"] }
  ],

  /* ---------- When a window counts (Design decision D1) ----------
     A window is a Lady's rising (to build) or setting (to banish), on her own day of the week,
     between sunset and sunrise. The Golden Lady's are at dawn and dusk by nature.
     A window lasts this many minutes either side of the time. */
  windowMinutes: 4,
  // "Between dusk and dawn" means full dark: this many minutes after sunset and before sunrise.
  darkMargin: 60,

  /* ---------- The sites ----------
     ladies   the Ladies a site is in sympathy with (a stronger Working)
     late     the chance of arriving late; a fifth of late arrivals miss the window altogether
     seen     the chance, by season, of being seen
     cost     pounds for petrol and the like */
  sites: [
    { id: "chamber", name: "the Chamber", outdoor: false, ladies: [], late: 0, seen: {}, cost: 0,
      note: "Always on time. Builds Charge." },
    { id: "uffington", name: "the White Horse at Uffington", outdoor: true, ladies: ["sun", "mars"], late: 0.15,
      seen: { spring: 0.1, summer: 0.25, autumn: 0.1, winter: 0.04 }, cost: 3,
      note: "The chalk horse on the down. Ramblers in summer." },
    { id: "wayland", name: "Wayland's Smithy", outdoor: true, ladies: ["saturn", "mercury"], late: 0.15,
      seen: { spring: 0.08, summer: 0.18, autumn: 0.08, winter: 0.03 }, cost: 3,
      note: "The long barrow under the beeches." },
    { id: "rollright", name: "the Rollright Stones", outdoor: true, ladies: ["saturn", "moon"], late: 0.2,
      seen: { spring: 0.1, summer: 0.2, autumn: 0.1, winter: 0.05 }, cost: 5,
      note: "The King's Men in their ring. A farmer who keeps late hours." },
    { id: "wychwood", name: "a glade in Wychwood", outdoor: true, ladies: ["venus", "moon", "jupiter"], late: 0.2,
      seen: { spring: 0.06, summer: 0.12, autumn: 0.08, winter: 0.03 }, cost: 4,
      note: "Old forest, and a gamekeeper." }
  ],

  /* ---------- How strong a Working is (all hidden from the player) ---------- */
  strength: {
    base: 0.4,
    bonded: 0.4,
    courting: 0.15,
    perVisualisation: 0.06,      // for each point of either woman's Visualisation
    chargeAtFull: 0.35,          // in the Chamber, at Charge 100
    siteSympathy: 0.25,
    readingMatch: 0.15,          // the pair suits the house's reading (Mirror or Polar)
    readingClash: -0.1,
    mistressTakesPart: 0.1,
    perBelief: 0.0025,           // for each point of Belief (negative under Play)
    late: 0.6,                   // multiplier when late
    max: 1.6
  },
  // How many weeks a Working's nudge lasts: this, plus up to 3 more for a strong one.
  weeks: 4,
  // The chance each week that a nudge shows up in the ledger as a coincidence.
  coincidenceChance: 0.45,
  // The chance each week of a coincidence with no Working behind it at all.
  strayCoincidence: 0.07,

  /* ---------- The Chamber ---------- */
  charge: {
    perWorking: 12,              // times the Working's strength
    fadePerIdleWeek: 1.5,
    hauntAbove: 70,
    hauntChance: 0.3
  },
  chargeWords: [
    { below: 10, word: "still" },
    { below: 30, word: "warm, as if someone had just left it" },
    { below: 50, word: "close, like the air before thunder" },
    { below: 70, word: "crowded, though there is nobody in it" },
    { below: 101, word: "heavy. Nobody likes to be in it alone" }
  ],
  hauntings: [
    { text: "The gramophone in the Chamber was heard playing at three in the morning. Nobody had wound it.", doubt: 0.5, belief: 1 },
    { text: "Three of the household dreamed the same dream on Thursday night: a corridor of doors, all of them opening.", doubt: 0.3, belief: 2 },
    { text: "The Chamber door will not stay shut. It has been wedged with a hymn book.", doubt: 0.4, belief: 1 },
    { text: "Every candle in the Chapel went out at once during Compline, and lit again when the last verse was sung.", doubt: 0.2, belief: 2 },
    { text: "The cat will no longer go up the back stairs.", doubt: 0.2, belief: 0.5 }
  ],

  /* ---------- Visualisation ---------- */
  visualisationTraining: 0.08,   // weekly chance of +1 for a woman at devotions (duty or evening)

  /* ---------- Sceptics ---------- */
  // Doubt for each sceptical resident (low Devotion, high Doubt, or an unbeliever) when a Working is kept.
  scepticDoubt: { embrace: 1.5, tolerate: 0.8 },
  scepticBelow: 40,              // Devotion
  scepticAbove: 50,              // Doubt

  /* ---------- The Mistress's stance (D6) ---------- */
  stances: {
    embrace: { label: "Embrace", note: "The Working is the house's own. The Mistress may take part; Belief rises; sceptics mind more.", belief: 5 },
    tolerate: { label: "Tolerate", note: "Residents may keep Workings; the Mistress takes no part.", belief: 0 },
    forbid: { label: "Forbid", note: "No Workings may be planned. Some may be kept in secret.", belief: -3 }
  },
  stanceChangeCost: 5,           // Authority
  secretWorkingChance: 0.05,     // each week, under Forbid, when a devoted couple wants it

  /* ---------- The readings ---------- */
  readings: {
    undecided: "The house has not decided whether two women at the Working are a pair of mirrors or a pair of poles.",
    polar: "The house holds the Polar reading: power comes from complement, a blonde with a brunette.",
    mirror: "The house holds the Mirror reading: like multiplies like, and two mirrors face each other."
  },

  /* ---------- Words for the Working ----------
     {lady}, {planet}, {site}, {a} and {b} are filled in. */
  lines: {
    kept: "{a} and {b} kept a Working at {site} as {lady} {rose}. Nothing happened that anyone could point to.",
    keptFade: "{a} and {b} kept a Working at {site} as {lady} {rose}, and came back late, and quiet.",
    late: "They were late to {site}, and the window was nearly gone when they reached it.",
    missed: "They were too late to {site}: {lady} had {rose} while they were still on the road. They came home cold and cross and said nothing at breakfast. Miss a window, the house says, and you wait.",
    uninformed: "{b} was not told what the evening was for. She went because she was asked, and found out afterwards, from something said on the stairs. She has not spoken to anyone since. The house has done the one thing its own notebook calls unforgivable.",
    declined: "{a} would rather not keep the Working, and said so. That is the end of it.",
    secretKept: "It is whispered on the back stairs that a Working was kept on Friday, against the Mistress's word."
  },
  roseWords: { build: "rose", banish: "set" },

  /* ---------- Coincidences ----------
     What the ledger records. Never a word about why. */
  coincidences: {
    sun: ["The vicar raised his hat to the Housekeeper in the lane, which he has not done since 1981.",
          "Mrs Pargeter at the shop asked after the house's roses, and seemed to mean it.",
          "The parish magazine described the house as ‘a credit to the village’, in a footnote."],
    moon: ["The household slept well this week. Several remarked on it.",
           "Nobody was heard on the stairs after midnight all week.",
           "Two of the household dreamed of the sea, and woke smiling."],
    mercury: ["A bookshop in Bath sent a cheque for back copies nobody remembered posting.",
              "The post was light this week, and nothing in it was unpleasant.",
              "A letter lost since 1984 arrived, with an apology from the Post Office."],
    venus: ["Two bookings came by the same post, both from women who had heard of the house from a friend.",
            "Somebody left a bunch of violets on the hall table, with no card.",
            "The Drawing Room gramophone was in use every evening this week."],
    mars: ["The council's letter about the drains turned out to be meant for the house next door.",
           "A man from a newspaper telephoned the shop asking for directions, and was given the wrong ones.",
           "The Mistress carried every argument at supper this week."],
    jupiter: ["A postal order for £30 arrived from a woman in Harrogate who did not say why.",
              "The coal merchant found an error in last quarter's bill, in the house's favour.",
              "An aunt nobody had heard of left the Housekeeper a small legacy and a clock."],
    saturn: ["The lane was empty all week. Not a car came up it.",
             "A man who had been asking questions in the pub was seen to leave on the Tuesday bus.",
             "The gate, which has never latched, latched."]
  }
};
