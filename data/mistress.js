/*
  RACINATION — data/mistress.js
  ---------------------------------------------------------------
  Everything offered on the Mistress's creation screen, her
  starting position, how her meters move, and the lines the house
  writes about her.

  Her appearance uses the same lists as the residents
  (data/appearance.js), except that her hair style and make-up are
  always 1930s.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.mistress = {

  titles: ["Miss", "Mrs"],

  ages: [30, 58],

  nationalities: ["English", "Scottish", "Welsh", "Irish"],

  // For the "Random name" button. Residents' surnames are never reused for her.
  firstNames: [
    "Adela", "Agatha", "Beatrice", "Cecily", "Clementine", "Cordelia", "Dorothea", "Edith", "Eleanor", "Evelyn",
    "Florence", "Georgiana", "Gwendolen", "Hester", "Honoria", "Isadora", "Leonora", "Lavinia", "Marguerite", "Maud",
    "Millicent", "Octavia", "Ottoline", "Prudence", "Rowena", "Sibyl", "Theodora", "Violet", "Winifred", "Zillah"
  ],
  surnames: [
    "Ashdown", "Beauchamp", "Blackwood", "Calloway", "Delahaye", "Everard", "Fairfax", "Garland", "Grenville", "Hallam",
    "Harcourt", "Ingram", "Kingsley", "Lennox", "Loveday", "Marchbanks", "Montague", "Norwood", "Pemberton", "Ravenscroft",
    "Rochford", "St Clair", "Sedley", "Thursby", "Vane", "Waverley", "Wyndham", "Wolstenholme"
  ],

  /* ---------- Voice ---------- */

  /*
    standing — a cost in standing with snobbish guests (used from Milestone 4)
    prose    — what the house says of it
    short    — the {mistress.voice} token
  */
  voices: [
    { id: "low", label: "Low", short: "low", standing: 0,
      prose: "Her voice is low, and carries further than it seems to." },
    { id: "clipped", label: "Clipped", short: "clipped", standing: 0,
      prose: "Her voice is clipped, every consonant accounted for." },
    { id: "soft", label: "Soft", short: "soft", standing: 0,
      prose: "Her voice is soft; the house leans in to hear it, which is the point." },
    { id: "west", label: "Regional: West Country", short: "West Country", standing: 1,
      prose: "She speaks with the West Country in her voice and has never troubled to lose it." },
    { id: "yorks", label: "Regional: Yorkshire", short: "Yorkshire", standing: 1,
      prose: "She speaks with the flat vowels of the West Riding, and uses them as a weapon." },
    { id: "scots", label: "Regional: Scots", short: "Scots", standing: 1,
      prose: "She speaks with a Scots burr that thickens when she is crossed." },
    { id: "welsh", label: "Regional: Welsh", short: "Welsh", standing: 1,
      prose: "Her voice has a Welsh lilt that makes even the rota sound like a hymn." },
    { id: "irish", label: "Regional: Irish", short: "Irish", standing: 1,
      prose: "She speaks with a soft Irish voice that the village finds harder to argue with than it expected." }
  ],

  /* ---------- Distinguishing mark ---------- */

  marks: [
    { id: "none", label: "None", short: "", prose: "", portrait: "" },
    { id: "spectacles", label: "Spectacles", short: "spectacles",
      prose: "She wears round tortoiseshell spectacles, and looks over them when she means it.",
      portrait: "round tortoiseshell spectacles" },
    { id: "scar", label: "A scar", short: "scar",
      prose: "A thin white scar runs along her jaw, and nobody has asked about it twice.",
      portrait: "faint thin scar along the jawline" },
    { id: "gap", label: "A gap in her teeth", short: "gap in her teeth",
      prose: "There is a gap between her front teeth, which shows when she smiles and makes the smile seem franker than it is.",
      portrait: "small gap between her front teeth" },
    { id: "limp", label: "A limp", short: "limp",
      prose: "She walks with a slight limp and an ebony cane, and the house has learnt the sound of both on the stairs.",
      portrait: "holding an ebony walking cane" }
  ],

  /* ---------- Scent ---------- */

  scents: [
    { id: "chanel", label: "Chanel", short: "Chanel No. 5",
      prose: "She smells of Chanel No. 5, and the house can tell where she has been by it." },
    { id: "shalimar", label: "Shalimar", short: "Shalimar",
      prose: "She wears Shalimar, warm and heavy, which lingers on the landing long after she has gone down." },
    { id: "lily", label: "Lily of the valley", short: "lily of the valley",
      prose: "She smells faintly of lily of the valley, like a drawer of good linen." },
    { id: "carbolic", label: "Carbolic", short: "carbolic",
      prose: "She smells of carbolic soap and nothing else, which the house finds more formidable than any perfume." }
  ],

  /* ---------- Her style within the 1930s ---------- */

  /*
    garments  — what she owns, by wardrobe id (data/wardrobe.js)
    dressCode — where the house's dress code starts (used from Milestone 4)
  */
  styles: [
    { id: "severe", label: "Severe tailoring", short: "severe tailoring", dressCode: "strict",
      garments: ["tailored-costume", "tailored-costume", "blouse", "skirt", "stockings", "courts", "brogues", "coat", "watch"],
      prose: "She dresses like a judgement: tailored, dark and impossible to argue with." },
    { id: "romantic", label: "Romantic", short: "romantic", dressCode: "gentle",
      garments: ["lace-frock", "lace-frock", "tea-frock", "cardigan", "stockings", "t-bars", "coat", "pearls"],
      prose: "She dresses romantically, in bias-cut crêpe and lace, as if every afternoon might end in a proposal." },
    { id: "country", label: "Country tweeds", short: "country tweeds", dressCode: "practical",
      garments: ["tweed-costume", "tweed-costume", "shirtwaister", "cardigan", "stockings", "brogues", "coat", "brooch"],
      prose: "She dresses for the country, in tweed that smells faintly of rain and dogs the house does not own." },
    { id: "evening", label: "Evening glamour, even at breakfast", short: "evening glamour", dressCode: "exacting",
      garments: ["evening-gown", "evening-gown", "day-dress", "bolero", "stockings", "courts", "long-gloves", "pearls"],
      prose: "She dresses for the evening at all hours, and has been seen to take porridge in satin." }
  ],

  /* ---------- Background ---------- */

  /*
    money      — starting money in pounds (replaces the house's figure)
    skills     — her skills, 0–5 (any not listed start at 1)
    authority, conviction, doubt — added to her starting meters
    contacts   — people she can call on (from Milestone 5)
  */
  backgrounds: [
    { id: "academic", label: "Lapsed academic", short: "lapsed academic", money: 1400,
      skills: { letters: 4, typesetting: 2, liturgy: 2, accounts: 2 },
      authority: 5, conviction: 5, doubt: 5,
      contacts: ["a college librarian who will lend anything", "a former student who now produces for the BBC", "a professor of Anglo-Saxon who still writes"],
      blurb: "She held a fellowship in Old Norse until she noticed that the century had ended without her, and resigned in a letter the Senior Common Room still quotes." },
    { id: "widow", label: "Wealthy widow", short: "wealthy widow", money: 4000,
      skills: { accounts: 3, charm: 3, cookery: 2 },
      authority: 10, conviction: 0, doubt: 0,
      contacts: ["her late husband's solicitor, discreet and expensive", "a cousin with a seat in the Lords", "a bank manager who remembers her wedding"],
      blurb: "Her husband left her a great deal of money and no instructions, and she has spent both freely since." },
    { id: "actress", label: "Former actress", short: "former actress", money: 700,
      skills: { charm: 5, letters: 2, liturgy: 3 },
      authority: 5, conviction: 0, doubt: 5,
      contacts: ["a theatrical agent in Shaftesbury Avenue", "a former leading man who still sends roses", "a costumier with a warehouse in Lambeth"],
      blurb: "She played Shaw and Coward in the provinces for twenty years, and has concluded that the house is the only production worth giving her life to." },
    { id: "nurse", label: "Ex-army nurse", short: "ex-army nurse", money: 1100,
      skills: { cookery: 2, accounts: 2, charm: 1, needlework: 2 },
      authority: 12, conviction: 0, doubt: -5,
      contacts: ["a quartermaster who can find anything", "an old comrade now sitting as a magistrate", "a matron at a county hospital"],
      blurb: "She nursed in the Army in Aden and Germany, and runs the house on the principle that morale is a matter of clean sheets and early bedtimes." },
    { id: "convert", label: "Convert from an earlier Goddess group", short: "convert", money: 600,
      skills: { liturgy: 5, letters: 3, needlework: 2 },
      authority: 0, conviction: 15, doubt: 0,
      contacts: ["a correspondent in Sussex who keeps the old rites", "a printer who asks no questions", "former sisters from the earlier group, some of them hostile"],
      blurb: "She came out of an earlier Goddess group with her faith intact and her opinion of its leadership very much reduced." }
  ],

  /* ---------- Starting meters ---------- */

  // Authority rises with age; the village gossips more about a younger Mistress.
  start: {
    authorityBase: 35,
    authorityPerYearOver30: 0.7,
    conviction: 55,
    doubt: 15
  },

  /* ---------- Weekly drift ---------- */

  drift: {
    authorityByMood: { radiant: 0.3, content: 0.12, troubled: -0.4, pit: -0.15 },
    doubtByMood: { radiant: -0.2, content: -0.05, troubled: 0.3, pit: 0.15 },
    convictionPerDevotions: 0.12,   // for each resident on Devotions
    convictionPerDeparture: 3,      // a resident departing racinated vindicates her
    convictionFade: -0.08,          // faith wears thin if nothing feeds it
    noise: 0.4,
    crisisWeeks: 13                 // Doubt above Conviction for this long, and Matins notices
  },

  /* ---------- Lines ---------- */

  // Opening of her description, before the appearance.
  descriptionOpening: "This is the Mistress of Hesperis House, as the house sees her.",

  // Said when her hair is fair. ({name} is filled in.)
  fairHairNote: "That the Mistress of the house, a brunette in every particular that matters, should be fair is a point of theology the house has decided to find instructive.",

  // Shown in Matins when her Doubt has outrun her Conviction for a season.
  crisisLines: [
    "The Housekeeper notes that {mistress.name} did not come down to Matins on Thursday, and did not say why.",
    "{mistress.name} has been seen in the Library at night with the lamp lit and no book open.",
    "There is a stillness about {mistress.name} this week that the house has learned to fear."
  ],

  // Shown under her meters.
  meterNotes: {
    authority: "Her standing with the household. Spent to get things done (from Milestone 4).",
    conviction: "Her faith in what the house is for.",
    doubt: "Her misgivings. If it outruns Conviction for a season, the house will notice."
  }
};
