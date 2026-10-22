/*
  RACINATION — data/letters.js
  ---------------------------------------------------------------
  Letters that arrive with the post at Matins and ask for an answer.
  The format is the same as data/events.js; WRITING-EVENTS.md
  explains every part, with a worked example.

  from   — who the letter is from (shown above it)
  Tokens — {resident.name}, {resident.first}, {other.name},
           {departed.name}, {housekeeper.name}, {mistress.name},
           {house} and the Mistress's others.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.letters = [

  {
    id: "devotee-christchurch", title: "A letter from New Zealand",
    from: "Mrs Enid Harrowby, Christchurch, New Zealand",
    when: {},
    text: "Mrs Harrowby has read a copy of the house magazine lent to her by a friend in Dunedin, and has wept over it. She encloses a postal order for five pounds and asks to be sent the Rule of the house, so that she may keep it alone in a bungalow in the suburbs, as far from the Eclipse as it is possible to get without leaving the planet.",
    choices: [
      { label: "Send the Rule, the back numbers and a pressed flower from the garden", rhetoric: "belief",
        result: "The parcel went off by surface mail and will reach Christchurch at about the time of the next Eclipse. The house is warmed to think of her.",
        effects: { money: 3, household: { devotion: 1 } } },
      { label: "Send a kind letter, and keep the postal order",
        result: "A letter went off in {mistress.name}'s hand, kind and short. The postal order was banked.",
        effects: { money: 5 } },
      { label: "Return the postal order: the Rule is not for sale", rhetoric: "belief",
        result: "The postal order went back with the Rule and a note of some severity. The house felt itself to be above money for very nearly a whole afternoon.",
        effects: { conviction: 2 } }
    ]
  },

  {
    id: "mother-writes", title: "A mother writes",
    from: "Mrs Joan {resident.surname}, of an address in the Home Counties",
    when: { resident: { tie: "family" } },
    text: "A letter addressed to {resident.first}, in a mother's hand, has come in the second post. The envelope is thick and the writing presses through the paper. It is not hard to guess what it says, in the Tellurian manner: come home, and what will the neighbours think, and your father has not been well.",
    choices: [
      { label: "Give it to {resident.first}, unopened",
        result: "{resident.name} read her letter in the Morning Room and came out with her eyes red. She has said nothing about it, and nobody has asked.",
        effects: { resident: { doubt: 5, racination: -1 } } },
      { label: "Give it to her, and sit with her while she reads it", rhetoric: "belief",
        needs: { authority: 2 },
        result: "{mistress.name} sat with {resident.first} in the Study while she read it, and said very little, which was the right amount. {resident.first} kissed her hand afterwards.",
        effects: { authority: -2, resident: { doubt: 2, devotion: 3 } } },
      { label: "Keep it from her, and put it on the fire",
        result: "The letter went on the Study fire unopened. {resident.first} does not know that it came. The house has crossed a small line, and has recorded where it crossed it.",
        effects: { resident: { doubt: -1 }, record: "withheldLetters", conviction: -2 } }
    ]
  },

  {
    id: "ex-writes", title: "A letter from the past",
    from: "A man's handwriting, postmarked Swindon",
    when: { resident: { tie: "ex" } },
    text: "A letter for {resident.first} has come from someone she left behind. It is written on lined paper torn from a pad, and the envelope has been stuck down twice.",
    choices: [
      { label: "Give it to {resident.first}",
        result: "{resident.name} read it standing up in the hall, folded it very small and put it in her pocket. She was quiet at supper.",
        effects: { resident: { doubt: 4 } } },
      { label: "Give it to her, and offer to help her answer it", rhetoric: "play",
        result: "{resident.first} and {mistress.name} wrote a reply together at the Study table, firm and civil. {resident.first} posted it herself and walked back up the drive a little straighter.",
        effects: { resident: { doubt: -2, racination: 2 }, removeTie: "ex" } },
      { label: "Return it to the sender unopened",
        result: "It went back marked ‘Not known at this address’, which is a lie, and the house knows it. {resident.first} has not been told.",
        effects: { record: "withheldLetters", conviction: -2 } }
    ]
  },

  {
    id: "bank-manager", title: "The bank writes",
    from: "The Manager, the bank in Abingdon",
    when: { moneyBelow: 400 },
    text: "The manager presents his compliments and observes that the account of {house} has been running perilously close to the overdraft limit, which he would remind {mistress.name} is not a target. He would welcome a conversation at her earliest convenience, and suggests Tuesday.",
    choices: [
      { label: "Go to Abingdon on Tuesday, in her best", needs: { authority: 3 },
        outcomes: [
          { chance: 0.6, result: "{mistress.name} went to Abingdon in her best and came back with an extended overdraft and the manager's evident confusion as to what had happened to him.",
            effects: { authority: -3, money: 150, pit: 2 } },
          { chance: 0.4, result: "{mistress.name} went to Abingdon in her best. The manager was polite, immovable and wearing a digital watch. She came home with nothing but a headache from the strip lighting.",
            effects: { authority: -3, pit: 2, mistressDoubt: 2 } }
        ] },
      { label: "Write him a long letter instead", needs: { skill: { letters: 2 } },
        result: "The house's best pen wrote four pages on the temporary nature of financial embarrassment and the permanent nature of good breeding. The manager has gone quiet, which may or may not be a victory.",
        effects: { reputation: 0 } },
      { label: "Put the letter in the bureau and pray", rhetoric: "belief",
        result: "The letter went into the bureau. The Chapel was kept an extra hour. Money worries, it must be said, are not much moved by either.",
        effects: { mistressDoubt: 2, conviction: 1 } }
    ]
  },

  {
    id: "council-drains", title: "The District Council",
    from: "The Environmental Health Department, Vale of White Horse District Council",
    when: { chance: 0.6 },
    text: "Following a complaint from a neighbouring property, the Council writes to say that it has reason to believe the septic arrangements at {house} are not adequate to the number of persons resident. An inspector will call. The letter is signed by a Mr Kenneth Pratt, whose initials are typed in capitals.",
    choices: [
      { label: "Have the drains seen to before he comes (£45)", needs: { money: 45 },
        result: "A man came from Wantage and did something expensive to the drains. The inspector, when he called, found nothing to say and said it at length.",
        effects: { money: -45, room: { id: "scullery", condition: 5 } } },
      { label: "Receive the inspector with tea and the full force of the house",
        needs: { authority: 2 },
        outcomes: [
          { chance: 0.5, result: "Mr Pratt was given tea in the Drawing Room by three women in crêpe, and left without examining anything below the level of the tea tray.",
            effects: { authority: -2, pit: 1 } },
          { chance: 0.5, result: "Mr Pratt drank his tea, inspected the drains regardless and has written again, this time in red.",
            effects: { authority: -2, pit: 1, followUp: { id: "council-drains-again", weeks: 3 } } }
        ] },
      { label: "Ignore it", rhetoric: "belief",
        result: "The letter was filed under the Pit. The Council, it is to be feared, will file the house under something less forgiving.",
        effects: { followUp: { id: "council-drains-again", weeks: 4 } } }
    ]
  },

  {
    id: "council-drains-again", title: "The Council again", followUpOnly: true, every: 0,
    from: "Mr K. PRATT, Environmental Health",
    when: {},
    text: "The Council writes again. The drains must be put right within twenty-eight days or the Council will do the work itself and send {house} the bill, with a charge for its trouble.",
    choices: [
      { label: "Pay for the work (£60)",
        result: "The work was done, the bill was paid, and Mr Pratt has presumably moved on to someone else's drains.",
        effects: { money: -60, room: { id: "scullery", condition: 8 } } },
      { label: "Let the Council do it and send the bill (£95)",
        result: "Men in orange came and dug up the side lawn. The bill, when it came, had a charge for their trouble and another for the house's.",
        effects: { money: -95, pit: 3, room: { id: "scullery", condition: 8 } } }
    ]
  },

  {
    id: "crank-aquarius", title: "Fourteen pages from Swindon",
    from: "Mr Derek Lumb, Swindon",
    when: {},
    text: "Mr Lumb has written fourteen pages, on both sides, in green ink, to explain that the Age of Aquarius began in 1962, that the house is therefore living in the wrong age, and that he could explain it in person on any Saturday except during the football.",
    choices: [
      { label: "File under Cranks", result: "The letter went into the box marked Cranks, which is now the largest box in the Study.", effects: {} },
      { label: "Send a courteous reply, correcting his astrology", rhetoric: "play",
        result: "{mistress.name} wrote back pointing out three errors in his calculations and one in his grammar. He has replied by return with twenty pages. The house has had a very enjoyable week.",
        effects: { household: { racination: 1 }, pit: 0.5 } },
      { label: "Read it aloud at supper", rhetoric: "play",
        result: "Mr Lumb's fourteen pages were read aloud at supper by the best voice in the house, and it was the happiest evening since Christmas.",
        effects: { household: { racination: 1, devotion: -1 } } }
    ]
  },

  {
    id: "romance-publisher", title: "An offer from a publisher",
    from: "Silverleaf Romances, Hammersmith",
    when: { residentsAtLeast: 2, chance: 0.5 },
    text: "A firm of paperback publishers has seen the house's own little romances advertised in the back of a magazine. They offer one hundred and fifty pounds for a novel of sixty thousand words, written to their pattern: a nurse, a doctor, a misunderstanding, a kiss on page one hundred and ninety. The doctor must be a man. They are very firm about the doctor.",
    choices: [
      { label: "Accept, and have it written under a false name", needs: { skill: { letters: 2 } },
        result: "The novel was written in a fortnight by two of the household, in a state of mounting hilarity and some shame. The cheque has come. The doctor is called Rex.",
        effects: { money: 150, pit: 4, household: { doubt: 1 } } },
      { label: "Decline: the house does not write doctors", rhetoric: "belief",
        result: "{mistress.name} declined, in terms that will be quoted in Hammersmith for some years.",
        effects: { conviction: 2 } },
      { label: "Counter-offer a novel with no men in it at all", rhetoric: "play",
        outcomes: [
          { chance: 0.3, result: "To everyone's astonishment, Silverleaf said yes, at a hundred pounds. It will be published under a new list called Silverleaf Sapphire, which nobody in Hammersmith will explain.",
            effects: { money: 100, pit: 2 } },
          { chance: 0.7, result: "Silverleaf did not reply. The house is not surprised and only a little disappointed.",
            effects: {} }
        ] }
    ]
  },

  {
    id: "bath-cat", title: "A cheque from Bath",
    from: "Miss Augusta Fane, Lansdown Crescent, Bath",
    when: { chance: 0.6 },
    text: "Miss Fane, who has been reading the house magazine since its first number and believes every word of it, encloses a cheque for one hundred pounds. She asks only that the house pray for her cat, Lord Grenville, who is fourteen and off his food.",
    choices: [
      { label: "Pray for Lord Grenville in Chapel, by name", rhetoric: "belief",
        result: "Lord Grenville was prayed for at Evensong, by name, with a candle. The cheque was banked the next morning. Miss Fane writes that he has eaten a whole sardine.",
        effects: { money: 100, household: { devotion: 1 } } },
      { label: "Bank the cheque quietly", rhetoric: "play",
        result: "The cheque was banked. Lord Grenville's fate is unknown. {mistress.name} felt a small twinge about it on the stairs.",
        effects: { money: 100, conviction: -2 } },
      { label: "Return the cheque: prayers are not paid for", rhetoric: "belief",
        result: "The cheque went back with a prayer card and a pressed violet. Miss Fane has written that she will leave the house something in her will, which is a different matter entirely.",
        effects: { conviction: 3 } }
    ]
  },

  {
    id: "electricity-board", title: "The Electricity Board",
    from: "Southern Electricity Board, Accounts Section",
    when: { rule: { electricity: "unrestricted" } },
    text: "The Board writes to draw attention to the quarter's account, which is larger than any previous quarter's account at this address since records began. It wonders whether the house is aware that it has left something on.",
    choices: [
      { label: "Pay it (£30)", result: "Paid. The Board has said nothing further, which is the most a Board can say.", effects: { money: -30 } },
      { label: "Pay it, and turn the electricity down to evenings", needs: { authority: 4 },
        result: "Paid, and the house went back to lamps by day. Two of the household sulked; the meter has stopped spinning like a gramophone.",
        effects: { money: -30, authority: -4, pit: -2 } }
    ]
  },

  {
    id: "former-resident", title: "A letter from one who left",
    from: "{departed.name}",
    when: { departedAtLeast: 1, chance: 0.5 },
    text: "{departed.first} has written from her new lodgings. She has a position in a library, a room with a gas ring, and a pair of 1934 shoes that she wears to work regardless of what is said. She sends her love to the house and asks to be remembered at Evensong.",
    choices: [
      { label: "Read it aloud at supper", rhetoric: "belief",
        result: "The letter was read at supper, and the household was quiet afterwards in the good way. Somebody put on a bendy and nobody took it off.",
        effects: { household: { racination: 1, devotion: 1 } } },
      { label: "Pin it on the board in the scullery passage",
        result: "It hangs on the board beside the rota, and the household reads it on the way past.",
        effects: { household: { racination: 1 } } }
    ]
  },

  {
    id: "polarity-correspondent", title: "A correspondent in Glasgow",
    from: "Miss M. Kerr, Hyndland, Glasgow",
    when: { chance: 0.6 },
    text: "Miss Kerr writes, at length and with diagrams, to argue that the house has the two sexes the wrong way round: that the blonde is the commanding principle and the brunette the receptive, as anyone who had read the right books would know. She asks for a reply that engages with her argument rather than with her handwriting.",
    choices: [
      { label: "Reply with a treatise", rhetoric: "belief", needs: { skill: { letters: 3 } },
        result: "The house's reply ran to eleven pages and three appendices. Miss Kerr has conceded one point and opened two more. The correspondence promises to continue for years.",
        effects: { conviction: 3, household: { devotion: 1 }, pit: 0.5 } },
      { label: "Concede that it is all a matter of temperament anyway", rhetoric: "play",
        result: "{mistress.name} wrote back that the house assigns the sexes by temperament, not by theory, and that Miss Kerr is welcome to be whatever she likes in Glasgow. Some of the household thought this very wise; one or two thought it rather too wise.",
        effects: { mistressDoubt: 1 } },
      { label: "Do not reply", result: "Miss Kerr's diagrams have gone into the Library, where they will one day puzzle a historian.", effects: {} }
    ]
  },

  {
    id: "bendies-dealer", title: "A box of bendies",
    from: "A dealer in second-hand records, Reading",
    when: {},
    text: "A dealer in Reading writes that he has acquired a box of forty dance-band records from a house clearance in Henley: Ambrose, Hylton, Harry Roy, all 78s, some in their sleeves. He understands the house is interested in such things. He will take twelve pounds for the box, carriage paid.",
    choices: [
      { label: "Buy the box (£12)", needs: { money: 12 }, rhetoric: "belief",
        result: "The box came on Thursday. The Drawing Room has not been silent since. Two of the bendies are cracked and one is a comic song about a lodger, which has been placed under an interdict.",
        effects: { money: -12, household: { racination: 1.5 } } },
      { label: "Decline: the house cannot afford it this week",
        result: "The dealer has written to say he will keep the box a month, in case. The house is pretending not to mind.",
        effects: {} }
    ]
  },

  {
    id: "tv-licence", title: "Television Licensing",
    from: "TV Licensing, Bristol",
    when: { chance: 0.5 },
    text: "TV Licensing writes to say that its records show no television licence at {house}, and asks the occupier to explain. The letter is printed in a Tellurian red that the house regards as an act of aggression, and threatens a visit from an enquiry officer with a detector van.",
    choices: [
      { label: "Write back that the house owns no television, and never will", rhetoric: "belief",
        result: "{mistress.name} replied that there is no television at {house}, that there has never been one, and that she would regard the arrival of a detector van as a form of trespass upon the 1930s. TV Licensing has not replied, possibly from confusion.",
        effects: { conviction: 1 } },
      { label: "Invite the enquiry officer to look for himself", rhetoric: "play",
        result: "The enquiry officer came, looked in every room, was offered a cup of tea and a reading from the Rule, and left with the expression of a man who has seen something he will not be able to describe at home.",
        effects: { pit: 1, household: { racination: 0.5 } } },
      { label: "Ignore it", result: "The letter was ignored. Another, in a deeper red, is no doubt being printed.", effects: { pit: 0.5 } }
    ]
  },

  {
    id: "guest-booking", title: "A request for terms",
    from: "Miss Pamela Gosling, a typist in Croydon",
    when: { rule: { guestIntake: ["occasional", "regular", "full"] } },
    text: "Miss Gosling has seen the house's advertisement in the personal column and would like to book a week of terms in the summer. She is twenty-nine, works in an office with a strip light and a man called Gary, and writes that she has not felt like a woman since 1971. She encloses a deposit of ten pounds.",
    choices: [
      { label: "Accept her, with a welcoming letter", rhetoric: "belief",
        result: "The house has written to Miss Gosling with directions from the station and a list of things she will not need. Her deposit has been banked, and the house's reputation in the personal columns has risen a little.",
        effects: { money: 10, reputation: 2 } },
      { label: "Accept her, and send a list of what to wear",
        result: "Miss Gosling has been sent a list of what she will need to wear, with drawings. She has written back that she has ordered a pattern and is already happier.",
        effects: { money: 10, reputation: 3 } },
      { label: "Return her deposit: the house is full",
        result: "Her deposit went back with a kind note. The house is a little smaller in the personal columns for it.",
        effects: { reputation: -1 } }
    ]
  },

  {
    id: "electoral-register", title: "The electoral register",
    from: "The Electoral Registration Officer",
    when: { season: "autumn" },
    text: "The annual form for the register of electors has come, asking the names of everyone over eighteen at the address. It is the sort of form the house most dislikes: buff, numbered and certain of itself.",
    choices: [
      { label: "Fill it in truthfully",
        result: "Every name went on the form, and the form went back. The house has been counted, which is a kind of contamination, but a lawful one.",
        effects: { pit: 1 } },
      { label: "Return it with a note about the century", rhetoric: "belief",
        result: "The form went back blank, with a note explaining that the house does not recognise the century in which the register is kept. A man from the council has written to say he will put everyone on anyway.",
        effects: { conviction: 1, pit: 0.5 } }
    ]
  },

  {
    id: "ministry-personnel", title: "Personnel writes",
    from: "Establishment Officer, a Ministry in London",
    when: { resident: { background: "civil", tie: "job" } },
    text: "A letter for {resident.first} from her Ministry, on paper with a crest, asks whether she intends to return at the end of her sabbatical, and reminds her of the pension arrangements. It is signed by someone she once lent a stapler to.",
    choices: [
      { label: "Let {resident.first} answer it as she pleases",
        outcomes: [
          { chance: 0.5, result: "{resident.name} wrote back resigning her post, and walked round the garden twice before she could come indoors. The house rang the bell for her at Evensong.",
            effects: { removeTie: "job", resident: { racination: 4, doubt: -3 } } },
          { chance: 0.5, result: "{resident.name} wrote back asking for more time. She does not know what she wants, and has said so, which the house counts as honesty.",
            effects: { resident: { doubt: 3 } } }
        ] },
      { label: "Encourage her to resign", rhetoric: "belief", needs: { authority: 3 },
        result: "{mistress.name} spoke to {resident.first} in the Study. She resigned by the next post. Whether she was persuaded or merely overruled is a question the house has not asked.",
        effects: { authority: -3, removeTie: "job", resident: { racination: 2, doubt: 2 } } }
    ]
  },

  {
    id: "seed-catalogue", title: "The seed catalogue",
    from: "A seedsman in Wisbech",
    when: { season: ["winter", "spring"] },
    text: "The seed catalogue has come, with coloured pictures of vegetables more beautiful than any the house has ever grown. The garden has asked for an order of six pounds' worth.",
    choices: [
      { label: "Order the seeds (£6)", needs: { money: 6 },
        result: "The seeds have come in little brown packets, and the garden is already planning.",
        effects: { money: -6, household: { racination: 0.5 } } },
      { label: "Save seed from last year instead", rhetoric: "belief",
        result: "The garden will make do with last year's seed, saved in envelopes in the scullery drawer, as women always have.",
        effects: { household: { devotion: 0.5 } } }
    ]
  }
];
