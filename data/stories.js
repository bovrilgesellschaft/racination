/*
  RACINATION — data/stories.js
  ---------------------------------------------------------------
  The household's stories (Milestone 5b): recruits and new
  arrivals, the Mistress's crisis, the Housekeeper's succession
  crisis, residents asking to leave, secrets coming out, and the
  Mistress's contacts.

  The format is the same as data/events.js; WRITING-EVENTS.md
  explains it. A few extra conditions and effects appear here:

    when: { residentsBelow: 14 }          room in the house
    when: { mistressInCrisis: true }      her Doubt has outrun her Conviction for a season
    when: { housekeeperRebels: true }     the Housekeeper's Doubt outweighs the Mistress's Authority
    when: { resident: { secret: "radio" } }   a resident with that secret, not yet out
    when: { guest: true }                 picks one of this week's paying guests ({guest.name})
    when: { contact: true }               picks one of the Mistress's contacts ({contact})
    onlyIfStillTrue: true                 a follow-up is dropped if its "when" no longer holds

    effects: { arrival: { weeks: 3, background: "wife" } }   a new resident arrives
    effects: { depart: "left" }           the resident leaves the house
    effects: { revealSecret: true }       her secret is out (it will not come up again)
    effects: { restDuty: true }           her duty is set to Rest
    effects: { dismissHousekeeper: true } the post falls vacant
    effects: { end: "abdication" }        the run ends after this week (or "schism")
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.stories = [

  /* ================= Recruits and arrivals ================= */

  {
    id: "recruit-wife", kind: "letter", title: "A woman who wants to come",
    from: "A woman in Swindon, who signs only with her initials",
    when: { residentsBelow: 14, chance: 0.5 }, every: 20,
    text: "She has read the house's advertisement eleven times, she writes, and kept it in her handbag under the Child Benefit book. She has a husband, a semi-detached house and a hostess trolley, and she would give all three to wear a proper frock and be spoken to as if she were a woman. Can she come? She can bring her own sewing machine.",
    choices: [
      { label: "Write and tell her to come", rhetoric: "belief",
        result: "{mistress.name} wrote by return: come, and bring the sewing machine. She will arrive in three weeks, when she has found the courage and the train times.",
        effects: { arrival: { weeks: 3, background: "wife" } } },
      { label: "Invite her for a week of terms first",
        result: "She has been invited for a week of terms, to see if the house suits her and she suits the house. She has written back that she has already bought a hat.",
        effects: { reputation: 1, followUp: { id: "recruit-after-terms", weeks: 5 } } },
      { label: "Write back kindly, but say no",
        result: "A kind letter went to Swindon saying that the house could not take her yet. She will keep it, very likely, under the Child Benefit book.",
        effects: {} }
    ]
  },

  {
    id: "recruit-nurse", kind: "letter", title: "A nurse writes",
    from: "Staff Nurse, a general hospital in the Midlands",
    when: { residentsBelow: 14, chance: 0.4 }, every: 26,
    text: "She has done nights for nine years, she writes, under strip lights, and has begun to dream in fluorescent. A patient's daughter left one of the house's magazines on a locker. She has read it on her breaks for a month and would like to know whether the house has any use for a woman who can lay out a ward, take a temperature and keep her head.",
    choices: [
      { label: "Tell her there is every use for her", rhetoric: "belief",
        result: "She has been told to come. She will work out her notice and arrive in a month, with a fob watch and a strong opinion about hospital corners.",
        effects: { arrival: { weeks: 4, background: "nurse" } } },
      { label: "Say no, with thanks",
        result: "She has been thanked and refused. The house hopes she will find her way out of the fluorescent by another road.",
        effects: {} }
    ]
  },

  {
    id: "recruit-punk", kind: "letter", title: "A letter in felt-tip",
    from: "A flat above a launderette in Camden",
    when: { residentsBelow: 14, chance: 0.35 }, every: 26,
    text: "The letter is written in black felt-tip on the back of a gig flyer. She has been to every sort of rebellion London has to offer, she writes, and has found them all the same rebellion in different trousers. She wants to try the one rebellion nobody in Camden would understand: a tea frock. She is, she warns, very bad at getting up in the morning.",
    choices: [
      { label: "Tell her the bell rings at six, and to come", rhetoric: "belief",
        result: "She has been told about the bell, and has written back: ‘Fine.’ She arrives in three weeks with a rucksack and, it is to be feared, her hair.",
        effects: { arrival: { weeks: 3, background: "punk" } } },
      { label: "Tell her to come and see first, as a guest", rhetoric: "play",
        result: "She has been invited for a week of terms. She has asked whether she can bring her own records, and been told she cannot.",
        effects: { followUp: { id: "recruit-after-terms", weeks: 5 } } },
      { label: "Decline", result: "The flyer has gone into the box marked Cranks, a little unjustly.", effects: {} }
    ]
  },

  {
    id: "recruit-oxford", kind: "letter", title: "A letter from a college",
    from: "A graduate student, an Oxford college",
    when: { residentsBelow: 14, chance: 0.35 }, every: 26,
    text: "She is writing a thesis on the domestic novel between the wars and has, she admits, stopped being able to tell the difference between her subject and her life. She has heard of the house from a friend of a friend at Lady Margaret Hall. She would like to come for good, and to stop pretending that the thesis is the point.",
    choices: [
      { label: "Tell her to come, and to bring the thesis", rhetoric: "play",
        result: "She will come at the end of term, with the thesis in a box she has promised never to open again. The house has its doubts about the promise.",
        effects: { arrival: { weeks: 6, background: "oxford" } } },
      { label: "Tell her to finish the thesis first",
        result: "{mistress.name} wrote that a woman should finish what she begins. The student has written back that she will, and then come. The house will believe it when it sees her.",
        effects: { followUp: { id: "recruit-after-terms", weeks: 26 } } }
    ]
  },

  {
    id: "recruit-after-terms", kind: "letter", title: "She would like to stay", followUpOnly: true, every: 0,
    from: "A former guest of the house",
    when: { residentsBelow: 14 },
    text: "The woman who came for a week of terms has written again. She has been back in the twentieth century for a month and finds she cannot bear it: the radio at work, the man on the bus, her own reflection in the shop windows in her jeans. She would like to come back, and this time not to leave.",
    choices: [
      { label: "Yes, come home", rhetoric: "belief",
        result: "She has been told to come home. She arrives in a fortnight.",
        effects: { arrival: { weeks: 2 } } },
      { label: "Not yet",
        result: "She has been told, gently, not yet. She has written back that she understands, which she does not.",
        effects: {} }
    ]
  },

  /* ================= The Mistress's crisis ================= */

  {
    id: "crisis-library", kind: "incident", title: "A light in the Library",
    when: { mistressInCrisis: true }, weight: 4, every: 6,
    text: "The Housekeeper, going down at three in the morning for a drink of water, found {mistress.name} in the Library with the lamp lit, a book open at the same page it was open at on Tuesday, and an expression the house has never seen on her before. She said she was reading. She was not reading.",
    choices: [
      { label: "Confide in the Housekeeper", needs: { housekeeper: true },
        result: "{mistress.name} talked to {housekeeper.name} until the bell went for Matins, about nothing and everything. She came down to breakfast looking ten years older and somehow better.",
        effects: { mistressDoubt: -8, authority: -3, housekeeper: { devotion: 3 } } },
      { label: "Go into retreat in the Chapel for three days", rhetoric: "belief",
        result: "{mistress.name} spent three days in the Chapel, and the house ran itself, a little anxiously. She came out quieter, and surer, and very hungry.",
        effects: { conviction: 6, mistressDoubt: -4, authority: -2, household: { devotion: 1 } } },
      { label: "Write to an old friend",
        result: "{mistress.name} wrote a long letter to someone who knew her before the house, and posted it herself in the village, which she never does.",
        effects: { followUp: { id: "crisis-friend-replies", weeks: 2 } } },
      { label: "Say nothing, and carry on",
        result: "Nothing was said. The lamp in the Library was lit again on Thursday night.",
        effects: { mistressDoubt: 3, followUp: { id: "crisis-abdication", weeks: 6 } } }
    ]
  },

  {
    id: "crisis-friend-replies", kind: "letter", title: "An answer from an old friend", followUpOnly: true, every: 0,
    from: "An old friend of {mistress.name}'s",
    when: {},
    text: "The friend has written back, four pages in a hand {mistress.name} has known since she was twenty. It does not tell her she is right, or wrong. It tells her she has always been like this before she does something brave.",
    choices: [
      { label: "Read it twice and put it in the Study drawer",
        outcomes: [
          { chance: 0.7, result: "She read it twice and kept it. Something has steadied.", effects: { mistressDoubt: -10, conviction: 4 } },
          { chance: 0.3, result: "She read it twice. It helped less than she had hoped.", effects: { mistressDoubt: -3 } }
        ] }
    ]
  },

  {
    id: "crisis-abdication", kind: "incident", title: "A letter on the Study desk", followUpOnly: true, every: 0, onlyIfStillTrue: true,
    when: { mistressInCrisis: true },
    text: "The Housekeeper, dusting the Study, has found a letter on the desk in {mistress.name}'s hand, addressed to the household and not yet sealed. It hands the keys of the house to whoever the household chooses, and asks to be forgiven. It is dated tomorrow.",
    choices: [
      { label: "Seal it and give it to the household",
        result: "The letter was read out at Matins. {mistress.name} has laid down the keys of {house}.",
        effects: { end: "abdication" } },
      { label: "Tear it up and take the house in hand again", rhetoric: "belief", needs: { authority: 5 },
        result: "{mistress.name} tore up the letter, rang the bell herself for Matins and read the lesson in a voice the household had not heard for months. The house is hers again, and she knows it.",
        effects: { authority: -5, conviction: 12, mistressDoubt: -12, household: { devotion: 2 } } },
      { label: "Leave it on the desk and tell no one",
        result: "The letter stays on the desk. Nobody else has seen it. Nobody has moved it.",
        effects: { mistressDoubt: 4, followUp: { id: "crisis-abdication", weeks: 4 } } }
    ]
  },

  /* ================= The succession crisis ================= */

  {
    id: "succession-challenge", kind: "incident", title: "The Housekeeper speaks her mind",
    when: { housekeeperRebels: true, housekeeper: true }, weight: 4, every: 8,
    text: "After Matins, in front of the whole household, {housekeeper.name} said that the house was being run badly, that the rules were made on a whim and enforced on a different whim, and that if things went on as they were she could not answer for what the household would do. Then she went to the kitchen and made the porridge as if nothing had been said.",
    choices: [
      { label: "Concede some ground, in private", rhetoric: "play", needs: { authority: 3 },
        result: "{mistress.name} saw {housekeeper.first} in the Study and gave way on two points and held firm on a third. {housekeeper.first} came out mollified, for now.",
        effects: { authority: -3, housekeeper: { doubt: -15, devotion: 2 } } },
      { label: "Dismiss her as Housekeeper", needs: { authority: 6 },
        result: "{housekeeper.name} was relieved of the keys at Evensong. She handed them over without a word. The household watched her do it and said nothing either, which was worse.",
        effects: { authority: -6, housekeeper: { doubt: 10 }, household: { doubt: 2 }, dismissHousekeeper: true } },
      { label: "Ask her to walk in the garden and talk it through", rhetoric: "belief",
        outcomes: [
          { chance: 0.5, result: "They walked round the kitchen garden four times. At the end of it {housekeeper.first} said she had spoken out of turn, and {mistress.name} said she had not. They came in arm in arm.",
            effects: { housekeeper: { doubt: -20, devotion: 5 } } },
          { chance: 0.5, result: "They walked round the kitchen garden four times and came in by different doors.",
            effects: { followUp: { id: "succession-schism", weeks: 4 } } }
        ] },
      { label: "Pretend it was not said",
        result: "It was not referred to again. The household noticed that it was not referred to again.",
        effects: { authority: -2, followUp: { id: "succession-schism", weeks: 5 } } }
    ]
  },

  {
    id: "succession-schism", kind: "incident", title: "A house divided", followUpOnly: true, every: 0, onlyIfStillTrue: true,
    when: { housekeeperRebels: true, housekeeper: true },
    text: "{housekeeper.name} has told {mistress.name} that she is leaving to start a house of her own, run as a house should be run, and that half the household is coming with her. She has found a farmhouse near Burford. She has, it seems, been planning it for some time.",
    choices: [
      { label: "Let her go, and those who follow her",
        result: "They went on a Saturday, in a hired van, with half the bendies and most of the good china. {house} will not recover from it.",
        effects: { end: "schism" } },
      { label: "Make peace at any price", rhetoric: "play", needs: { authority: 8 },
        result: "{mistress.name} gave {housekeeper.first} almost everything she asked for. The house is whole, and the Mistress is a little less the Mistress.",
        effects: { authority: -8, housekeeper: { doubt: -30 }, conviction: -4 } },
      { label: "Stand firm, and call her bluff", needs: { authority: 12 },
        outcomes: [
          { chance: 0.5, result: "{housekeeper.first} looked at {mistress.name} for a long moment and put the farmhouse particulars on the fire. She has not mentioned Burford since.",
            effects: { authority: -4, housekeeper: { doubt: -20 }, conviction: 4 } },
          { chance: 0.5, result: "It was not a bluff.", effects: { end: "schism" } }
        ] }
    ]
  },

  /* ================= Asking to leave ================= */

  {
    id: "wants-to-leave", kind: "incident", title: "She asks to leave", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "{resident.name} came to the Study after Evensong and asked, standing up, whether she might leave the house. She has been unhappy for weeks, she says, and does not believe any more that it is the Pit's fault rather than the house's. She has the bus fare. She would like the Mistress's blessing, but she is going either way, she thinks.",
    choices: [
      { label: "Let her go, with the house's blessing",
        result: "{resident.name} left on Saturday morning with her suitcase and the house's blessing. The household lined the drive. It was a sad business, and a clean one.",
        effects: { depart: "left", conviction: -1, household: { devotion: 0.5 } } },
      { label: "Ask her to stay, and say why", needs: { authority: 4 },
        outcomes: [
          { chance: 0.5, result: "{mistress.name} talked to her for an hour, honestly, about what the house is for and what it is not. {resident.first} unpacked her suitcase that night.",
            effects: { authority: -4, resident: { doubt: -25, devotion: 3 } } },
          { chance: 0.5, result: "{mistress.name} talked to her for an hour. {resident.first} listened, thanked her, and left on Saturday all the same.",
            effects: { authority: -4, depart: "left" } }
        ] },
      { label: "Offer her a season's rest from her duties",
        result: "{resident.first} has been given a season off the rota, to sleep and read and walk on the downs and decide. She cried, and said she would stay to see.",
        effects: { restDuty: true, resident: { doubt: -15 } } },
      { label: "Refuse to let her go",
        result: "{mistress.name} told her she could not go. {resident.first} went back to her room and did not come down to supper. The house has kept a woman who wished to leave, and has recorded that it did so.",
        effects: { resident: { doubt: 5, racination: -3 }, conviction: -3, record: "preventedLeaving" } }
    ]
  },

  /* ================= Secrets ================= */

  {
    id: "secret-radio", kind: "incident", title: "A sound from a trunk",
    when: { resident: { secret: "radio" }, chance: 0.25 },
    text: "The Housekeeper, airing {resident.name}'s room, heard a faint voice reading the shipping forecast from the bottom of her trunk. Under a petticoat, wrapped like a baby, was a transistor radio, switched on.",
    choices: [
      { label: "Take it away, kindly",
        result: "{mistress.name} took the radio and kept it in the Study drawer. {resident.first} wept a little, then said it was a relief.",
        effects: { revealSecret: true, resident: { doubt: 2, racination: 2 }, pit: -1 } },
      { label: "Let her keep it, for the shipping forecast only", rhetoric: "play",
        result: "{resident.first} may keep it, for the shipping forecast only. She has explained that it is the most 1930s thing on the wireless, and the house, after consideration, agrees.",
        effects: { revealSecret: true, resident: { doubt: -2 }, pit: 1 } },
      { label: "Break it in front of her", rhetoric: "belief",
        result: "The radio was broken on the scullery step with the coal hammer, in front of her. It was her property. The house has recorded what it did.",
        effects: { revealSecret: true, resident: { doubt: 6, devotion: -2 }, pit: -2, record: "propertyDestroyed" } }
    ]
  },

  {
    id: "secret-age", kind: "incident", title: "A birthday",
    when: { resident: { secret: "age" }, chance: 0.2 },
    text: "A birthday card has come for {resident.name} from an aunt, with a large number on the front in glitter. It is seven more than the number {resident.first} gave the house when she came.",
    choices: [
      { label: "Give her the card and say nothing", rhetoric: "play",
        result: "The card was handed over without comment. {resident.first} went pink to the ears, and later laughed, and the household gave her a cake with no candles at all.",
        effects: { revealSecret: true, resident: { racination: 2 } } },
      { label: "Ask her, gently, why she lied",
        result: "She said she thought the house wanted young women. {mistress.name} told her the house wanted women, and that the Goddess does not count.",
        effects: { revealSecret: true, resident: { doubt: -2, devotion: 2 } } }
    ]
  },

  {
    id: "secret-novel", kind: "incident", title: "A manuscript in a drawer",
    when: { resident: { secret: "novel" }, chance: 0.2 },
    text: "A drawer in the Library that does not belong to anyone was found to hold three hundred pages of a novel in {resident.name}'s handwriting. The novel is about a house very like this one, and its Mistress is a woman very like {mistress.name}, and it is not kind to either.",
    choices: [
      { label: "Ask her to read some of it aloud", rhetoric: "play",
        outcomes: [
          { chance: 0.6, result: "{resident.first} read a chapter in the Drawing Room, scarlet, to a silent household. Then someone laughed, and then everyone did, and {mistress.name} loudest of all. It is a very funny book.",
            effects: { revealSecret: true, resident: { doubt: -4, racination: 2 }, household: { racination: 1 } } },
          { chance: 0.4, result: "{resident.first} read a chapter and nobody laughed. It is a very sad book, and it is true.",
            effects: { revealSecret: true, resident: { doubt: 2 }, household: { doubt: 2 }, mistressDoubt: 3 } }
        ] },
      { label: "Put it back and say nothing",
        result: "The manuscript went back in the drawer. {mistress.name} has been seen reading it on her own at night.",
        effects: { revealSecret: true, mistressDoubt: 2 } },
      { label: "Burn it",
        result: "The manuscript went on the range. {resident.first} found the drawer empty on Friday and did not ask. The house has recorded what it did.",
        effects: { revealSecret: true, resident: { doubt: 8 }, record: "propertyDestroyed", conviction: -2 } }
    ]
  },

  {
    id: "secret-husband", kind: "incident", title: "A postal order stub",
    when: { resident: { secret: "husband" }, chance: 0.25 },
    text: "A postal order stub has fallen out of {resident.name}'s prayer book: eight pounds, sent to a man in Swindon. She has been sending money to her husband every month since she came, out of her own small purse. He does not know where she is.",
    choices: [
      { label: "Help her decide what she owes him",
        result: "{mistress.name} and {resident.first} sat down with the stubs and a pot of tea. She has decided to send one last order, with a letter, and to stop.",
        effects: { revealSecret: true, removeTie: "ex", resident: { doubt: -3, racination: 3 } } },
      { label: "Leave it to her conscience", rhetoric: "play",
        result: "The stub was put back in the prayer book. What she sends to Swindon is between her and Swindon.",
        effects: { revealSecret: true } }
    ]
  },

  {
    id: "secret-falsename", kind: "incident", title: "Old letters",
    when: { resident: { secret: "falsename" }, chance: 0.2 },
    text: "Going through the correspondence files, the Housekeeper has found a year of letters from a ‘Miss Prudence Hart’, full of questions about the house, and the handwriting is {resident.name}'s. She wrote to the house under a false name for a year before she dared to come.",
    choices: [
      { label: "Show her the letters and tell her they were treasured", rhetoric: "belief",
        result: "{resident.first} read her own letters in the Study and cried and laughed by turns. She has asked to be called Prudence on her birthday.",
        effects: { revealSecret: true, resident: { racination: 3, devotion: 2 } } },
      { label: "File them away again",
        result: "The letters went back in the file. Miss Prudence Hart remains, officially, a correspondent who stopped writing.",
        effects: { revealSecret: true } }
    ]
  },

  {
    id: "secret-unbeliever", kind: "incident", title: "A confession",
    when: { resident: { secret: "unbeliever" }, chance: 0.2 },
    text: "{resident.name} came to the Study and said, all at once, that she does not believe in the Goddess, or the Eclipse, or the Pit, and never has. She stays because she loves the house and someone in it. She did not say who, and {mistress.name} did not ask.",
    choices: [
      { label: "Tell her the house has room for her as she is", rhetoric: "play",
        result: "{mistress.name} told her that the house is a house before it is a creed. {resident.first} went out lighter than she came in.",
        effects: { revealSecret: true, resident: { doubt: -6, racination: 2 } } },
      { label: "Ask her to keep the forms, whatever she believes", rhetoric: "belief",
        result: "{resident.first} has agreed to keep the forms. She kneels at Matins with the rest, and nobody can tell the difference, which is either the point of the forms or a proof against them.",
        effects: { revealSecret: true, resident: { devotion: 3, doubt: 2 } } }
    ]
  },

  {
    id: "secret-walkman", kind: "incident", title: "Music under the bedclothes",
    when: { resident: { secret: "walkman" }, chance: 0.25 },
    text: "Faint drums have been heard after Compline from {resident.name}'s room. Investigation finds her under the eiderdown with a personal stereo and one cassette, worn almost through, of a band the house has never heard of and would rather not.",
    choices: [
      { label: "Take it, and give her a gramophone hour instead",
        result: "The personal stereo went into the Study drawer with the radio. {resident.first} has been given the gramophone for an hour on Sunday afternoons and plays dance music very loud, as if to make a point.",
        effects: { revealSecret: true, resident: { racination: 2, doubt: 1 }, pit: -1 } },
      { label: "Ask to hear the cassette", rhetoric: "play",
        result: "{mistress.name} listened to one side of the cassette in the Study, with the headphones on, expressionless. Then she gave it back and said it was ‘very energetic’. Nothing more has been said.",
        effects: { revealSecret: true, resident: { doubt: -3 }, pit: 1 } }
    ]
  },

  {
    id: "secret-othergroup", kind: "letter", title: "A warning from another house",
    from: "A woman who signs herself Sister Agnes, a community in Sussex",
    when: { resident: { secret: "othergroup" }, chance: 0.2 },
    text: "A letter has come from another Goddess community, in Sussex, warning the house about {resident.name}, who was asked to leave them three years ago. It does not say why. It hints, at great length.",
    choices: [
      { label: "Show {resident.first} the letter and ask for her side",
        result: "{resident.first} read it and said that she was asked to leave for disagreeing with Sister Agnes about the hymn book, and that she would do it again. The house finds this entirely credible.",
        effects: { revealSecret: true, resident: { doubt: -3, devotion: 2 } } },
      { label: "Burn it unread by her",
        result: "The letter was burnt. {resident.first} does not know it came. The house has recorded that it kept a letter from her.",
        effects: { revealSecret: true, record: "withheldLetters" } }
    ]
  },

  {
    id: "secret-journalist", kind: "incident", title: "A card from Fleet Street",
    when: { resident: { secret: "journalist" }, chance: 0.2 },
    text: "A business card has turned up in {resident.name}'s coat pocket, sent to the laundry: a woman's name and a Sunday newspaper's address in Wapping, with a telephone number written on the back in biro.",
    choices: [
      { label: "Ask her about it, plainly",
        outcomes: [
          { chance: 0.5, result: "{resident.first} said the journalist found her in the village and she has told her nothing, and will tell her nothing. She tore up the card herself.",
            effects: { revealSecret: true, resident: { devotion: 3, doubt: -2 } } },
          { chance: 0.5, result: "{resident.first} said she does not know yet what she will tell her. She would like the Mistress to give her a reason not to.",
            effects: { revealSecret: true, resident: { doubt: 4 }, mistressDoubt: 3, record: "journalistKnown" } }
        ] },
      { label: "Put it back in her pocket and watch",
        result: "The card went back in the pocket. The house is watching the post, and the village telephone box, and {resident.first}.",
        effects: { revealSecret: true, record: "journalistKnown", mistressDoubt: 2 } }
    ]
  },

  {
    id: "secret-hymns", kind: "incident", title: "A silent hymn",
    when: { resident: { secret: "hymns" }, chance: 0.25 },
    text: "During Evensong the harmonium stopped mid-verse, and the household's voices stopped with it, except that {resident.name} went on moving her lips for a bar and a half in complete silence. She has been miming the hymns for two years.",
    choices: [
      { label: "Teach her to read music", rhetoric: "belief",
        result: "{mistress.name} has been teaching her at the harmonium after supper. She can now read a hymn tune, slowly, and sings it, loudly, and slightly flat.",
        effects: { revealSecret: true, resident: { devotion: 3, racination: 2 } } },
      { label: "Laugh, and let her go on miming", rhetoric: "play",
        result: "The household laughed until it had to sit down, {resident.first} loudest. She still mimes, but now everyone knows, and it is a sort of hymn in itself.",
        effects: { revealSecret: true, household: { racination: 1 } } }
    ]
  },

  {
    id: "secret-smokes", kind: "incident", title: "Smoke by the potting shed",
    when: { resident: { secret: "smokes" }, chance: 0.25 },
    text: "A thin line of smoke has been seen after Compline rising behind the potting shed. It is {resident.name}, with a packet of Embassy and a box of matches, looking at the stars.",
    choices: [
      { label: "Forbid it",
        result: "{resident.first} has given her word. The potting shed is dark after Compline now, and she is crosser in the mornings.",
        effects: { revealSecret: true, resident: { doubt: 2, racination: 1 } } },
      { label: "Allow it, if she uses a holder like a lady", rhetoric: "play",
        result: "{resident.first} smokes behind the potting shed with a long black holder now, like a woman in a 1932 photograph, and looks the better for it.",
        effects: { revealSecret: true, resident: { racination: 2, doubt: -2 } } },
      { label: "Join her for one", rhetoric: "play",
        result: "{mistress.name} went out after Compline and asked for a cigarette. They smoked it together in silence behind the potting shed, looking at the stars. Neither has mentioned it since.",
        effects: { revealSecret: true, resident: { devotion: 4, doubt: -3 }, authority: -1 } }
    ]
  },

  {
    id: "secret-paperback", kind: "incident", title: "A paperback in the post",
    when: { resident: { secret: "paperback" }, chance: 0.2 },
    text: "A royalty statement has come for a Ms Scarlett Vane, care of {resident.name}. Ms Vane is the author of a paperback called Desire in the Desert, with a cover the house will not describe. Ms Vane is {resident.first}.",
    choices: [
      { label: "Ask her to give the royalties to the house",
        result: "{resident.first} has signed the royalties over to the house, a little sulkily. They come to fourteen pounds a quarter.",
        effects: { revealSecret: true, money: 14, resident: { doubt: 3 } } },
      { label: "Ask her to write one set in 1934 instead", rhetoric: "play",
        result: "{resident.first} is writing a novel set in 1934, with no deserts in it at all. She reads the household a chapter on Sundays. It is very much better than Desire in the Desert.",
        effects: { revealSecret: true, resident: { racination: 3 }, household: { racination: 0.5 } } }
    ]
  },

  /* ================= The Mistress's contacts ================= */

  {
    id: "contact-money", kind: "letter", title: "An offer of help",
    from: "{contact}",
    when: { contact: true, moneyBelow: 800, chance: 0.5 },
    text: "A letter from {contact}, who has heard that the house is not as comfortable as it might be. There is a cheque enclosed, described as a loan and very clearly meant as a gift.",
    choices: [
      { label: "Accept it, with gratitude",
        result: "The cheque has been banked and a letter of thanks has gone off in {mistress.name}'s best hand.",
        effects: { money: 120 } },
      { label: "Return it: the house pays its own way", rhetoric: "belief",
        result: "The cheque went back with a letter of thanks and a refusal. The house is poorer and prouder.",
        effects: { conviction: 2 } }
    ]
  },

  {
    id: "contact-guests", kind: "letter", title: "A word in the right ear",
    from: "{contact}",
    when: { contact: true, chance: 0.5 },
    text: "{contact} writes to say that the house has been mentioned, favourably, at a luncheon, and that several women who were at it have asked for the address.",
    choices: [
      { label: "Send the address and a prospectus",
        result: "The prospectus has gone to six addresses. The house's reputation in certain drawing rooms has risen.",
        effects: { reputation: 4, pit: 0.5 } },
      { label: "Ask that the house not be mentioned at luncheons", rhetoric: "belief",
        result: "{contact} has been asked to keep the house out of luncheons, and has promised to, with evident disappointment.",
        effects: { pit: -1 } }
    ]
  },

  {
    id: "contact-parcel", kind: "letter", title: "A parcel of old things",
    from: "{contact}",
    when: { contact: true, chance: 0.5 },
    text: "A parcel has come from {contact}: a hatbox of old gloves, two silk scarves, a beaded evening bag and a bundle of dance-band bendies in brown paper sleeves, cleared from a relation's flat in Kensington.",
    choices: [
      { label: "Share them out among the household", rhetoric: "belief",
        result: "The gloves, scarves and bag were shared out at supper with a great deal of ceremony and some squabbling. The bendies went straight on the gramophone.",
        effects: { household: { racination: 1 } } },
      { label: "Sell them to a dealer",
        result: "The parcel went to a dealer in Oxford for thirty pounds. The house is warmer, and slightly ashamed.",
        effects: { money: 30 } }
    ]
  },

  {
    id: "contact-favour", kind: "letter", title: "A favour asked",
    from: "{contact}",
    when: { contact: true, chance: 0.4 },
    text: "{contact} asks a favour: a god-daughter, twenty-six, recently jilted and very low, needs somewhere to be quiet for a fortnight. She would pay, of course. She would not need to wear anything in particular.",
    choices: [
      { label: "Take her, and dress her like everyone else", rhetoric: "belief",
        result: "The god-daughter came, was put in a tea frock on the first morning and cried with relief on the second. She went home racinated and has written twice.",
        effects: { money: 60, reputation: 2, pit: 1 } },
      { label: "Take her, as she is", rhetoric: "play",
        result: "The god-daughter came in her own clothes and stayed in them, and was quiet, and was better at the end of it. She thinks the house is a very good rest home.",
        effects: { money: 60, pit: 2 } },
      { label: "Decline: the house is not a rest home",
        result: "{contact} has been told, kindly, that the house is not a rest home. The god-daughter has gone to Malvern instead.",
        effects: {} }
    ]
  }
];
