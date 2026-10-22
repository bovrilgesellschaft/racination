/*
  RACINATION — data/computing-events.js
  ---------------------------------------------------------------
  Milestone 9: events of the Computing Room. The format is the one
  in WRITING-EVENTS.md, with these extras:

    when: { computing: { selling: true } }     a game is on sale
    when: { computing: { released: 2 } }       at least this many released
    when: { computing: { hit: true } }         at least one hit
    effects: { computing: { sales: -0.2 } }    every game on sale sells this much less (or more) from now on
    effects: { computing: { stockLost: 0.2 } } this share of stock is lost
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.computingEvents = [

  {
    id: "cassette-fan-letter", kind: "letter", title: "A letter about a cassette", every: 39,
    from: "Mr D. Ure, a bank clerk in Dundee",
    when: { computing: { released: 1 }, chance: 0.3 },
    text: "Mr Ure writes, on the bank's notepaper, to say that he has played the house's game every evening for a month, that his wife thinks he has gone peculiar, and that he would like to know whether the ladies in it are real, and if so whether one might visit, in a purely respectful way.",
    choices: [
      { label: "Send him a signed photograph of the Computing Room",
        result: "A photograph of the Computing Room went north, with the household's signatures on the back. Mr Ure has written again, to say it is on his mantelpiece and his wife has stopped speaking to him.",
        effects: { reputation: 1, pit: 1 } },
      { label: "Send him the house's prospectus", rhetoric: "belief",
        result: "The prospectus went north. Mr Ure has not written again. A Mrs Ure has, asking for a prospectus of her own.",
        effects: { pit: 1, arrival: { weeks: 10, background: "wife" } } },
      { label: "Leave it unanswered",
        result: "It went in the drawer with the others.",
        effects: {} }
    ]
  },

  {
    id: "cassette-pirates", kind: "incident", title: "Pirates at the market", every: 39,
    when: { computing: { selling: true }, chance: 0.2 },
    text: "The Housekeeper, at Swindon market for elastic, found a stall selling copies of the house's game on blank cassettes with a felt-tip label and the title spelt wrong, at fifty pence each. The young man behind the stall said he had no idea what she was talking about, and offered her two for seventy-five.",
    choices: [
      { label: "Report him to the trading standards people",
        result: "The trading standards people took a statement, and a long time, and the stall was gone the next Saturday. So, it is said, was the young man's interest in software.",
        effects: { computing: { sales: -0.05 }, pit: 1 } },
      { label: "Rise above it", rhetoric: "belief",
        result: "The house rose above it. The pirate copies are said to be all over Wiltshire.",
        effects: { computing: { sales: -0.2 } } }
    ]
  },

  {
    id: "cassette-wont-load", kind: "incident", title: "It won't load", every: 52,
    when: { computing: { selling: true }, chance: 0.15 },
    text: "Letters have begun arriving from purchasers whose copies of the house's game will not load. The duplicators in Reading admit, under some pressure from the Housekeeper on the telephone, to a bad batch of tape.",
    choices: [
      { label: "Replace every faulty copy (£40)", needs: { money: 40 },
        result: "Every faulty copy has been replaced, by return of post, with a handwritten apology in the box. Some of the purchasers have written back to say it is the nicest thing a software company has ever done.",
        effects: { money: -40, reputation: 1 } },
      { label: "Blame the purchasers' tape recorders", rhetoric: "play",
        result: "The house has written to each of them suggesting that they clean their tape heads. The letters column of one of the computing papers has opinions about this.",
        effects: { computing: { sales: -0.15 } } }
    ]
  },

  {
    id: "cassette-who-are-they", kind: "letter", title: "Who are Hesperis Software?", once: true,
    from: "the features editor of a computing magazine",
    when: { computing: { hit: true }, chance: 0.4 },
    text: "The features editor would like to send a writer and a photographer to meet ‘the team behind the hit’, and asks, in a postscript, whether it is true what they are saying in the office, that Hesperis Software are all women and dress as if it were 1934.",
    choices: [
      { label: "Decline, politely",
        result: "The house declined, politely. The magazine has printed the rumour anyway, under a heading involving the word ‘Games Mistresses’.",
        effects: { pit: 2, record: "computingPress" } },
      { label: "Agree, on the house's terms", rhetoric: "belief",
        result: "A writer and a photographer came, were given tea in the Drawing Room and a tour of the Computing Room, and went away bewildered and enchanted. The article will run next month. Sales, the Housekeeper notes, have picked up already.",
        effects: { pit: 4, computing: { sales: 0.2 }, record: "computingPress" } }
    ]
  },

  /* ---------- The programmer (D5) ---------- */

  {
    id: "programmer-fair", kind: "incident", title: "A computer fair", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "{resident.name}, whose game is selling better than anything the house has ever made, has asked whether she might go up to London for the computer fair at Olympia. She asked very casually. She has been reading the computing papers in bed, and has begun to use words at supper that nobody else understands.",
    choices: [
      { label: "Let her go",
        result: "{resident.first} went up to Olympia for the day in her best tweed and came back late, with a carrier bag of magazines and a look the house has not seen on her before. She talked all through supper about something called a disk drive.",
        effects: { resident: { racination: -5 }, pit: 3, followUp: { id: "programmer-offer", weeks: 6 } } },
      { label: "Refuse, kindly",
        result: "{mistress.name} said that the house could not spare her, which was true, and that London would keep, which was also true. {resident.first} accepted it, and has been very quiet in the Computing Room since.",
        effects: { resident: { doubt: 6 } } },
      { label: "Send someone with her", rhetoric: "belief", needs: { housekeeper: true },
        result: "The Housekeeper went to Olympia with her, in a hat, and stood in the middle of the exhibition hall like a lighthouse. {resident.first} came home with three magazines instead of thirty, and a great deal to say about the Housekeeper.",
        effects: { resident: { racination: -2 }, pit: 2 } }
    ]
  },

  {
    id: "programmer-offer", kind: "letter", title: "An offer from Slough", followUpOnly: true, every: 0,
    from: "a software house on a trading estate in Slough",
    when: { resident: {} },
    text: "A software house in Slough has written to {resident.name}, care of the house, offering her a position as a programmer: eleven thousand a year, a company car, and a desk by the window. {resident.first} brought the letter to the Study herself and put it on the desk and did not let go of it.",
    choices: [
      { label: "Tell her the choice is hers",
        outcomes: [
          { chance: 0.5, result: "{resident.first} sat in the Chapel for an hour, and came out, and tore up the letter on the steps. ‘I came here for a reason,’ she said. She went back to the Computing Room and wrote a waltz for the next game.",
            effects: { resident: { racination: 8, devotion: 5 } } },
          { chance: 0.5, result: "{resident.first} sat in the Chapel for an hour, and came out, and went upstairs to pack. She left on Saturday, in a hired car, and cried at the gate. She has promised to write. The Computing Room is very quiet.",
            effects: { depart: "left" } }
        ] },
      { label: "Remind her what she came here for", rhetoric: "belief", needs: { authority: 3 },
        outcomes: [
          { chance: 0.65, result: "{mistress.name} reminded her, quietly and at length. {resident.first} wept, and stayed, and has not mentioned Slough since.",
            effects: { authority: -3, resident: { doubt: 3, devotion: 3 } } },
          { chance: 0.35, result: "{mistress.name} reminded her, at length. {resident.first} heard her out, thanked her, and left on Saturday all the same.",
            effects: { authority: -3, depart: "left" } }
        ] },
      { label: "Keep the letter from her",
        result: "{mistress.name} said she would think about it, and put the letter in her bureau. {resident.first} has not asked about it again. The house has kept a woman's letter from her, and has recorded that it did so.",
        effects: { resident: { doubt: 5 }, record: "withheldLetters" } }
    ]
  }
];
