/*
  RACINATION — data/consent.js
  ---------------------------------------------------------------
  Milestone 6: the consent model, the Evenings, courtship and
  bonding, the rite, paying guests' rites, and the failure-state
  ladder. See the M6 design document for the reasoning.

  The rite is described only by ceremony, feeling and aftermath.
  Fuller scenes, and your Author tier, arrive with M7's Scene Kit.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.consent = {

  /* ---------- Consent profiles ---------- */

  // Areas of a profile. Each resident is "hard" (never), "soft" (perhaps, with trust) or "want".
  areas: {
    courtship: "Courtship",
    rite: "Ritual correction",
    working: "The Working (from Milestone 8)"
  },
  levelWords: { hard: "a hard limit", soft: "perhaps, with trust", want: "something she wants" },

  // Chances of each level, by her desire. Order: hard, soft, want.
  profileOdds: {
    courtship: { default: [0.15, 0.55, 0.30], romance: [0.05, 0.35, 0.60], sanctuary: [0.30, 0.55, 0.15] },
    rite:      { default: [0.35, 0.45, 0.20], obey: [0.10, 0.40, 0.50], structure: [0.20, 0.45, 0.35], sanctuary: [0.55, 0.40, 0.05] },
    working:   { default: [0.40, 0.45, 0.15] }
  },

  // The rite's three measures (D8). Her limit is the highest she will accept.
  measures: [
    { id: "token", label: "Token", note: "A ceremonial correction: mostly words and form.", weight: 0.7 },
    { id: "formal", label: "Formal", note: "The house's ordinary rite.", weight: 1.0 },
    { id: "severe", label: "Severe", note: "Rare; only for a woman who names it as wanted.", weight: 1.4 }
  ],
  // Chances of her measure limit being token, formal or severe (when the rite is not a hard limit).
  measureOdds: [0.35, 0.5, 0.15],

  // Each resident's house word is drawn from these.
  houseWords: ["Lavender", "Bramble", "Primrose", "Candlemas", "Willow", "Quince", "Harebell", "Marigold",
               "Sorrel", "Juniper", "Michaelmas", "Foxglove", "Wren", "Damson", "Larkspur"],

  /* ---------- Dependency (hidden, 0–100) ---------- */

  dependency: {
    base: 10,
    perMissingTie: 7,          // for each of three ties she does not have
    perYearInHouse: 4,
    familyContact: { open: 0, letters: 10, none: 25 },
    perRefusal: 12,            // each time the house refused to let a woman leave
    bonded: -8                 // a bond of her own steadies her
  },

  /* ---------- The reason behind a yes ---------- */

  reasons: {
    desire:   { label: "she wanted it",        free: true },
    devotion: { label: "out of devotion",      free: true },
    curiosity:{ label: "out of curiosity",     free: true },
    please:   { label: "to please the house",  free: false, partly: true },
    fear:     { label: "for fear of losing her home", free: false },
    nowhere:  { label: "because she had nowhere else to go", free: false }
  },
  // When the Mistress herself is the one asking (D1), fear and devotion weigh this much more.
  mistressWeight: 1.5,
  // Dependency at which a hard limit can be overborne by fear (an extracted yes).
  extractedAbove: 60,

  /* ---------- The Evenings ---------- */

  registers: [
    { id: "devotions", label: "Devotions", note: "Steady Devotion." },
    { id: "dancing", label: "Gramophone and dancing", note: "Racination; admiration may begin." },
    { id: "reading", label: "Reading aloud", note: "Racination, especially for the reader." },
    { id: "courtship", label: "Courtship", note: "An evening with someone she is courting." },
    { id: "talk", label: "A talk in the Study", note: "The Mistress learns something of her limits (one a week)." },
    { id: "rest", label: "Rest", note: "Nothing happens." }
  ],
  registerEffects: {
    devotions: { devotion: 0.5 },
    dancing: { racination: 0.4 },
    reading: { racination: 0.3 },
    rest: { doubt: -0.2 },
    talk: { doubt: -0.3 }
  },
  admirationChance: 0.15,      // two residents dancing or reading together

  /* ---------- Courtship and bonding ---------- */

  stages: ["", "Admiration", "Understanding", "Attachment", "Devotion"],
  stageAt: [0, 1, 4, 9, 15],   // progress needed for each stage
  progressPerEvening: 1,
  samePolarityPace: 0.6,       // D2: slower
  samePolarityBeliefDoubt: 0.3,// Doubt for believers each week a same-polarity courtship goes on under high Belief
  courtingRacination: 0.5,
  bondedRacination: 0.4,
  bondedDevotion: 0.3,
  bondedDoubt: -0.3,
  jealousyDoubt: 1.5,

  /* ---------- The rite ---------- */

  petitionChance: { want: 0.08, soft: 0.03 },   // a resident petitioning for correction, each week
  petitionWeeks: 2,                               // how long a petition stays open
  faults: [
    "lateness at Matins",
    "modern clothes under the dress code",
    "a tune from the wireless on the back stairs",
    "neglect of her duty",
    "a sharp word at supper",
    "a letter left unanswered"
  ],
  housekeeperFactor: 0.8,       // D3: a Housekeeper's rite counts for less
  outcomes: {
    desire:   { racination: 4, devotion: 2, doubt: -2 },
    devotion: { racination: 2, devotion: 3, doubt: 0 },
    harm:     { racination: -1, devotion: 0, doubt: 5, dependency: 5 }
  },
  houseWordDoubt: 1,            // a rite stopped by the house word: no harm, a little unease
  beyondLimitHarm: 10,          // Doubt when a rite goes past her limit and she does not stop it
  skippedAftercareDoubt: 3,
  publicReconciliationDevotion: 0.5,
  privateReconciliationDoubt: -1,

  // Summary lines. {presider}, {name}, {first} and {fault} are filled in.
  // These are Gaslight: ceremony, feeling and aftermath only.
  lines: {
    hearingAccepted: "{name} heard the charge of {fault} in the Study and accepted it, standing very straight.",
    hearingPetition: "{name} came to the Study after Evensong and asked to be put right, for {fault}.",
    hearingWithdrawn: "{name} heard it out and then withdrew, as she is always free to do. The matter is closed, and nothing is held against her.",
    hearingContested: "{name} contested the charge, quietly and firmly. She does not accept it.",
    rite: [
      "The rite was kept in the Study with all its forms: the door shut, the lamp turned low, the gramophone wound and left to run down, the words said in their order.",
      "The rite was kept in the Morning Room, with the curtains drawn and the clock stopped, and the forms observed exactly as the house keeps them.",
      "The rite was kept quietly, with the words of the house and the long silences that belong to them."
    ],
    houseWord: "Partway through, {first} said the house word. Everything stopped at once, as the house's rule requires. {presider} put a shawl round her and sat with her until she was ready to talk.",
    believedDesire: "Afterwards {first} sat a long while by the fire with a shawl round her shoulders, and said she felt clean through.",
    believedDevotion: "{first} bore it as an act of faith, and thanked {presider} at the end in a voice that shook only a little.",
    believedUnsure: "{first} was composed afterwards, and very quiet, and went up early.",
    aftercare: "{presider} sat with her afterwards, with tea and the fire, until she was ready to go up.",
    aftercareSkipped: "There was no sitting by the fire afterwards; {presider} had the accounts to do.",
    reconciliationPublic: "Before Evensong the two were reconciled in front of the household, and the matter was closed.",
    reconciliationPrivate: "They were reconciled privately, in the Study, and the matter was closed.",
    // When the Mistress insists on a rite that was contested. This is harm, and is written as harm.
    insisted: "The rite was kept although {first} had contested the charge. It should not have been. She went up afterwards without a word, and the household heard her door lock.",
    // Under "Used sparingly", a woman pushed past her limit who does not say her word.
    beyondLimit: "{first} did not say her word, though she should have. She bore it, white and silent, and something in the house went out like a lamp.",
    dropped: "{presider} let the charge drop. {first} thanked her stiffly, and went back to her duty."
  },

  // Lines for courtship and the Evenings. {a} and {b} are names; {afirst} and {bfirst} first names.
  courtshipLines: {
    begun: "{a} and {b} are courting. The household, which has known for weeks, is delighted to be told.",
    begunMistress: "{mistress.name} has begun to court {a}. The household is gracious about it, and watches.",
    declined: "{a} would rather not, and said so kindly. That is the end of it.",
    askedAgain: "{a} has been asked before, and said no before. Being asked again has not made her any happier.",
    admiration: "{a} has begun to admire {b} across the gramophone.",
    admirationReading: "{a} has begun to admire {b}, who reads aloud as if the words were meant for her.",
    stage: "{a} and {b} have reached {stage}.",
    talk: "In the Study, {afirst} told the Mistress about {area}: {level}.",
    talkMeasure: "In the Study, {afirst} told the Mistress how far a rite may go with her: as far as {measure}, and no further.",
    talkMeasureNone: "In the Study, {afirst} told the Mistress that she will not have the rite at all.",
    talkNothing: "{afirst} talked with the Mistress in the Study until the fire went down. Nothing new was learned, and nothing needed to be.",
    favouritism: "The household has noticed where the Mistress spends her evenings."
  },
  guestDeclined: "{name} thought better of it, and said so, and was thanked for saying so.",

  /* ---------- Paying guests and the rite ---------- */

  guestInterestOdds: [0.5, 0.3, 0.2],          // none, curious, wants (more "wants" as word spreads)
  guestCirclePull: 0.03,                       // each enjoyed guest rite shifts future guests towards "wants"
  guestInterestWords: { none: "came for the frocks and the quiet", curious: "has heard about the rite, and might", wants: "booked partly for the rite" },
  guestEnjoyChance: { desire: 0.85, curiosity: 0.5, please: 0.15 },
  guestSatisfaction: { enjoyed: 40, disliked: -30 },
  guestRitePit: 0.5,
  guestLines: {
    enjoyed: "{name}, {job} from {town}, kept a rite in the Study on Thursday at her own asking, and wept with something like joy afterwards. She will tell the personal columns.",
    disliked: "{name}, {job} from {town}, asked for the rite out of curiosity and found she did not care for it. She was sat with until she was herself again, and was very polite about it at breakfast.",
    pressed: "{name}, {job} from {town}, was offered a rite she had never asked for, and agreed because she did not know how to refuse. She left on the first train, white and silent."
  },

  /* ---------- The failure-state ladder ---------- */

  // How much each recorded thing weighs on the hidden Coercion score.
  weights: {
    riteWithoutConsent: 12,
    riteBeyondLimit: 10,
    preventedLeaving: 8,
    extracted: 6,
    guestPressed: 6,
    propertyDestroyed: 4,
    withheldLetters: 4,
    guestsKeptFromFamily: 4,
    skippedAftercare: 3,
    houseWordDiscouraged: 1,   // each week the rule is in force
    isolationWeeks: 0.5        // each week family contact is "none"
  },
  amendsPerSoundWeek: 0.6,     // a week with no new marks draws the score down by this much
  rungs: [
    { at: 0,  name: "Sound" },
    { at: 10, name: "Cooling" },
    { at: 20, name: "Diaries" },
    { at: 35, name: "Talk" },
    { at: 50, name: "The police" },
    { at: 65, name: "The trial" }
  ],
  // From this rung, courtship, rites and every intimate scene are refused (the gates close).
  gatesCloseAt: 2,
  // From this rung, the house cannot climb back down (D6).
  noReturnFrom: 3,
  // Matins lines when the house has cooled (rung 1 and above).
  coolLines: [
    "The household is polite this week. Nobody laughs on the stairs.",
    "The house is very quiet. Doors are closed gently, and stay closed.",
    "The household goes about its duties correctly, and without warmth."
  ],
  closedNote: "The house is not in a state for courtship or rites. The evenings are for devotions, reading and rest."
};
