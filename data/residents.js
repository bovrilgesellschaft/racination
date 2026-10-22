/*
  RACINATION — data/residents.js
  ---------------------------------------------------------------
  Everything the game needs to make a household: names,
  backgrounds, skills, desires, ties to the outside world, secrets,
  the duties on the rota, and the lines the house writes about them.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.residents = {

  // How many women the house starts with, and how many of each polarity at least.
  startingHousehold: 8,
  minimumOfEachPolarity: 3,

  ages: [24, 48],

  /* ---------- Names (women born 1935–1959) ---------- */

  firstNames: [
    "Alison", "Anne", "Barbara", "Bridget", "Carol", "Caroline", "Celia", "Christine", "Clare", "Constance",
    "Deborah", "Diana", "Dorothy", "Elaine", "Elizabeth", "Fiona", "Frances", "Gillian", "Harriet", "Helen",
    "Hilary", "Imogen", "Isobel", "Janet", "Jennifer", "Joanna", "Judith", "Julia", "Katharine", "Lesley",
    "Linda", "Lorna", "Lucy", "Margaret", "Marian", "Miranda", "Moira", "Nicola", "Pamela", "Patricia",
    "Pauline", "Philippa", "Rachel", "Rosalind", "Rosemary", "Ruth", "Sally", "Sarah", "Sheila", "Susan",
    "Teresa", "Ursula", "Valerie", "Veronica", "Wendy"
  ],

  surnames: [
    "Ashby", "Baverstock", "Bellamy", "Bracegirdle", "Carew", "Chaplin", "Cotterell", "Cruddas", "Dacre", "Dunstan",
    "Ellery", "Fennimore", "Garside", "Goodfellow", "Haddow", "Halliwell", "Hatherley", "Inchbald", "Jessop", "Kettering",
    "Lacey", "Lampeter", "Mayhew", "Merriman", "Nettleship", "Ormerod", "Pargeter", "Pell", "Penhaligon", "Quennell",
    "Rendell", "Ruddock", "Saltmarsh", "Sheringham", "Strudwick", "Tallis", "Tremlett", "Underhill", "Vellacott", "Verity",
    "Wainwright", "Westlake", "Whitlock", "Wilmot", "Yeo"
  ],

  // Weighted: most residents are English.
  nationalities: [
    { name: "English", weight: 16 },
    { name: "Scottish", weight: 2 },
    { name: "Welsh", weight: 2 },
    { name: "Irish", weight: 1 }
  ],

  /* ---------- Polarity ---------- */

  polarities: {
    blonde: { label: "Blonde", note: "receptive, ultra-feminine" },
    brunette: { label: "Brunette", note: "feminine but commanding" }
  },

  /* ---------- Skills ---------- */

  skills: ["cookery", "needlework", "gardening", "letters", "typesetting", "programming", "liturgy", "accounts", "charm"],

  skillNames: {
    cookery: "Cookery", needlework: "Needlework", gardening: "Gardening", letters: "Letters",
    typesetting: "Typesetting", programming: "Programming", liturgy: "Liturgy", accounts: "Accounts", charm: "Charm"
  },

  /* ---------- Backgrounds (GDD §6) ---------- */

  /*
    skills  — extra points added to the random skills (0–5 in the end)
    title   — "Miss" or "Mrs"
    ties    — which kinds of tie she is likely to have
    pit     — how much of the outside world she still carries (0–1)
    ages    — the youngest and oldest she can be (within 24–48)
  */
  backgrounds: [
    { id: "oxford", name: "Oxford dropout", title: "Miss", pit: 0.5, ages: [24, 36],
      skills: { letters: 2, typesetting: 1, programming: 1 },
      ties: ["family", "debts"],
      blurb: "She went up to Oxford to read English and came down again without it, having found in the Bodleian a century she preferred to her own." },
    { id: "nurse", name: "ex-nurse", title: "Miss", pit: 0.3, ages: [30, 48],
      skills: { cookery: 1, accounts: 1, charm: 1 },
      ties: ["job", "family"],
      blurb: "She nursed for nine years at a general hospital, until the day she realised she had been waiting all that time for a matron who would never come." },
    { id: "wife", name: "runaway wife", title: "Mrs", pit: 0.6, ages: [27, 48],
      skills: { cookery: 2, needlework: 1, accounts: 1 },
      ties: ["ex", "family"],
      blurb: "She left a semi-detached house in Swindon, a husband and a fondue set, and took only the fondue set's instructions, which she still reads for comfort." },
    { id: "nun", name: "lapsed nun", title: "Miss", pit: 0.1, ages: [33, 48],
      skills: { liturgy: 3, needlework: 1, gardening: 1 },
      ties: ["family"],
      blurb: "She was eleven years in an enclosed order, and left it not for want of devotion but because she had discovered that it was addressed to the wrong person." },
    { id: "punk", name: "former punk", title: "Miss", pit: 0.8, ages: [24, 32],
      skills: { programming: 1, charm: 1, letters: 1 },
      ties: ["ex", "flat", "debts"],
      blurb: "She was in a band in 1978 whose name she will not say before Evensong. She came to the house after hearing a gramophone through an open window and following the sound up the drive." },
    { id: "civil", name: "civil servant on sabbatical", title: "Miss", pit: 0.5, ages: [28, 48],
      skills: { accounts: 2, letters: 1, typesetting: 1 },
      ties: ["job", "flat"],
      blurb: "She came from a Ministry on what her department believes to be a sabbatical, and keeps her letters from Personnel in a drawer with her stockings, unopened." }
  ],

  /* ---------- Desires (GDD §6) ---------- */

  /*
    likes  — duties that suit this desire (she gains a little when on one)
    polarity (optional) — makes this desire likelier for blondes or brunettes
  */
  desires: [
    { id: "sanctuary", name: "sanctuary", likes: ["garden", "rest", "devotions"],
      text: "She wants a door she can close on the twentieth century." },
    { id: "romance", name: "romance", likes: [],
      text: "She wants, though she would not put it so, to be courted." },
    { id: "structure", name: "structure", likes: ["kitchen", "laundry", "sewing"],
      text: "She wants a bell to rise to and a rule to keep." },
    { id: "audience", name: "an audience", likes: ["guestcare", "devotions", "correspondence"],
      text: "She wants to be seen, and to be seen properly." },
    { id: "obey", name: "to be told what to do", polarity: "blonde", likes: ["laundry", "sewing", "guestcare"],
      text: "She wants, very much, to be told what to do." },
    { id: "command", name: "to tell others what to do", polarity: "brunette", likes: ["correspondence", "devotions", "kitchen"],
      text: "She wants a household to answer to her." }
  ],

  /* ---------- Tellurian ties (GDD §6) ---------- */

  ties: {
    family: [
      "a mother in Basingstoke who writes every Tuesday and encloses cuttings",
      "a sister in Leeds who thinks it is a phase",
      "a father in Cheltenham who sends money and does not ask",
      "a brother who telephones the village box on Sundays"
    ],
    ex: [
      "a husband in Swindon who has not yet changed the locks",
      "an ex-boyfriend with a van and a grievance",
      "a former girlfriend in Brixton who still has her records"
    ],
    job: [
      "a post held open for her until Michaelmas",
      "a pension she will lose if she does not return by the spring",
      "a former employer who keeps offering her more money"
    ],
    debts: [
      "an overdraft that writes to her",
      "a hire-purchase agreement on a music centre",
      "money owed to a friend who has stopped mentioning it"
    ],
    flat: [
      "a flat in Hackney with a lodger in it",
      "a bedsit in Camden she still pays the rent on",
      "a council flat in Peckham in her name"
    ]
  },

  /* ---------- Secrets (hidden; they matter from Milestone 5) ---------- */

  // A secret written as { text: "...", background: "wife" } is only given to that background.

  secrets: [
    "She keeps a transistor radio wrapped in a petticoat at the bottom of her trunk.",
    "She is not thirty-one, as she told the house, but thirty-eight.",
    "She has been writing a novel about the house, and it is not kind.",
    { text: "She still sends money to her husband, who does not know where she is.", background: "wife" },
    "She wrote to the house for a year under a false name before she came.",
    "She does not believe a word of the doctrine, but she is in love with someone here.",
    "She has a Walkman and one cassette, and plays it under the bedclothes.",
    "She was asked to leave another Goddess group, and has never said why.",
    "She has been in touch with a journalist, and has not yet decided what to tell her.",
    "She cannot read music, and has been miming the hymns for two years.",
    "She smokes, in the garden, after Compline.",
    "She is the author of a lurid paperback published under another name."
  ],

  /* ---------- Duties on the rota (GDD §4) ---------- */

  /*
    skill     — the skill the duty uses
    minSkill  — the least skill needed to be put on it
    polarity  — "any", "blonde" or "brunette"
    racination, devotion, doubt — the weekly nudge from doing it
    setting   — where the portrait places her while on this duty
  */
  duties: [
    { id: "kitchen", name: "Kitchen", skill: "cookery", minSkill: 0, polarity: "any",
      racination: 0.15, devotion: 0.1, doubt: 0,
      setting: "Victorian rectory kitchen with a range",
      note: "Feeds the house." },
    { id: "garden", name: "Garden", skill: "gardening", minSkill: 0, polarity: "any",
      racination: 0.25, devotion: 0, doubt: -0.1,
      setting: "walled kitchen garden of a Victorian rectory",
      note: "Good for the spirit; good for the table from Milestone 4." },
    { id: "laundry", name: "Laundry", skill: "needlework", minSkill: 0, polarity: "any",
      racination: -0.05, devotion: 0.15, doubt: 0.05,
      setting: "Victorian scullery with a copper and a mangle",
      note: "Hard and humble." },
    { id: "sewing", name: "Sewing Room", skill: "needlework", minSkill: 1, polarity: "any",
      racination: 0.3, devotion: 0.05, doubt: 0,
      setting: "sewing room in a Victorian house, with a treadle sewing machine",
      note: "Makes and mends the house's clothes from Milestone 4." },
    { id: "correspondence", name: "Correspondence", skill: "letters", minSkill: 1, polarity: "brunette",
      racination: -0.2, devotion: 0, doubt: 0.1,
      setting: "Victorian study with a writing desk",
      note: "Brunettes only. The post brings the Pit in with it." },
    { id: "computing", name: "Computing Room", skill: "programming", minSkill: 2, polarity: "any",
      racination: -0.5, devotion: -0.1, doubt: 0.2,
      setting: "small Victorian room with a 1980s home computer on a mahogany table",
      note: "The one room with mains electricity. Costs Racination." },
    { id: "guestcare", name: "Guest Care", skill: "charm", minSkill: 1, polarity: "blonde",
      racination: 0.1, devotion: 0.05, doubt: 0,
      setting: "Victorian rectory drawing room",
      note: "Blondes only. No paying guests until Milestone 4." },
    { id: "devotions", name: "Devotions", skill: "liturgy", minSkill: 1, polarity: "any",
      racination: 0.2, devotion: 0.6, doubt: -0.15,
      setting: "small candlelit chapel in a Victorian house",
      note: "Keeps the Chapel and the bell." },
    { id: "rest", name: "Rest", skill: null, minSkill: 0, polarity: "any",
      racination: 0.1, devotion: -0.1, doubt: 0,
      setting: "Victorian rectory drawing room",
      note: "No duty this week." }
  ],

  /* ---------- Weekly drift (the rules of the meters) ---------- */

  /*
    All figures are points per week. These are first guesses;
    Milestone 11 balances them.
  */
  drift: {
    dressPeriod: 0.4,        // Racination gained when dressed wholly in 1930s things
    dressPit: -0.5,          // ...lost when dressed wholly in modern things
    dressDevotion: 0.3,      // Devotion gained (or lost) the same way, at this scale
    skillBonus: 0.06,        // Racination per point of skill used in her duty
    likedDuty: 0.2,          // Racination when her duty suits what she wants
    likedDutyDoubt: -0.1,
    perTie: -0.2,            // Racination per tie to the outside world
    perTieDoubt: 0.12,
    devotionCalmsDoubt: -0.25,   // when Devotion is 70 or more
    racinationCalmsDoubt: -0.2,  // when Racination is 70 or more
    doubtErodesDevotion: -0.35,  // when Doubt is 60 or more
    noise: 0.5,              // random wobble, either way
    taper: 110               // gains in Racination shrink as she nears 100 (higher = less taper)
  },

  // Racination at which a Pit hairstyle or make-up is given up for a 1930s one.
  periodStyleAt: 55,

  /* ---------- Lines the house writes ---------- */

  moodLines: {
    radiant:  ["The household is in good heart; there was singing on the back stairs.",
               "The house is cheerful this week, and the Housekeeper suspects the Goddess."],
    content:  ["The household is settled, which is as much as any house can ask in this century.",
               "The household goes about its duties in good order."],
    troubled: ["There is a certain tightness about the household this week.",
               "The household is uneasy. Doors are being closed rather firmly."],
    pit:      ["The household still has the outside world on it, like mud on a hem.",
               "The house is not yet itself. Too many of its women still think in decimal."]
  },

  // {name} is filled in.
  riseLine: "{name} is in better spirits than last week.",
  fallLine: "{name} seems lower this week.",
  doubtLine: "{name} was heard asking a question at supper that nobody answered.",

  departureLines: [
    "{name} left the house this morning, racinated, with a cardboard suitcase, a set of finger waves and the house's blessing. She says she will write, and the house believes her.",
    "{name} has gone out into the world again, made whole. The house rang the bell for her at the gate, and the village heard it and wondered.",
    "{name} departed racinated on the Saturday train. Her room has been aired, and her duties shared out, and nobody has yet moved her chair."
  ],

  restyleLines: {
    hair: "{name} had her hair set in the 1930s manner this week, and looked at the result for a long time.",
    makeup: "{name} has given up her modern paint for something the house can approve of."
  }
};
