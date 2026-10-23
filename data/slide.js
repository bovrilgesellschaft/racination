/*
  RACINATION — data/slide.js
  ---------------------------------------------------------------
  Milestone 9b: the Slide. The rising tide of the Pit, the six
  bands, the Ordinances the house can be asked to adopt, the
  Concessions it can grant instead, the end of love, and the three
  voices the game speaks in as the house hardens.

  See the design note "Racination — The Slide".
  The events (petitions, the Mistress's proposals, incursions) are
  in data/slide-events.js.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.slide = {

  /* ---------- The rising tide ----------
     Everything that brings the Pit in is multiplied by this, by year. */
  tide: { 1983: 1.0, 1984: 1.12, 1985: 1.25, 1986: 1.4, 1987: 1.55, 1988: 1.7, 1989: 1.8 },

  /* ---------- The six bands ----------
     The Housekeeper's report uses the word and line (data/economy.js keeps a copy for the report).
     matins: lines that may open Matins in this band
     crisis: the Mistress's sleepless lines in this band */
  bands: [
    { id: "clean", name: "Clean", below: 20, tier: 0,
      matins: [] , crisis: [] },
    { id: "draught", name: "Draught", below: 40, tier: 0,
      matins: [], crisis: [] },
    { id: "damp", name: "Damp", below: 60, tier: 1,
      matins: ["The bell for Matins was rung twice this morning: the first time, somebody slept through it with a transistor under her pillow.",
               "There is something in the walls of the house this week. Nobody can say what. The wallpaper in the back passage has begun to lift."],
      crisis: ["{mistress.name} sat up late over the accounts and found that she was not reading them, only listening to the house."] },
    { id: "seepage", name: "Seepage", below: 80, tier: 2,
      matins: ["It is coming up through the floor now. The household goes about its duties on tiptoe, as if the boards might give.",
               "A copy of a Sunday newspaper was found in the Chapel, folded open at the television page. Nobody will say how it came there.",
               "Two of the household were heard arguing on the stairs about a pop song. Both of them knew all the words."],
      crisis: ["{mistress.name} dreamed of the house with its doors standing open and the lane running in like water.",
               "{mistress.name} lay awake and counted the women who had relapsed this month, and did not like the number."] },
    { id: "flood", name: "Flood", below: 95, tier: 3,
      matins: ["Matins was said over the sound of a car radio in the lane, which nobody went out to stop.",
               "The Pit is in the house. It is in the kitchen and the passages and the way the household speaks to one another. Matins was said against it, loudly.",
               "Somebody has written a word on the scullery wall that the house does not have in its vocabulary. It has been scrubbed off. It is still there."],
      crisis: ["{mistress.name} stood at her window at three in the morning and watched the lights of the motorway, which she has never been able to see from the house before.",
               "{mistress.name} has begun to think that gentleness may be a luxury the house can no longer afford, and is ashamed of the thought, and keeps thinking it."] },
    { id: "breach", name: "Breach", below: 101, tier: 4,
      matins: ["Matins.", "The bell was rung. Not everyone came."],
      crisis: ["{mistress.name} does not sleep."] }
  ],

  // In Breach, each week, the chance that the least racinated women walk out together.
  breachDeparture: { chance: 0.15, most: 3,
    line: "{names} went down the drive on Tuesday morning in jeans and borrowed anoraks, with their suitcases, and did not look back." },

  /* ---------- The Ordinances ----------
     band      the band from which the Ordinance becomes thinkable
     relief    Pit taken away each week (once is a one-off at adoption)
     severity  how much it hardens the house */
  ordinances: [
    { id: "silence", name: "The Silence", band: "damp", severity: 1, relief: 1.0,
      about: "No Tellurian talk at table or on the stairs.",
      adopted: "The Ordinance of the Silence was read at Matins. From today the house does not speak of the outside world at table or on the stairs." },
    { id: "clearing", name: "The Clearing", band: "damp", severity: 1, relief: 0, once: 8,
      about: "Every modern possession gathered and burnt.",
      adopted: "The Clearing was held on Saturday. Every modern thing in the house was carried down to the garden and burnt: magazines, cassettes, a hairdryer, a pair of trainers, a packet of letters somebody had kept. The household stood round the bonfire and sang. Some of them meant it." },
    { id: "vigils", name: "Vigils", band: "damp", severity: 1, relief: 0.8,
      about: "Night watches in the Chapel, by rota.",
      adopted: "Vigils have begun. Every night two of the household keep watch in the Chapel until the bell for Matins, and come down to breakfast grey and serene." },
    { id: "post", name: "The Opened Post", band: "seepage", severity: 2, relief: 1.5,
      about: "Letters read by the Housekeeper before they are handed out.",
      adopted: "From today the post is opened in the Housekeeper's parlour and read before it is given out. What is wholesome is handed on. What is not is kept." },
    { id: "faults", name: "The Book of Faults", band: "seepage", severity: 2, relief: 1.2,
      about: "Each woman reports the faults she sees in others.",
      adopted: "A book has been placed on the hall table: green cloth, ruled in columns. Each woman is to write in it the faults she sees in her sisters. The Housekeeper reads it every evening. It is already half full." },
    { id: "confession", name: "Confession", band: "seepage", severity: 2, relief: 1.0,
      about: "Faults confessed aloud at Matins.",
      adopted: "From tomorrow each woman will confess her faults aloud at Matins, before the house. The first morning took an hour and a half, and nobody has been quite the same with anybody since." },
    { id: "severance", name: "Severance", band: "flood", severity: 3, relief: 2.0, rule: { familyContact: "none" },
      about: "No contact with families.",
      adopted: "The Ordinance of Severance was read. The house is the household's family now. Letters from home will be returned unopened, and no visitor will be admitted at the gate." },
    { id: "gate", name: "The Gate", band: "flood", severity: 3, relief: 1.5,
      about: "Nobody leaves without the Mistress's leave.",
      adopted: "The gate at the foot of the drive has been fitted with a padlock. The Mistress keeps the key. Nobody leaves the house without her leave, which is not given lightly." },
    { id: "shunning", name: "Shunning", band: "flood", severity: 3, relief: 1.0,
      about: "The doubting are not spoken to.",
      adopted: "It has been ordained that a woman who doubts is not to be spoken to until she has confessed it. Three of the household ate supper in silence tonight, at the far end of the table, and nobody looked at them." },
    { id: "fold", name: "The Fold", band: "breach", severity: 4, relief: 3.0,
      about: "A vow of absolute obedience; money and papers surrendered.",
      adopted: "The household took the vow of the Fold in the Chapel at midnight, one by one, kneeling. Each laid her chequebook, her savings and her papers on the altar, and the Housekeeper took them away in a hatbox. Nobody refused. Nobody, afterwards, could quite remember deciding." }
  ],

  // Each Ordinance's relief falls by this share for every season it stands, to a floor.
  tolerancePerSeason: 0.25,
  toleranceFloor: 0.25,
  // Repealing costs this much Authority, plus this much for every month the Ordinance has stood.
  repealBase: 4,
  repealPerMonth: 1,
  // A repeal brings back this many weeks of relief as Pit at once, and wounds the devout.
  backslideWeeks: 4,
  backslideDevotion: 3,
  backslideDoubt: 2,
  repealLine: "{name} has been repealed. The devout took it as a betrayal, and said so. The Pit came in through the gap like a draught under a door.",

  // Who counts as devout, and what each Ordinance does to the devout and to everyone else each week.
  devoutAbove: 60,
  devoutDevotion: 0.3,           // per Ordinance in force
  othersDoubtPerSeverity: 0.12,  // per point of Severity, for the less devout
  dependencyPerSeverity: 2,      // hidden dependency, for everyone

  // Particular costs.
  vigilsRacination: -0.2,
  postWithheldPerWeek: 0.05,     // counted towards the failure ladder as withheld letters
  faultsDoubt: 0.3,
  faultsCourtship: 0.5,          // courtship progress is multiplied by this
  confessionDoubterDoubt: 1,
  doubterAbove: 50,
  shunnedAbove: 60,
  shunningDoubt: 2,
  shunningBreakChance: 0.04,
  shunningLine: "{name} broke at supper, and ran out into the rain, and was not seen again.",
  gate: { refusalEvery: 4, escapeChance: 0.1,
    escapeLine: "{name} went over the wall at the bottom of the kitchen garden on Wednesday night. Her bed had not been slept in. The gate is still padlocked." },
  foldBelief: 2,                 // Belief each week, towards its height

  /* ---------- Petitions and proposals ---------- */
  petition: {
    base: 0.05,                  // the weekly chance for each eligible Ordinance, at the bottom of Damp
    refuseAuthority: 2,
    refuseDevotion: 2,           // for each devout woman
    grantAuthority: 1
  },
  proposal: {
    base: 0.025
  },

  /* ---------- Concessions ----------
     pit        Pit added each week
     ends       the incursions it ends (ids of events in data/slide-events.js)
     ease       Doubt eased each week: "all", "family" (women with family ties) or "pit" (the less racinated)
     devout     Devotion the devout lose when it is granted */
  concessions: [
    { id: "underclothes", name: "Underclothes not of the era", pit: 0.05, ease: { who: "pit", by: 0.1 }, devout: 0.5, period: 0.97,
      ends: ["incursion-nylons"], note: "Nobody need know." },
    { id: "books", name: "Books written after 1940", pit: 0.1, ease: { who: "all", by: 0.05 }, devout: 1,
      ends: ["incursion-paperback"], note: "Unease in the Library." },
    { id: "newspaper", name: "A daily newspaper", pit: 0.15, ease: { who: "all", by: 0.08 }, devout: 1,
      ends: ["incursion-newspaper"], note: "The outside world at breakfast." },
    { id: "radio", name: "A radio in the house", pit: 0.2, ease: { who: "all", by: 0.1 }, devout: 1.5,
      ends: ["incursion-transistor"], note: "Dance bands, and then the news." },
    { id: "telephone", name: "A telephone in the house", pit: 0.15, ease: { who: "family", by: 0.25 }, devout: 1.5,
      ends: ["incursion-relatives"], note: "A bell that rings from outside." },
    { id: "clothes", name: "Normal clothes not of the era", pit: 0.3, ease: { who: "pit", by: 0.3 }, devout: 2, period: 0.8,
      ends: ["incursion-jeans"], note: "The dress code broken in plain sight. Not with a strict or exacting dress code." },
    { id: "television", name: "A television in the house", pit: 0.5, ease: { who: "all", by: 0.2 }, devout: 3,
      ends: ["incursion-television"], note: "The Pit in the Drawing Room." }
  ],
  concessionAuthority: 2,
  // What is let in openly does not fester: each Concession cuts everything else that brings the Pit in by this share.
  concessionInflowCut: 0.07,

  /* ---------- The end of love ---------- */
  loveEndsAt: 6,                 // Severity
  loveEndsAfterWeeks: 2,         // if nobody reaches for intimacy, it comes at Matins this many weeks later
  loveEnded: {
    title: "The evening",
    evening: "{a} and {b} were not in the Drawing Room. The Housekeeper found them in the scullery passage, a yard apart, not looking at each other. {b} said that she did not think it would be right, now, with the Book. {a} said nothing at all. The gramophone was not wound that evening, or afterwards.",
    rite: "{a} came to the Study at the appointed hour, and stood before the desk with her hands folded, and waited. Nothing was said. After a while {mistress.name} told her she might go, and she went. There was nothing there any more for either of them to give the other.",
    working: "The Chamber was made ready, and nobody came up the back stairs. In the morning the candles were found still in their ring, unlit. The green notebook says that the Working needs love. There is none in the house to draw on.",
    guest: "{a} had read about the house in the personal columns, and came hoping for something she could not have put a name to. It was not there. She left on the Thursday, early, and said at the station that the house had been very quiet.",
    plain: "There were no evenings this week. Nobody asked why.",
    button: "Go on",
    dancingReturns: "They dance again on Saturdays. Nobody asks anybody.",
    bondLabel: "Ended"
  },

  /* ---------- The voice of the house ----------
     from     Severity at which the voice takes over
     report   the title of the Housekeeper's report ({name} is filled in)
     names    "full" (Miss Pell), "surname" (Pell), "sister" (Sister Pell)
     left / racinated / lost: how a departure is described */
  voices: [
    { id: "idyll", from: 0, report: "{name}’s report", names: "full",
      left: "left the house", racinated: "departed racinated",
      matins: [], reckoning: [] },
    { id: "order", from: 3, report: "Minutes of the week", names: "full",
      left: "went back to the Pit", racinated: "departed racinated",
      matins: ["The bell. Matins. The day's duties were read and acknowledged.",
               "Matins was kept. Two faults were noted, and corrected.",
               "The household rose at six, as ordained. The Pit was named, and renounced."],
      reckoning: ["The week is closed. The house holds.",
                  "Vigilance was kept. The accounts balance.",
                  "Another week against the Pit. The household is steadier for it."] },
    { id: "fold", from: 8, report: "The Record", names: "sister",
      left: "was lost", racinated: "went out",
      matins: ["Matins. All present. All accounted for.",
               "The house rose as one. It was decided that the day would be kept as yesterday was kept.",
               "Matins. The Outside was renounced. The household is grateful."],
      reckoning: ["The week is recorded. The Fold is whole.",
                  "It was a good week. Nobody was lost. The household gives thanks.",
                  "Unity. Order. Gratitude. The week is closed."] }
  ]
};
