/*
  RACINATION — data/events.js
  ---------------------------------------------------------------
  Visitors and household incidents, which happen midweek on the
  "week's business" screen, and the settings for all events.
  Letters live in data/letters.js. WRITING-EVENTS.md explains the
  format, with a worked example to copy.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.eventSettings = {
  // How many events a week: one is picked from this list at random.
  weekly: [1, 1, 2, 2, 2, 3],
  // The share of them that are letters.
  letterShare: 0.5,
  // Weeks before an event can happen again, unless it says otherwise ("every").
  defaultCooldown: 26,
  // How far a believer's or a game-player's answer moves the Belief–Play axis.
  rhetoricShift: 3,
  // Each week: Devotion gained per point of Belief; Doubt eased per point of Play.
  beliefDevotion: 0.003,
  playDoubtRelief: 0.002,

  // Asking to leave (Milestone 5b): a resident whose Doubt has stayed at or above
  // leaveDoubt for leaveAfterWeeks weeks asks to leave; she will not ask again
  // for leaveAskEvery weeks.
  leaveDoubt: 85,
  leaveAfterWeeks: 3,
  leaveAskEvery: 8,
  leaveEventId: "wants-to-leave",

  // When a new resident arrives. {name} is filled in.
  arrivalLine: "{name} arrived on the afternoon train with one suitcase and the twentieth century still on her. She has been given a room and a week without duties to settle."
};

window.RACINATION_DATA.events = [

  /* ---------- Visitors ---------- */

  {
    id: "vicar-calls", kind: "visitor", title: "The vicar calls",
    when: {},
    text: "The Reverend Mr Ainsworth has called, on a bicycle, to welcome the house to the parish in a general way and to discover in a particular way what it is. He is a mild man with a cardigan under his cassock and the expression of one who has heard things in the village.",
    choices: [
      { label: "Tea in the Drawing Room, with the good china",
        result: "Mr Ainsworth was given tea, Dundee cake and a conversation about Trollope, and left charmed and no wiser. He has told the village the house is ‘very devout, in its way’, which the village has taken badly.",
        effects: { reputation: 1, pit: 0.5 } },
      { label: "Discuss theology with him, frankly", rhetoric: "belief",
        result: "{mistress.name} explained the Divine Feminine to him in the Morning Room for an hour and a quarter. He took it very well and asked for a copy of the Rule, which he has put in his study between Hooker and a seed tray.",
        effects: { conviction: 2, pit: 1 } },
      { label: "Have him told the Mistress is at prayer", rhetoric: "belief",
        result: "Mr Ainsworth was told at the door that {mistress.name} was at prayer, which was true in the sense that she was standing behind the curtain praying he would go away.",
        effects: {} }
    ]
  },

  {
    id: "coalman", kind: "visitor", title: "The coalman's opinions",
    when: { season: ["autumn", "winter"], resident: {} },
    text: "Mr Dobbs the coalman, while delivering ten hundredweight to the coal hole, has expressed a number of opinions about the house to {resident.name}, who was hanging washing in the yard. They concerned crinolines, unmarried women and the Common Market, in that order.",
    choices: [
      { label: "Let it pass: he is the only coalman for miles",
        result: "Mr Dobbs was given a cup of tea and his money and drove off whistling. {resident.first} has put the washing out on the other side of the house since.",
        effects: { resident: { doubt: 1 } } },
      { label: "Have a word with him about manners", rhetoric: "belief", needs: { authority: 2 },
        result: "{mistress.name} had a word with Mr Dobbs about manners at the coal hole, in front of his lorry. He has since delivered in silence, and at a slightly higher price.",
        effects: { authority: -2, money: -3, resident: { devotion: 2 } } },
      { label: "Have {resident.first} answer him herself", rhetoric: "play",
        result: "{resident.first} told Mr Dobbs, without raising her voice, exactly what the house thought of the Common Market. He laughed so much he had to sit on his own sacks. They are on excellent terms now.",
        effects: { resident: { racination: 2, doubt: -1 } } }
    ]
  },

  {
    id: "ramblers", kind: "visitor", title: "Ramblers at the gate",
    when: { season: ["spring", "summer"] },
    text: "A party of twelve ramblers in anoraks and shorts has asked permission to cross the garden to reach the footpath, which they insist has run past the kitchen garden since the Enclosure Acts. They have a map in a plastic case and a leader with a beard.",
    choices: [
      { label: "Let them through", rhetoric: "play",
        result: "Twelve ramblers crossed the garden in single file, admiring the beans and looking at the household as if it were a heritage attraction. One of them asked to take a photograph and was refused.",
        effects: { pit: 2, reputation: 1 } },
      { label: "Send them round by the lane",
        result: "The ramblers went round by the lane, which added half an hour and a letter to the Ramblers' Association. The household watched them go from behind the elms.",
        effects: {} },
      { label: "Let them through, and charge them for tea and scones", rhetoric: "play",
        result: "The ramblers paid thirty pence each for tea and a scone on the lawn and went away delighted. The house made four pounds and was looked at by the twentieth century for an hour.",
        effects: { money: 4, pit: 2 } }
    ]
  },

  {
    id: "pamphlet-men", kind: "visitor", title: "Two young men with pamphlets",
    when: {},
    text: "Two earnest young men in short-sleeved shirts have come up the drive with pamphlets about the end of the world. The house, which believes the world ended in about 1967, is not sure whether to receive them as heralds or latecomers.",
    choices: [
      { label: "Receive them, and explain the Eclipse", rhetoric: "belief",
        result: "The young men were given lemonade and an account of the Eclipse, and left looking at one another. They have not come back, but their pamphlets are being used to light the range.",
        effects: { conviction: 1, pit: 0.5 } },
      { label: "Thank them and close the door",
        result: "They were thanked and the door was closed. They left a pamphlet on the step, which the rain has taken care of.",
        effects: {} }
    ]
  },

  {
    id: "guest-husband", kind: "visitor", title: "A husband at the door",
    when: { guestsAtLeast: 1, chance: 0.4 },
    text: "A man in a car coat has come to the front door asking for his wife, who is staying in the Rose Bedroom for a week of terms and has, he says, gone peculiar. He has driven from Reading and has the look of a man who has rehearsed what he will say in the car.",
    choices: [
      { label: "Fetch his wife, and let her decide",
        outcomes: [
          { chance: 0.5, result: "His wife came down in a borrowed tea frock, heard him out on the step and told him she would be home on Saturday as arranged. He drove off without his rehearsed speech.",
            effects: { reputation: 2 } },
          { chance: 0.5, result: "His wife came down, saw him, burst into tears and went home with him in the car coat's car. The house refunded her week. Her tea frock has been returned by post.",
            effects: { money: -60, reputation: -2, pit: 1 } }
        ] },
      { label: "Tell him she is not receiving visitors", needs: { authority: 3 },
        result: "{mistress.name} told him on the step that his wife was not receiving. He went away, and came back with a policeman, who was given tea and found nothing amiss. The guest has written since to say it was the best week of her life. The house is less sure.",
        effects: { authority: -3, pit: 2, reputation: 1, record: "guestsKeptFromFamily" } }
    ]
  },

  {
    id: "meter-reader", kind: "visitor", title: "The meter reader",
    when: {},
    text: "A youth from the Electricity Board has come to read the meter, wearing headphones attached to a small cassette machine, from which a thin sound of drums is escaping into the hall.",
    choices: [
      { label: "Show him to the meter and back out again",
        result: "He read the meter, said ‘cheers’ and left, trailing drums. The hall was aired afterwards.",
        effects: { pit: 1 } },
      { label: "Ask him to remove his headphones in the house", rhetoric: "belief",
        result: "He took them off, looking astonished, and read the meter in a silence that seemed to frighten him. He said ‘thank you, madam’ on the way out, apparently by reflex.",
        effects: { household: { devotion: 0.5 } } }
    ]
  },

  /* ---------- Household incidents ---------- */

  {
    id: "gramophone-quarrel", kind: "incident", title: "A quarrel over a bendy",
    when: { residentsAtLeast: 2, resident: {}, other: {} },
    text: "{resident.name} and {other.name} have quarrelled in the Drawing Room over a record. {resident.first} wanted the Savoy Orpheans; {other.first} wanted a waltz; the record, caught between them, is now in two halves on the hearthrug, and neither will speak to the other.",
    choices: [
      { label: "Adjudicate in the Study", needs: { authority: 2 },
        result: "{mistress.name} heard them both in the Study, found for neither, and set them to mend the record cabinet together. They came out an hour later arguing about a different record, which is progress.",
        effects: { authority: -2, resident: { doubt: -1 }, other: { doubt: -1 } } },
      { label: "Leave it to the Housekeeper", needs: { housekeeper: true },
        result: "{housekeeper.name} dealt with it by taking the gramophone away until Sunday. Peace was restored, resentfully.",
        effects: { resident: { doubt: 1 }, other: { doubt: 1 }, housekeeper: { devotion: 1 } } },
      { label: "Let them settle it themselves", rhetoric: "play",
        outcomes: [
          { chance: 0.6, result: "They made it up over the washing-up, as women do, and are now inseparable.", effects: { resident: { racination: 1 }, other: { racination: 1 } } },
          { chance: 0.4, result: "They have not made it up. The Drawing Room has two camps, and the household has had to choose.", effects: { household: { doubt: 1 } } }
        ] }
    ]
  },

  {
    id: "drains-miracle", kind: "incident", title: "A miracle of the drains",
    when: {},
    text: "The scullery drain, blocked since Tuesday and resistant to rods, soda and a man from the village, cleared of its own accord during Evensong with a sound the household will not describe. The question is what the house is to make of it.",
    choices: [
      { label: "Give thanks in Chapel", rhetoric: "belief",
        result: "Thanks were given at Compline, sincerely. The household slept well. The drain has given no further trouble, which the believers regard as confirmation.",
        effects: { household: { devotion: 1.5 }, conviction: 1 } },
      { label: "Call it a drain", rhetoric: "play",
        result: "{mistress.name} called it a drain, and the household laughed, and the laughter did them nearly as much good as a miracle would have. Racination, the house has observed before, is not always solemn.",
        effects: { household: { racination: 1 } } }
    ]
  },

  {
    id: "range-fails", kind: "incident", title: "The range goes out",
    when: { season: "winter" },
    text: "The kitchen range, a black-leaded Victorian monster that is the house's only reliable source of heat and porridge, has gone out and will not light again. Something inside it has cracked.",
    choices: [
      { label: "Send for the man from Wantage (£35)", needs: { money: 35 },
        result: "The man from Wantage came, shook his head for a quarter of an hour, and mended it. The kitchen is warm again, and the household has stopped wearing its coats at breakfast.",
        effects: { money: -35, room: { id: "kitchen", condition: 10 } } },
      { label: "Make do with the paraffin stove until spring", rhetoric: "belief",
        result: "The house made do. Porridge on a paraffin stove is a penance of its own. The household bore it, but it bore it in coats.",
        effects: { household: { racination: -1, devotion: 1 }, room: { id: "kitchen", condition: -8 } } }
    ]
  },

  {
    id: "pop-song", kind: "incident", title: "A tune from the wireless",
    when: { resident: { racinationBelow: 50 } },
    text: "{resident.name} was heard humming on the back stairs, and the tune, on investigation, turned out to be something from the hit parade that she must have heard in the village shop. She did not seem to know she was doing it.",
    choices: [
      { label: "Correct her gently, and teach her a better tune", rhetoric: "belief",
        result: "{mistress.name} taught {resident.first} a song from 1927 on the landing. She has been humming it ever since, which the household finds almost as maddening, but approves of.",
        effects: { resident: { racination: 2, devotion: 1 } } },
      { label: "Laugh it off", rhetoric: "play",
        result: "It was laughed off. {resident.first} laughed too, and was relieved, and has been humming nothing at all since.",
        effects: { resident: { doubt: -1 } } },
      { label: "A formal reproof, at Matins", needs: { authority: 2 },
        result: "{resident.name} was reproved at Matins, before the household, for bringing the Pit up the back stairs. She took it with a red face and has not hummed since. The household is divided as to whether that was justice.",
        effects: { authority: -2, resident: { doubt: 3, devotion: 1 }, household: { devotion: 0.5 } } }
    ]
  },

  {
    id: "snowbound", kind: "incident", title: "Snowbound",
    when: { season: "winter", chance: 0.5 },
    text: "Snow has fallen all night and closed the lane. No post, no deliveries, no milk float, no village. The house is entirely cut off from the twentieth century for the first time since it was built, and is trying not to look too pleased.",
    choices: [
      { label: "Declare a week of retreat", rhetoric: "belief",
        result: "The house kept retreat for a week, with longer hours in Chapel, reading aloud by the range and no news of anything. The provisions ran thin, but the Pit ran thinner.",
        effects: { pit: -4, household: { devotion: 2 }, money: -8 } },
      { label: "Dig out the lane", rhetoric: "play",
        result: "The whole household dug out the lane in coats and headscarves, with a gramophone on the wall playing for morale. It took two days and was the best fun anyone had had since the summer.",
        effects: { pit: -2, household: { racination: 1.5 } } }
    ]
  },

  {
    id: "reading-aloud", kind: "incident", title: "A request to read aloud",
    when: { resident: { skill: { letters: 2 } } },
    text: "{resident.name} has asked whether she may read aloud to the household in the evenings, from a novel of 1931 that she found in the Library with its pages still uncut. She has, she says, been practising in the bath.",
    choices: [
      { label: "Yes, in the Drawing Room after Evensong", rhetoric: "belief",
        result: "{resident.first} reads every evening now, in a voice nobody knew she had. The household gathers for it as for a wireless serial, and the novel, it turns out, is about a governess, a moor and a misunderstanding.",
        effects: { resident: { racination: 3 }, household: { racination: 0.5 } } },
      { label: "Yes, but only on Sundays",
        result: "Sunday evenings are hers now. The household looks forward to them all week.",
        effects: { resident: { racination: 1.5 } } }
    ]
  },

  {
    id: "attic-damp", kind: "incident", title: "Damp in the attics",
    when: { season: ["autumn", "winter", "spring"] },
    text: "A brown stain the shape of Lincolnshire has appeared on the ceiling of the back landing, and is spreading towards Norfolk. The attics above it smell of mushrooms.",
    choices: [
      { label: "Have the roof seen to (£50)", needs: { money: 50 },
        result: "A man went up a ladder, replaced eleven slates and came down with an opinion about the rest. The stain has stopped at the county boundary.",
        effects: { money: -50, room: { id: "attics", condition: 15 } } },
      { label: "Put buckets under it",
        result: "Buckets have been placed under it. The household has learnt to step round them, and to tell the time by the drip.",
        effects: { room: { id: "attics", condition: -10 }, household: { doubt: 0.5 } } }
    ]
  },

  {
    id: "good-day", kind: "incident", title: "A perfect afternoon",
    when: { season: "summer", pitBelow: 40 },
    text: "An afternoon of such perfect stillness and warmth that the whole household has drifted, without being told, onto the lawn: gramophone on a rug, tea in the shade of the cedar, somebody's knitting abandoned on the grass, and not a single sound from the twentieth century anywhere.",
    choices: [
      { label: "Let the afternoon be", rhetoric: "belief",
        result: "Nobody did any work at all until Evensong, and nobody was sorry. The Housekeeper has entered it in the day-book as ‘an afternoon’, with no further particulars.",
        effects: { household: { racination: 2 }, pit: -1 } },
      { label: "Take a photograph", rhetoric: "play",
        result: "{mistress.name} took a photograph with the house's old box camera. It will be developed in Abingdon, and will show the household on a lawn in 1934, except that it is not, and somebody in Abingdon will notice.",
        effects: { household: { racination: 1.5 }, pit: 0.5 } }
    ]
  }
];
