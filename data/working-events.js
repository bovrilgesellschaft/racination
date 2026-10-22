/*
  RACINATION — data/working-events.js
  ---------------------------------------------------------------
  Milestone 8: events of the Working. Discovery, the Mistress's
  stance, the Mirror and Polar readings, Workings kept in secret,
  being seen on the downs, a Chamber too heavily charged, and the
  sinister current.

  The format is the one in WRITING-EVENTS.md, with these extras:

    when: { working: { discovered: false } }      before the Working is found
    when: { working: { discovered: true } }       after
    when: { working: { stance: "forbid" } }       under that stance
    when: { working: { chargeAbove: 80 } }        the Chamber's Charge
    when: { working: { sinisterAtLeast: 1 } }     how far the house has followed the sinister current
    when: { working: { reading: "undecided" } }   the house's reading

    effects: { working: { discover: true, stance: "embrace" } }
    effects: { working: { reading: "polar" } }    or "mirror", or "undecided"
    effects: { working: { sinister: 1 } }         one step further along the sinister current
    effects: { working: { charge: -20 } }         the Chamber's Charge
    effects: { working: { restChamber: 13 } }     the Chamber is shut for that many weeks

  The sinister current is never described as a practice. It is
  unsettling, and it cannot be performed.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.workingEvents = [

  /* ---------- Discovery ---------- */

  {
    id: "working-notebook", kind: "incident", title: "A notebook in the Library", once: true,
    when: { working: { discovered: false }, after: "1983-02-14", resident: { skill: { letters: 2 } }, chance: 0.12 },
    text: "{resident.name}, cataloguing the Library, found a notebook pushed behind the Ruskin: green morocco, the first half written in a small upright hand, the second half blank. It is about something its writer calls the Working. It speaks of seven Ladies, of the hour at which each rises and sets, of two women and what they may do together with a purpose held between them, and of a locked room upstairs that {resident.first} has always supposed was a box room. She brought it to the Study with the expression of a woman carrying a lit candle through a draught.",
    choices: [
      { label: "Embrace it: the Working shall be the house's own", rhetoric: "belief",
        result: "{mistress.name} read the notebook through that night, and in the morning had the locked room opened and aired. The Working is the house's own now. Some of the household are radiant. Some are watching the Mistress very carefully.",
        effects: { working: { discover: true, stance: "embrace" } } },
      { label: "Tolerate it: those who wish may keep it",
        result: "{mistress.name} said that the house compels no one's belief, and permits a good deal. The locked room has been opened. Those who wish may keep the Working; the Mistress will not.",
        effects: { working: { discover: true, stance: "tolerate" } } },
      { label: "Forbid it", rhetoric: "play",
        result: "{mistress.name} put the notebook in her bureau and turned the key, and said that the house had quite enough to be getting on with. {resident.first} said nothing. The locked room is still locked. The house, being a house, has begun to wonder what is in it.",
        effects: { working: { discover: true, stance: "forbid" } } }
    ]
  },

  {
    id: "working-told", kind: "incident", title: "A night away on the downs", once: true,
    when: { working: { discovered: false }, after: "1983-04-01", resident: { devotionAbove: 65 }, chance: 0.12 },
    text: "{resident.name} came to the Study after a night away, with chalk on her shoes and a look about her that the Mistress had not seen before. She asked whether she might speak frankly. She spoke frankly for an hour: about the senior women of the house before this one, and a thing they kept that they called the Working, and the White Horse on the down at the exact minute a certain Lady rose over it. She did not ask permission for anything. She seemed to think the Mistress ought to know.",
    choices: [
      { label: "Embrace it: the Working shall be the house's own", rhetoric: "belief",
        result: "{mistress.name} asked to see the old notebook, and was shown where it was kept. By Sunday the locked room upstairs had been opened and aired. The Working is the house's own now.",
        effects: { working: { discover: true, stance: "embrace" }, resident: { devotion: 3 } } },
      { label: "Tolerate it: those who wish may keep it",
        result: "{mistress.name} thanked her for her frankness, and said that the house compels no one's belief. Those who wish may keep the Working. The Mistress will not.",
        effects: { working: { discover: true, stance: "tolerate" } } },
      { label: "Forbid it", rhetoric: "play",
        result: "{mistress.name} said, kindly and finally, that there would be no more nights on the downs. {resident.first} went away very quiet. The house has a secret now, and knows that it has.",
        effects: { working: { discover: true, stance: "forbid" }, resident: { doubt: 4 } } }
    ]
  },

  /* ---------- The readings: Mirror or Polar ---------- */

  {
    id: "reading-debate", kind: "incident", title: "Mirrors or poles", once: true,
    when: { working: { discovered: true, reading: "undecided" }, resident: {}, chance: 0.3 },
    text: "At supper {resident.name} said, rather loudly, that the old notebook was quite clear: two women at the Working are two mirrors facing each other, and like multiplies like. A brunette across the table said that was nonsense, and that the whole of the house's teaching is that power comes from complement, blonde and brunette, as the Ladies intended. The soup went cold. Everyone looked at the Mistress.",
    choices: [
      { label: "Rule for the Polar reading", rhetoric: "belief",
        result: "{mistress.name} ruled for the Polar reading: complement, blonde and brunette. Half the table was satisfied. {resident.first} was not.",
        effects: { working: { reading: "polar" }, resident: { doubt: 3 } } },
      { label: "Rule for the Mirror reading", rhetoric: "belief",
        result: "{mistress.name} ruled for the Mirror reading: like multiplies like. {resident.first} glowed. The brunette across the table did not.",
        effects: { working: { reading: "mirror" }, household: { doubt: 0.5 } } },
      { label: "Rule that the Ladies have not said", rhetoric: "play",
        result: "{mistress.name} said that the Ladies had not seen fit to say, and that she would not say for them. Neither side was satisfied, which is the usual price of peace.",
        effects: { working: { reading: "open" } } }
    ]
  },

  {
    id: "reading-murmur", kind: "incident", title: "The other reading", every: 52,
    when: { working: { discovered: true, readingDecided: true }, resident: {}, chance: 0.15 },
    text: "{resident.name} has been heard on the back stairs maintaining the reading the house did not choose, and has found a following. Two of the household now sit at one end of the table on Fridays and talk about mirrors, or poles, in lowered voices.",
    choices: [
      { label: "Hold to the house's reading", rhetoric: "belief", needs: { authority: 2 },
        result: "{mistress.name} restated the house's reading at Matins, firmly. The back stairs went quiet. Quiet is not the same as agreed.",
        effects: { authority: -2, resident: { doubt: 3 } } },
      { label: "Allow private opinions", rhetoric: "play",
        result: "{mistress.name} said that a woman may think what she likes on the back stairs. The faction, deprived of opposition, lost interest within the week.",
        effects: { resident: { doubt: -2 }, conviction: -1 } }
    ]
  },

  /* ---------- Under Forbid: a Working kept in secret ---------- */

  {
    id: "working-secret", kind: "incident", title: "A Working kept in secret", followUpOnly: true, every: 0,
    when: { resident: {}, other: {} },
    text: "{resident.name} and {other.name} were seen coming back across the fields at four in the morning, with chalk on their hems and their hair down. The Mistress has forbidden the Working. They kept it anyway.",
    choices: [
      { label: "Say nothing, and let it pass",
        result: "{mistress.name} said nothing. The house noticed that she said nothing, and drew its own conclusions about what a prohibition in this house is worth.",
        effects: { authority: -3, mistressDoubt: 2 } },
      { label: "Reprimand them", needs: { authority: 3 },
        result: "{mistress.name} reprimanded them in the Study, separately. They took it in silence. Neither of them is sorry, and both are careful now.",
        effects: { authority: -3, resident: { doubt: 4 }, other: { doubt: 4 } } },
      { label: "Lift the ban: they may keep it openly", rhetoric: "belief",
        result: "{mistress.name} said that if it was to be kept at all it had better be kept honestly, and lifted the ban. Those who wish may keep the Working now.",
        effects: { working: { stance: "tolerate" }, resident: { devotion: 3 }, other: { devotion: 3 } } }
    ]
  },

  /* ---------- Seen on the downs ---------- */

  {
    id: "working-seen-ramblers", kind: "incident", title: "Ramblers", followUpOnly: true, every: 0,
    when: {},
    text: "A party of ramblers from Swindon, crossing the down after dark with torches for reasons of their own, came upon two women of the house at the Working. There was a good deal of screaming, most of it from the ramblers. The story was in the pub at Uffington by closing time.",
    choices: [
      { label: "Brazen it out", rhetoric: "belief",
        result: "The house said nothing, and went to church on Sunday as usual, in its best. The village is talking.",
        effects: { pit: 3, reputation: -2, working: { exposed: 1 } } },
      { label: "Let it be put about that it was a midsummer picnic", rhetoric: "play",
        result: "It was put about that it was a picnic. Nobody believes it was a picnic, but it gives them something else to argue about.",
        effects: { pit: 2, reputation: -1, working: { exposed: 1 } } }
    ]
  },

  {
    id: "working-seen-farmer", kind: "incident", title: "The farmer", followUpOnly: true, every: 0,
    when: {},
    text: "A farmer out after a sick ewe saw candles where no candles should be, and two women of the house in their best, and a good deal more than that. He has told his wife. His wife does the flowers at St Michael's.",
    choices: [
      { label: "Send him a bottle of something good, and say nothing", needs: { money: 6 },
        result: "A bottle of the good port went down the lane with the Housekeeper. The farmer accepted it, and has not stopped talking, but now he talks more kindly.",
        effects: { money: -6, pit: 2, working: { exposed: 1 } } },
      { label: "Ignore it",
        result: "The house ignored it. The flower rota at St Michael's did not.",
        effects: { pit: 3, reputation: -2, working: { exposed: 1 } } }
    ]
  },

  {
    id: "working-seen-constable", kind: "visitor", title: "A constable on a bicycle", followUpOnly: true, every: 0,
    when: {},
    text: "The village constable called, with his helmet under his arm and his bicycle clips still on, to say that there had been a report of lights and unusual conduct at an ancient monument on Friday night, and did the house know anything about it, and he was sure it didn't, but he had to ask.",
    choices: [
      { label: "Give him tea, and know nothing", rhetoric: "play",
        result: "The constable had tea and two slices of the seed cake, and went away satisfied that the house knew nothing. He has written it down, all the same.",
        effects: { pit: 2, working: { exposed: 1 } } },
      { label: "Tell him it is a matter of private devotion", rhetoric: "belief",
        result: "{mistress.name} told him, with great dignity, that it was a matter of private devotion. He wrote that down too, and underlined it.",
        effects: { pit: 3, authority: 1, working: { exposed: 1 } } }
    ]
  },

  /* ---------- The Chamber, too heavily charged ---------- */

  {
    id: "chamber-heavy", kind: "incident", title: "The Chamber", every: 26,
    when: { working: { chargeAbove: 85 } },
    text: "Nobody will go into the Chamber alone now. The Housekeeper, who fears nothing, went in to see to the curtains and came out again at once, and sat on the landing for a quarter of an hour. Things are happening in the house that the house would rather not speak of at breakfast.",
    choices: [
      { label: "Shut the Chamber for a season",
        result: "The Chamber has been locked for a season, and the key hung on the Mistress's own chain. Whatever is in it is left to settle.",
        effects: { working: { restChamber: 13 }, household: { doubt: -1 } } },
      { label: "Open the windows and let it out", rhetoric: "play",
        result: "Every window in the Chamber was opened on a cold blowy morning and left open all day. The curtains streamed. Something went out with the draught, or nobody could prove otherwise.",
        effects: { working: { charge: -25 }, household: { doubt: -0.5 } } },
      { label: "Leave it as it is", rhetoric: "belief",
        result: "{mistress.name} said that the Chamber was doing what Chambers do. The house is the more uneasy, and the more devout.",
        effects: { household: { doubt: 1, devotion: 1 } } }
    ]
  },

  /* ---------- The sinister current ---------- */

  {
    id: "sinister-letter", kind: "letter", title: "A letter signed with a glyph", once: true,
    from: "a correspondent who signs herself only with the sign of the Lady of the Keys",
    when: { working: { discovered: true }, beliefAbove: 10, chance: 0.15 },
    text: "The letter is written in violet ink on very good paper, with no address. Its writer knows a great deal about the house, and about the Working, and says that what the house keeps is the Working as a nursery tale is to the truth. There are, she says, stricter rites: ones that the old notebook was too timid to write down. She would be glad to correspond.",
    choices: [
      { label: "Reply", rhetoric: "belief",
        result: "{mistress.name} replied, briefly and guardedly. The letter went into the post in the village, and the Mistress stood at the box for some time afterwards with her hand on it.",
        effects: { working: { sinister: 1 }, followUp: { id: "sinister-notebook", weeks: 4 } } },
      { label: "Burn it",
        result: "The letter went on the Study fire. It burned with a violet flame, which was the ink, and nothing more.",
        effects: { conviction: 1 } },
      { label: "Read it aloud at supper, and laugh", rhetoric: "play",
        result: "{mistress.name} read it aloud at supper in her best melodramatic voice, and the table laughed until it cried. It was the right thing to do. It did not feel entirely like it.",
        effects: { household: { doubt: -0.5 } } }
    ]
  },

  {
    id: "sinister-notebook", kind: "letter", title: "A heterodox notebook", followUpOnly: true, every: 0,
    from: "the same correspondent, by parcel post",
    when: {},
    text: "A parcel came: a notebook in black cloth, much handled. It is the other half of the Working, its sender says; the half the old women would not write. The Mistress opened it at random. It is about rites in which one woman is not joined but spent, used up for another's purpose; about exhaustion as a door; about a partner who need not know. It is written beautifully. The house's own green notebook has a word for every page of it, and the word is heresy.",
    choices: [
      { label: "Read it, privately", rhetoric: "belief",
        result: "{mistress.name} read it through in the Study with the door locked. She came down to supper late and very pale, and did not eat. Something in the house has turned a little, the way milk turns.",
        effects: { working: { sinister: 1 }, belief: 8, conviction: 3, mistressDoubt: 3, followUp: { id: "sinister-visit", weeks: 6 } } },
      { label: "Send it back unread",
        result: "The parcel went back to the sorting office, wrapped in brown paper and tied with the Housekeeper's best knots, marked ‘Not known at this address’.",
        effects: { conviction: 2 } },
      { label: "Burn it",
        result: "It took a long time to burn. Cloth bindings do.",
        effects: { conviction: 1, working: { sinister: -1 } } }
    ]
  },

  {
    id: "sinister-visit", kind: "letter", title: "She proposes a visit", followUpOnly: true, every: 0,
    from: "the correspondent, once more",
    when: { working: { sinisterAtLeast: 2 } },
    text: "She would like to come. She would bring friends, women who have gone further than the house has dared, and others who admire what the house stands against and would like to say so with money. She writes of the house's ‘courage against the modern world’ in a way that makes the Housekeeper, reading over the Mistress's shoulder, put the letter down and go and wash her hands.",
    choices: [
      { label: "Receive her", rhetoric: "belief",
        result: "{mistress.name} wrote that she would receive her. When the reply was read out at Matins, half the household looked at the floor, and the Housekeeper looked at nobody at all.",
        effects: { working: { sinister: 1 }, belief: 10, household: { doubt: 4 }, record: "politicalCourtship", followUp: { id: "sinister-schism", weeks: 8 } } },
      { label: "Refuse her, and break off the correspondence",
        result: "{mistress.name} wrote that the house was not at home, and would not be. The letters stopped. The black notebook's absence is felt in the Study like a draught from a door shut just in time.",
        effects: { conviction: 3, working: { sinister: -2 } } }
    ]
  },

  {
    id: "sinister-schism", kind: "incident", title: "The house divides", followUpOnly: true, every: 0,
    when: { working: { sinisterAtLeast: 3 } },
    text: "The visitors came, and went, and left a smell behind them that the Chamber has not lost. Now half the household has gathered in the Morning Room, with the Housekeeper at their head and their coats on, and asked to speak to the Mistress. They say the house has become something they did not come to it for.",
    choices: [
      { label: "Let them go",
        result: "They went. Half the household walked down the drive in the rain, with the Housekeeper first, to a farmhouse near Burford where the faith is kept the old way, and the green notebook with it.",
        effects: { end: "schism" } },
      { label: "Burn the black notebook in front of them, and ask them to stay", needs: { authority: 10 },
        outcomes: [
          { chance: 0.5, result: "{mistress.name} burned it in the Morning Room grate in front of them, page by page. It was enough, just. They took their coats off. Nobody will forget it.",
            effects: { authority: -10, working: { sinister: -3 }, household: { doubt: 3 }, belief: -10 } },
          { chance: 0.5, result: "{mistress.name} burned it in front of them, page by page. It was not enough. They went all the same, with the Housekeeper first, down the drive in the rain.",
            effects: { end: "schism" } }
        ] }
    ]
  }
];
