/*
  RACINATION — data/rules.js
  ---------------------------------------------------------------
  The house rules (Milestone 4b), what each setting does, what it
  costs the Mistress in Authority to change them, the Housekeeper,
  and asking the household for contributions.

  Options are listed from loosest to strictest; the further a
  change moves, the more it costs and the more it is resented.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.rules = {

  rules: [
    {
      id: "dressCode", name: "Dress code",
      about: "How strictly the house keeps to 1930s dress.",
      options: [
        { id: "gentle", label: "Gentle", note: "1930s dress is encouraged, not required.",
          periodMult: 0.7, pitMult: 0.6, pitDoubt: 0 },
        { id: "practical", label: "Practical", note: "1930s dress in the house; allowances for the garden and the weather.",
          periodMult: 1.0, pitMult: 0.8, pitDoubt: 0.05 },
        { id: "strict", label: "Strict", note: "1930s dress at all times. Modern clothes are a fault.",
          periodMult: 1.3, pitMult: 1.2, pitDoubt: 0.15 },
        { id: "exacting", label: "Exacting", note: "1930s dress to the last hairpin, inspected at Matins.",
          periodMult: 1.6, pitMult: 1.5, pitDoubt: 0.3, authorityDrain: 0.15 }
      ]
    },
    {
      id: "electricity", name: "Electricity",
      about: "How much of the twentieth century is let in through the wires.",
      options: [
        { id: "unrestricted", label: "Unrestricted", note: "Lights, fires and kettles as anyone pleases.",
          cost: 7, paraffin: 0, pit: 0.8, pitMindedDoubt: 0 },
        { id: "evenings", label: "Evenings only", note: "Electric light after dark; lamps and candles by day.",
          cost: 4, paraffin: 0, pit: 0, pitMindedDoubt: 0 },
        { id: "computing", label: "Computing Room only", note: "Paraffin lamps and candles everywhere else.",
          cost: 1.5, paraffin: 3, pit: -0.8, pitMindedDoubt: 0.12 }
      ]
    },
    {
      id: "familyContact", name: "Family contact",
      about: "How freely the household may hear from home.",
      options: [
        { id: "open", label: "Open", note: "Letters, visits and the telephone in the village box.",
          remittances: 1.0, tiePit: 1.0, devotion: 0, doubtPerFamilyTie: 0 },
        { id: "letters", label: "Letters only", note: "Letters, read by their recipients alone. No visits.",
          remittances: 0.7, tiePit: 0.6, devotion: 0.1, doubtPerFamilyTie: 0.06 },
        { id: "none", label: "None", note: "No contact with families. The house is their family now.",
          remittances: 0.3, tiePit: 0.2, devotion: 0.25, doubtPerFamilyTie: 0.15, records: true }
      ]
    },
    {
      id: "guestIntake", name: "Guest intake",
      about: "How many paying guests the house will take.",
      options: [
        { id: "none", label: "None", note: "No paying guests." },
        { id: "occasional", label: "Occasional", note: "A guest now and then." },
        { id: "regular", label: "Regular", note: "Guests most weeks in the season." },
        { id: "full", label: "Full", note: "Every guest room let whenever it can be." }
      ],
      quiet: true   // no one objects to this one
    }
  ],

  defaults: { dressCode: "practical", electricity: "evenings", familyContact: "open", guestIntake: "regular" },

  /* ---------- Changing a rule ---------- */

  changeCost: 4,             // Authority for a change of one step
  perExtraStep: 2,           // and this much more for each step beyond the first
  quietCost: 2,              // for a rule no one objects to (guest intake)
  minimumAuthority: 10,      // below this the Mistress cannot change rules
  objectorDoubt: 3,          // Doubt for each resident who objects
  supporterDevotion: 2,      // Devotion for each resident who welcomes it
  // A tightening is resented by residents still close to the Pit (Racination below this)...
  objectsBelowRacination: 40,
  // ...and welcomed by those who want structure or to be told what to do.
  welcomedBy: ["structure", "obey"],

  /* ---------- The Housekeeper ---------- */

  housekeeper: {
    appointCost: 3,            // Authority
    savingPerAccounts: 0.02,   // each point of her accounts skill trims provisions and coal by this share
    maxSaving: 0.1,
    reportTitle: "{name}’s report",
    warning: "{name} has been heard to say that the house would run better if it ran differently. Her doubts now outweigh the Mistress’s authority.",
    vacancy: "The house has no Housekeeper. Appoint one on the Rules page."
  },

  /* ---------- Asking for contributions ---------- */

  contributions: {
    perResident: 10,           // pounds from each resident's savings
    authorityCost: 6,
    doubtEach: 3,
    extraDoubtWithDebts: 3,    // more for a woman with debts of her own
    everyWeeks: 13,            // no more often than once a season
    line: "{mistress.name} asked the household for contributions on Sunday. They gave, and some of them gave a look as well."
  }
};
