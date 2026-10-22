/*
  RACINATION — data/economy.js
  ---------------------------------------------------------------
  The household economy (Milestone 4a): what comes in, what goes
  out, the rooms of the house, the Pit, paying guests, the seasons,
  the outside world's yearly events, and how a run can end.

  All money is in pounds per week unless it says otherwise.
  These are first figures; Milestone 11 balances them.

  Sources for prices:
    - Provisions: household food in Great Britain averaged £8.54 a
      head per week in 1983 (MAFF, Domestic Food Consumption and
      Expenditure 1983).
    - Heating, rent and guest fees are reasoned estimates for a
      large, draughty rectory in 1983, not looked-up figures.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.economy = {

  /* ---------- Income ---------- */

  guests: {
    fee: 60,                 // each paying guest, for a week of another life
    pitEach: 0.8,            // Pit each guest brings in with her
    startingReputation: 40,  // 0–100: what the personal columns say about the house
    // How many come, before the rooms limit it: demand = rooms × (base + reputation ÷ 150) × season
    demandBase: 0.35,
    season: { winter: 0.5, spring: 1.0, summer: 1.4, autumn: 0.9 },
    // Guest intake (the rule arrives in Milestone 4b; until then, "regular")
    intake: { none: 0, occasional: 0.5, regular: 0.8, full: 1.0 },
    defaultIntake: "regular",
    // Satisfaction (0–100), which reputation drifts towards
    satisfactionBase: 35,
    perGuestCareCharm: 6,    // for each point of charm on Guest Care
    perKitchenCookery: 2,    // for each point of cookery in the Kitchen
    roomPeriodWeight: 0.25,  // how much the guest rooms' and Drawing Room's Period count
    pitPenalty: 0.25,        // satisfaction lost per point of Pit
    reputationPull: 0.12     // how fast reputation moves towards satisfaction
  },

  publications: {
    // Each resident on Correspondence produces this much a week:
    base: 3,
    perLetters: 3,
    // Multiplied by (1 + the household's best typesetting ÷ 10)
    printingShare: 0.35,     // the printer takes this share as a cost
    pitEach: 0.3             // the post brings the Pit in
  },

  needlework: {
    // Each resident in the Sewing Room sells this much a week (from Milestone 4b some of her time goes on the house's own clothes)
    base: 2,
    perNeedlework: 2.5
  },

  remittances: {
    // Each resident's own money: savings, a benefit cheque, a pension
    perResident: 5,
    // Money sent by family to a resident with a family tie
    perFamilyTie: 7,
    pitEach: 0.25            // for each family tie
  },

  /* ---------- Expenses ---------- */

  rent: 45,                  // a large rectory with land, rented
  ownerRates: 14,            // rates, if the Mistress owns the house (a wealthy widow)
  ownedBy: ["widow"],        // backgrounds whose Mistress owns the house outright

  provisionsPerMouth: 8.5,   // each resident and the Mistress
  // The garden feeds the house: each point of gardening on Garden duty saves this much, by season
  gardenSaves: { winter: 0.4, spring: 1.2, summer: 2.2, autumn: 1.6 },
  kitchenSavingPerCookery: 0.025, // each point of cookery in the Kitchen saves this share of the provisions bill (up to 25%)

  heating: { winter: 30, spring: 15, summer: 4, autumn: 18 },   // coal and paraffin, estimated
  electricity: 4,
  postageBase: 2,
  postagePerCorrespondent: 1,

  /* ---------- Money worries ---------- */

  worryBelow: 200,           // below this, money worries add to the Pit
  bankruptWeeks: 8,          // weeks in a row in debt before the house is lost

  /* ---------- The rooms (GDD §5.2) ---------- */

  /*
    period, condition — the starting range [lowest, highest]
    decay   — Condition lost each week (more in winter for the cold rooms)
    duty    — the duty that works in this room (its Condition and Period affect it)
    guest   — a guest bedroom (one paying guest each, if Condition is 25 or more)
  */
  rooms: [
    { id: "morning",   name: "Morning Room",   period: [40, 70], condition: [45, 75], decay: 0.15 },
    { id: "drawing",   name: "Drawing Room",   period: [45, 75], condition: [45, 75], decay: 0.15 },
    { id: "kitchen",   name: "Kitchen",        period: [30, 60], condition: [40, 70], decay: 0.25, duty: "kitchen" },
    { id: "scullery",  name: "Scullery",       period: [40, 70], condition: [35, 65], decay: 0.3, duty: "laundry", cold: true },
    { id: "sewing",    name: "Sewing Room",    period: [40, 70], condition: [45, 75], decay: 0.15, duty: "sewing" },
    { id: "chapel",    name: "Chapel",         period: [50, 80], condition: [45, 75], decay: 0.125, duty: "devotions" },
    { id: "library",   name: "Library",        period: [45, 75], condition: [40, 70], decay: 0.15, duty: "correspondence" },
    { id: "study",     name: "Mistress's Study", period: [50, 80], condition: [50, 80], decay: 0.125 },
    { id: "computing", name: "Computing Room", period: [5, 20],  condition: [50, 80], decay: 0.1, duty: "computing" },
    { id: "guest1",    name: "Blue Bedroom",   period: [40, 70], condition: [40, 70], decay: 0.2, guest: true, duty: "guestcare" },
    { id: "guest2",    name: "Rose Bedroom",   period: [40, 70], condition: [35, 65], decay: 0.2, guest: true, duty: "guestcare" },
    { id: "guest3",    name: "Garden Bedroom", period: [30, 60], condition: [25, 55], decay: 0.2, guest: true, duty: "guestcare", cold: true },
    { id: "attics",    name: "Attics",         period: [20, 50], condition: [20, 50], decay: 0.25, cold: true }
  ],

  winterDecay: 1.6,          // cold rooms decay this many times faster in winter
  guestRoomUsableAt: 25,
  shabbyBelow: 35,           // rooms below this Condition raise the Pit and Doubt

  repair: {
    points: 25,              // Condition gained by one repair
    costPerPoint: 2.4        // so one repair costs £60
  },
  restore: {
    points: 20,              // Period gained by one restoration
    cost: 180,
    weeks: 4
  },

  /* ---------- The Pit (GDD §3.2) ---------- */

  pit: {
    start: 25,
    deliveries: 0.5,         // the coal lorry, the milk float, the man about the meter
    villageShop: 0.3,
    moneyWorry: 1.0,         // when money is below the worry line
    debt: 2.0,               // when money is below nothing
    perShabbyRoom: 0.25,
    perComputing: 0.8,       // each resident in the Computing Room
    // Taken off each week:
    periodCleanses: 1.6,     // × the house's average Period ÷ 100
    perDevotions: 0.3,       // each resident on Devotions
    settles: 0.055,          // each week this share of it settles of its own accord
    // How the Pit reaches residents:
    neutral: 30,             // below this the Pit does residents no harm (and a little good)
    racinationPerPit: 0.012, // Racination lost each week per point of Pit above the neutral line
    doubtPerShabbyRoom: 0.03
  },

  // A well-kept house helps: Racination gained per point of the house's average Period above 50.
  periodRacination: 0.01,

  // Each room's Condition and Period scale the duty worked in it:
  // income × (0.6 + 0.4 × Condition ÷ 100); Racination + (Period − 50) × this
  roomPeriodDuty: 0.006,

  /* ---------- The outside world's years (fixed dates) ---------- */

  /*
    date — when the news reaches the house (a Monday's week that contains it)
    pit  — a one-off dose of the Pit
    line — what the Housekeeper writes. Tokens such as {mistress.name} work here.
  */
  beats: [
    { date: "1983-06-09", pit: 3, title: "The general election",
      line: "There was a general election on Thursday. The house did not vote, on the principle that none of the candidates had been born before 1900, and the village did not forgive it." },
    { date: "1983-12-19", pit: 3, title: "The home computer Christmas",
      line: "Every shop window in Abingdon has a home computer in it, wrapped in tinsel. Two of the household stopped to look. The Housekeeper has noted which two." },
    { date: "1984-03-12", pit: 4, title: "The miners' strike",
      line: "The miners have come out, and the coal merchant has raised his prices and his voice. The house has resolved to burn less and pray more, in that order." },
    { date: "1984-12-03", pit: 2, title: "A charity record",
      line: "A charity record is being played in every shop in the county, at a volume the house regards as a separate sin from the record itself." },
    { date: "1985-03-04", pit: 1, title: "The strike ends",
      line: "The miners have gone back. The coal merchant has not lowered his prices, but he has lowered his voice." },
    { date: "1985-07-15", pit: 4, title: "A concert on the television",
      line: "On Saturday the whole of England watched a concert on the television for sixteen hours. The house heard it from the village, through closed windows, and gave the Chapel an extra hour." },
    { date: "1986-05-05", pit: 3, title: "A cloud from the east",
      line: "The wireless says there is a cloud of something from Russia over England, and that the rain is not to be drunk. The garden is being watered from the butt regardless, as a matter of faith." },
    { date: "1987-06-15", pit: 3, title: "Another general election",
      line: "Another general election, another Thursday on which the house kept its own counsel and the village kept a list." },
    { date: "1987-10-19", pit: 5, title: "The great storm",
      line: "A great wind came through on Thursday night and took down three of the elms and half the scullery roof. The Housekeeper has recorded it as an act of the Goddess, and the insurers as an act of God, which is costing more.",
      damage: { room: "scullery", condition: -30 } }
  ],

  /* ---------- How a run can end (placeholders until Milestone 11) ---------- */

  endings: {
    pit: { title: "The Pit Wins",
      text: "The Pit has reached the house. One by one the household put on jeans, turned on a television somebody had brought back from the village, and went home. Nobody quarrelled. That was the worst of it." },
    bankrupt: { title: "The Quiet Dissolution",
      text: "The money ran out. There was no scandal, only a sale notice in the Oxford Mail and an auction of sewing machines on a wet Saturday. The house was let to a man who sells double glazing." },
    decade: { title: "The End of the Decade",
      text: "December 1989. The decade the house never consented to has ended without consulting it. Whatever the house has become, it is still standing, and the Housekeeper has ruled off the last page." }
  },

  /* ---------- Lines in the Housekeeper's report ---------- */

  pitWords: [
    { below: 20, word: "faint", line: "The air in the house is clean this week." },
    { below: 40, word: "present", line: "The Pit is about the house as a draught is: noticeable at the doors." },
    { below: 60, word: "strong", line: "The Pit is strong in the house. Someone has been humming a tune from the wireless." },
    { below: 80, word: "heavy", line: "The Pit lies heavy on the house. Slang has been heard at supper, and not corrected." },
    { below: 101, word: "overwhelming", line: "The Pit is at the door, and has its foot in it." }
  ],
  guestLines: {
    none: "No paying guests are expected this week.",
    some: "{n} paying guests are staying this week.",
    one: "One paying guest is staying this week."
  },
  debtWarning: "The house is in debt. If it cannot clear it, the bank will close it within {weeks}."
};
