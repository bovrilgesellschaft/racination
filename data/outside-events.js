/*
  RACINATION — data/outside-events.js
  ---------------------------------------------------------------
  Milestone 10a: the village, the families and the authorities.
  The format is the one in WRITING-EVENTS.md, with these extras:

    when: { outside: { villageAbove: 60 } }    also villageBelow, pressAbove, pressBelow,
                                               officialAbove, officialBelow
    effects: { outside: { village: 5, press: 2, official: -3 } }

  The family events are brought by the game when a family's hidden
  concern crosses a threshold. Each comes in two versions: one where
  the family is merely anxious, and one ("-reason") where the game
  knows they are right to be. The player is never told which.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.outsideEvents = [

  /* ================= Families ================= */

  { id: "family-letter", kind: "letter", title: "A letter from home", followUpOnly: true, every: 0,
    from: "{resident.first}'s mother", when: { resident: {} },
    text: "Mrs {resident.surname} writes to the Mistress, in a careful round hand on Basildon Bond, to ask whether her daughter is well. She has had one postcard in four months. It was of a church. She is sure the house is very nice. She would just like to know.",
    choices: [
      { label: "Write back warmly, and have {resident.first} write too",
        result: "{mistress.name} wrote a long, kind letter about the garden and the Chapel, and {resident.first} added two pages of her own. Her mother has written back to say she cried with relief.",
        effects: { familyConcern: -25, resident: { devotion: 1 } } },
      { label: "A short note, from the Mistress only",
        result: "A short note went back, saying that {resident.first} was well and busy. It was true. It did not say very much else.",
        effects: { familyConcern: -5 } },
      { label: "Leave it unanswered", rhetoric: "belief",
        result: "The letter went in the drawer. The house is {resident.first}'s family now.",
        effects: { familyConcern: 10 } } ] },

  { id: "family-letter-reason", kind: "letter", title: "A letter from home", followUpOnly: true, every: 0,
    from: "{resident.first}'s mother", when: { resident: {} },
    text: "Mrs {resident.surname} writes that her daughter's last letter frightened her. It did not sound like her. It said she was very grateful, three times, and that she would not be able to write again for a while, and that her mother was not to worry. Mrs {resident.surname} has read it over and over, and she is worried. She asks, plainly, whether her daughter is free to leave.",
    choices: [
      { label: "Let {resident.first} answer for herself, unread",
        result: "{resident.first} wrote back alone, at the kitchen table, and sealed it herself. Nobody knows what she said. Her mother has not written again yet.",
        effects: { familyConcern: -15, resident: { doubt: -2 } } },
      { label: "Answer it yourself: she is perfectly free",
        result: "{mistress.name} wrote that {resident.first} is perfectly free, and perfectly happy. Her mother has read that letter over and over too.",
        effects: { familyConcern: 5 } },
      { label: "Leave it unanswered", rhetoric: "belief",
        result: "The letter went in the drawer. A second came a week later, and a third.",
        effects: { familyConcern: 15, record: "withheldLetters" } } ] },

  { id: "family-visit", kind: "visitor", title: "Parents at the gate", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "Mr and Mrs {resident.surname} drove down from the Midlands in the Maxi, without writing first, and are at the gate in their Sunday clothes, holding a cake tin. They would like to see their daughter. They are quite prepared to wait.",
    choices: [
      { label: "Bring them in, and give them tea in the Drawing Room",
        result: "They had tea in the Drawing Room with {resident.first}, who wore her best and poured beautifully. Her father said very little and looked at everything. Her mother cried in the car, and said afterwards that she had never seen the girl so well.",
        effects: { familyConcern: -30, outside: { village: 1 }, pit: 1 } },
      { label: "Let {resident.first} meet them in the village",
        result: "{resident.first} met them at the tea shop in the village and was gone two hours. She came back thoughtful, with the cake tin.",
        effects: { familyConcern: -15, resident: { doubt: 2 }, pit: 1 } },
      { label: "Turn them away", rhetoric: "belief",
        result: "They were told {resident.first} was at her devotions and could not be disturbed. They waited an hour in the Maxi, and then drove away. The cake tin was left on the gatepost.",
        effects: { familyConcern: 20, record: "guestsKeptFromFamily", outside: { village: -2 } } } ] },

  { id: "family-visit-reason", kind: "visitor", title: "Parents at the gate", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "Mr and Mrs {resident.surname} are at the gate. They have not come with a cake tin. They have come with {resident.first}'s brother, who is a large young man in a donkey jacket, and a list of questions written on the back of an envelope. Her father says, very quietly, that they would like to see her alone, and that they are not leaving until they have.",
    choices: [
      { label: "Let them see her alone",
        outcomes: [
          { chance: 0.5, result: "They saw her alone in the Morning Room for an hour. When they came out her mother was holding her hand, and {resident.first} said, in a voice nobody in the house had heard before, that she was going home for a while. She left with them that afternoon.",
            effects: { depart: "left", familyConcern: -100 } },
          { chance: 0.5, result: "They saw her alone for an hour. When they came out, {resident.first} walked them to the gate and kissed them, and came back up the drive alone, and went to the Chapel. Her father looked back at the house for a long time before he got into the car.",
            effects: { familyConcern: -20, resident: { doubt: 3 } } } ] },
      { label: "See them yourself, with {resident.first} beside you",
        result: "{mistress.name} received them in the Study with {resident.first} at her side. {resident.first} said everything that was right. Her father watched her hands the whole time. They left, and they did not look reassured.",
        effects: { familyConcern: 10, outside: { official: 3 } } },
      { label: "Turn them away", rhetoric: "belief",
        result: "They were turned away. The brother put his shoulder to the gate once, hard, and the Housekeeper rang the police, and the police came and asked everyone a great many questions. The family went away. They will be back.",
        effects: { familyConcern: 20, record: "guestsKeptFromFamily", outside: { official: 8, village: -4 } } } ] },

  { id: "family-solicitor", kind: "letter", title: "A solicitor's letter", followUpOnly: true, every: 0,
    from: "a firm of solicitors in Leicester, acting for {resident.first}'s family", when: { resident: {} },
    text: "The solicitors write that their clients are concerned for the welfare of their daughter, {resident.name}, and request that she be permitted to contact them by telephone at a time of her choosing, unsupervised, within fourteen days. The letter is courteous. It has been copied to someone; the cc line has been typed and then blacked out.",
    choices: [
      { label: "Arrange the telephone call",
        result: "{resident.first} telephoned her parents from the box in the village, alone, and talked for forty minutes. She came back up the lane with her face blotched and calm. The solicitors have written to say that their clients are satisfied for the present.",
        effects: { familyConcern: -30, outside: { official: -3 } } },
      { label: "Reply through the house's own solicitor (£40)", needs: { money: 40 },
        result: "The house's solicitor replied in kind, at length. The correspondence will go on for some time, at six and eightpence a paragraph.",
        effects: { money: -40, familyConcern: 5, outside: { official: 4 } } } ] },

  { id: "family-solicitor-reason", kind: "letter", title: "A solicitor's letter", followUpOnly: true, every: 0,
    from: "a firm of solicitors in Leicester, acting for {resident.first}'s family", when: { resident: {} },
    text: "The solicitors write that they have reason to believe their clients' daughter, {resident.name}, is being prevented from leaving the property known as {house}, and that her correspondence is being interfered with. They give the house fourteen days to confirm in writing that she is free to leave, and to make her available to speak to them privately. Failing which, they will place the matter in the hands of the police. The letter is not courteous at all.",
    choices: [
      { label: "Let her speak to them privately",
        outcomes: [
          { chance: 0.6, result: "{resident.first} spoke to them from the village box. She did not come back up the lane. Her things were sent on to Leicester the following week.",
            effects: { depart: "left", familyConcern: -100, outside: { official: 2 } } },
          { chance: 0.4, result: "{resident.first} spoke to them for an hour, and came back, and told the Mistress she was staying, and meant it, as far as anyone could tell. The solicitors have written that their clients reserve their position.",
            effects: { familyConcern: -15, outside: { official: 3 } } } ] },
      { label: "Deny everything, through the house's solicitor (£60)", needs: { money: 60 },
        result: "The house's solicitor denied everything, in very good English. The family's solicitors have written to the police.",
        effects: { money: -60, familyConcern: 15, outside: { official: 12 } } } ] },

  { id: "family-police", kind: "visitor", title: "A welfare check", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "Two officers from Wantage have called, at the request of {resident.name}'s family, to see her and satisfy themselves that she is well. They are polite and embarrassed and very large in the hall. They would like to speak to her alone.",
    choices: [
      { label: "Let them speak to her alone",
        result: "They spoke to her alone in the Morning Room for ten minutes and came out satisfied, and rather taken with the house. One of them asked about the roses. They have written in their notebook that she is well and here of her own free will.",
        effects: { familyConcern: -40, outside: { official: -5 } } },
      { label: "Insist on being present",
        result: "{mistress.name} stayed in the room. {resident.first} said she was well. The officers wrote it down, and also wrote down that the Mistress had stayed in the room.",
        effects: { familyConcern: 10, outside: { official: 8 } } } ] },

  { id: "family-police-reason", kind: "visitor", title: "A welfare check", followUpOnly: true, every: 0,
    when: { resident: {} },
    text: "Two officers from Wantage and a woman from the county social services department have called, at the request of {resident.name}'s family. They have a copy of the solicitors' letter. They would like to speak to her alone, and they would also like to see the gate.",
    choices: [
      { label: "Let them speak to her alone",
        outcomes: [
          { chance: 0.6, result: "They spoke to her alone. When they came out, {resident.first} came with them, with a carrier bag of her things, and did not look at anyone. She was driven away in the back of the police car, to her parents.",
            effects: { depart: "left", familyConcern: -100, outside: { official: 10, village: -5 }, pit: 3 } },
          { chance: 0.4, result: "They spoke to her alone, for a long time. She stayed. The woman from social services gave her a card with a telephone number on it, and the officers looked at the padlock on the gate for a long time before they went.",
            effects: { familyConcern: -10, outside: { official: 10 } } } ] },
      { label: "Refuse them entry", rhetoric: "belief",
        result: "{mistress.name} refused them entry without a warrant. They went away to get one. The village watched the police car go up and down the lane twice.",
        effects: { familyConcern: 20, outside: { official: 20, village: -6 }, record: "preventedLeaving", pit: 4 } } ] },

  { id: "ex-husband", kind: "visitor", title: "A husband", every: 52,
    when: { resident: { tie: "ex", background: "wife" }, chance: 0.15 },
    text: "Mr {resident.surname} has arrived in a company Cortina, in a suit with a car coat over it, to say that he is still {resident.first}'s husband in the eyes of the law and the building society, and that he would like his wife back, or failing that, her signature on several documents.",
    choices: [
      { label: "Let her see him in the Morning Room, with the door open",
        result: "{resident.first} saw him for half an hour with the door open and the Housekeeper on the stairs. She signed two of the documents and not the third. He drove off very fast.",
        effects: { resident: { doubt: 3 }, pit: 1, removeTie: "ex" } },
      { label: "Send him away", rhetoric: "belief",
        result: "He was sent away, and stood in the lane for some time explaining his position to the village, which was very interested in it.",
        effects: { outside: { village: -3 }, pit: 1 } } ] },

  { id: "ex-boyfriend", kind: "visitor", title: "An old flame", every: 52,
    when: { resident: { tie: "ex", background: "punk" }, chance: 0.15 },
    text: "A young man with a bleached crop and a leather jacket covered in badges has been sitting on the wall at the end of the drive since breakfast, playing a cassette of something loud, waiting for {resident.name}. He says she owes him a tenner and an explanation.",
    choices: [
      { label: "Give him the tenner, and let her give him the explanation",
        result: "{resident.first} went down to the wall and talked to him for an hour. He went away with the tenner and without her, playing something slower.",
        effects: { money: -10, resident: { doubt: 2 }, removeTie: "ex" } },
      { label: "Leave him on the wall", rhetoric: "play",
        result: "He sat on the wall until it rained. The village found him very picturesque.",
        effects: { pit: 2, outside: { village: -2 } } } ] },

  /* ================= The village ================= */

  { id: "village-fete", kind: "incident", title: "The church fête", every: 52,
    when: { season: "summer", outside: { villageAbove: 25 }, chance: 0.5 },
    text: "The vicar has asked, a little nervously, whether the house would care to take a stall at the church fête. Last year's cake stall was run by Mrs Pargeter and was, everyone agrees, a disappointment.",
    choices: [
      { label: "Take a cake stall, in full 1934 (£15)", needs: { money: 15 },
        result: "The house's cake stall sold out by half past two. The household served in aprons and tea-gowns and were photographed for the parish magazine. Mrs Pargeter has not forgiven anybody.",
        effects: { money: -15, outside: { village: 8, press: 1 }, household: { racination: 1 } } },
      { label: "Run the tombola, in mufti", rhetoric: "play",
        result: "The house ran the tombola in ordinary clothes and nobody noticed anything at all, which was very restful for everybody.",
        effects: { outside: { village: 4 }, pit: 1 } },
      { label: "Decline, politely",
        result: "The house declined. The vicar was relieved, and then sorry.",
        effects: { outside: { village: -1 } } } ] },

  { id: "village-parish-council", kind: "letter", title: "The parish council", every: 26,
    from: "the clerk to the parish council", when: { outside: { villageBelow: 45 }, guestsAtLeast: 1, chance: 0.35 },
    text: "The clerk writes that the parish council has received complaints about the number of strangers in period costume at the bus stop, singing, and about a gramophone audible from the lane after ten o'clock. The council would be grateful for the house's cooperation.",
    choices: [
      { label: "Promise quiet after nine, and send the guests by taxi (£10)", needs: { money: 10 },
        result: "The house promised quiet and paid for taxis. The parish council minuted its appreciation.",
        effects: { money: -10, outside: { village: 5 } } },
      { label: "Reply that the gramophone is a 1931 Decca and entirely respectable", rhetoric: "play",
        result: "The reply was read out at the next meeting. Two councillors laughed. Three did not.",
        effects: { outside: { village: -2, official: 2 } } } ] },

  { id: "village-shop", kind: "incident", title: "The shop", every: 26,
    when: { outside: { villageBelow: 55 }, resident: {}, chance: 0.25 },
    text: "{resident.name} came back from the village shop white and furious. Mrs Pargeter said something to the queue about ‘that lot up at the house’, and the queue laughed, and {resident.first} put the eggs back and walked out.",
    choices: [
      { label: "Go down to the shop yourself, and buy a great deal", needs: { money: 8 },
        result: "{mistress.name} went down to the shop in her best and bought a great deal, very graciously, and asked after Mrs Pargeter's mother's hip. Mrs Pargeter was disarmed, for the moment.",
        effects: { money: -8, outside: { village: 4 }, resident: { doubt: -1 } } },
      { label: "Take the house's custom to Wantage", rhetoric: "belief",
        result: "The house shops in Wantage now. The village notices, and draws its own conclusions.",
        effects: { outside: { village: -4 }, pit: -1 } } ] },

  { id: "village-vicar", kind: "visitor", title: "The vicar calls", every: 52,
    when: { outside: { villageAbove: 45 }, chance: 0.3 },
    text: "The vicar has called, on his bicycle, to say that the harvest festival is on Sunday week and that the house would be very welcome, and to ask, rather wistfully, whether it is true that the house says Compline.",
    choices: [
      { label: "Accept, and bring the whole household", rhetoric: "belief",
        result: "The household came to the harvest festival in their best, and sang the hymns better than the choir, and brought a marrow. The vicar preached on the lilies of the field with his eyes fixed firmly on the house's pew.",
        effects: { outside: { village: 6 }, household: { devotion: 1 } } },
      { label: "Accept, and go alone",
        result: "{mistress.name} went alone, and was introduced to everyone, and was very charming to the churchwardens.",
        effects: { outside: { village: 3 } } },
      { label: "Decline, with thanks",
        result: "The house has its own Chapel, and said so, very kindly. The vicar cycled off looking rather sad.",
        effects: {} } ] },

  { id: "village-wi", kind: "letter", title: "An invitation from the WI", every: 52,
    from: "the secretary of the Women's Institute", when: { outside: { villageAbove: 60 }, chance: 0.35 },
    text: "The secretary writes to ask whether a lady from the house would give a talk to the Institute on ‘Housekeeping in the Thirties’, with demonstration, at the village hall. There would be tea.",
    choices: [
      { label: "Send the best cook in the house", needs: { skill: { cookery: 3 } },
        result: "The talk was a triumph. The demonstration (a Victoria sponge, a Bakewell tart and a proper steamed pudding) was eaten to the last crumb. Three members asked for the house's prospectus.",
        effects: { outside: { village: 7 }, pit: 1, reputation: 2 } },
      { label: "Go yourself",
        result: "{mistress.name} gave the talk herself, in her {mistress.voice} voice, and held the room. Nobody quite knew what to make of it, but they all came to the next meeting.",
        effects: { outside: { village: 4 } } } ] },

  { id: "village-generosity", kind: "incident", title: "Christmas in the village", every: 52,
    when: { after: "1983-11-30", outside: { villageBelow: 70 }, chance: 0.4 },
    text: "Christmas is coming. The old people's home at the end of the village has asked, through the vicar, whether anyone could spare anything this year.",
    choices: [
      { label: "Send hampers, carols and the household (£30)", needs: { money: 30 },
        result: "The household went down with hampers and sang carols in the day room, in their winter best, and the old people cried, and so did the matron, and so, it was said, did the vicar.",
        effects: { money: -30, outside: { village: 9 }, household: { devotion: 1 } } },
      { label: "Send a cheque (£15)", needs: { money: 15 },
        result: "A cheque was sent. It was gratefully received, and mentioned in the parish magazine.",
        effects: { money: -15, outside: { village: 4 } } },
      { label: "Nothing this year",
        result: "Nothing was sent this year. The village noticed.",
        effects: { outside: { village: -3 } } } ] },

  { id: "village-hostile", kind: "incident", title: "A petition in the village", every: 26,
    when: { outside: { villageBelow: 30 }, chance: 0.35 },
    text: "A petition is going round the village, kept on the counter at the shop, asking the district council to ‘look into’ the house. It has forty names on it, including two of the house's own tradesmen.",
    choices: [
      { label: "Ask the vicar to speak for the house",
        result: "The vicar spoke for the house at the parish meeting, bravely and at length. The petition went to the council anyway, with forty-three names.",
        effects: { outside: { official: 6, village: 2 } } },
      { label: "Ignore it", rhetoric: "belief",
        result: "The house ignored it. The district council did not.",
        effects: { outside: { official: 10 } } } ] },

  { id: "village-warning", kind: "incident", title: "A word to the wise", every: 26,
    when: { outside: { villageAbove: 70, officialAbove: 25 }, chance: 0.4 },
    text: "Mrs Pargeter, of all people, sent her boy up with a note: there is a man from the council asking questions in the Bell, and she thought the house would want to know. The note ends ‘No offence meant’.",
    choices: [
      { label: "Thank her, and put the house in order",
        result: "The house was put in order: the fire buckets filled, the paperwork found, the guest register written up. When the man from the council came, he found nothing to write down, and went away puzzled.",
        effects: { outside: { official: -10, village: 2 } } } ] },

  /* ================= The authorities ================= */

  { id: "council-fire", kind: "visitor", title: "A fire officer", every: 52,
    when: { outside: { officialAbove: 20 }, chance: 0.3 },
    text: "A fire officer from the county has called to inspect the house's arrangements for paying guests. He would like to see the fire exits, the extinguishers, the electrical wiring and, he says, looking at the paraffin lamps with deep suspicion, ‘all this’.",
    choices: [
      { label: "Do everything he asks (£90)", needs: { money: 90 },
        result: "Extinguishers have been bought, exit signs put up (in a typeface nobody likes) and the worst of the wiring renewed. He has signed the certificate.",
        effects: { money: -90, outside: { official: -6 }, pit: 2 } },
      { label: "Argue that the house is a private home",
        result: "{mistress.name} argued that the house is a private home with friends staying. He wrote that down, and the number of friends, and the amount they pay.",
        effects: { outside: { official: 8 }, reputation: -2 } } ] },

  { id: "council-planning", kind: "letter", title: "Change of use", every: 52,
    from: "the district council's planning department",
    when: { outside: { officialAbove: 30 }, rule: { guestIntake: ["regular", "full"] }, chance: 0.3 },
    text: "The planning department writes that it has come to its attention that the property is being used as a guest house without the necessary consent for change of use, and invites the house to apply retrospectively, or to cease.",
    choices: [
      { label: "Apply, with an architect's drawings (£120)", needs: { money: 120 },
        result: "An application has gone in, with drawings, and a fee, and a covering letter of great length. It will take months.",
        effects: { money: -120, outside: { official: -8 } } },
      { label: "Take fewer guests for a while",
        result: "The house has taken its guest intake down to occasional, and written to say so.",
        effects: { outside: { official: -4 }, setRule: { guestIntake: "occasional" } } },
      { label: "Ignore it",
        result: "The letter was ignored. Another has come, with a reference number.",
        effects: { outside: { official: 10 } } } ] },

  { id: "revenue-letter", kind: "letter", title: "The Inland Revenue", every: 52,
    from: "H.M. Inspector of Taxes, Oxford",
    when: { outside: { officialAbove: 15 }, moneyAbove: 1500, chance: 0.25 },
    text: "H.M. Inspector of Taxes has written to enquire into the house's income from paying guests, publications, needlework and, it appears, computer software, none of which appears on any return he has been able to find.",
    choices: [
      { label: "Engage an accountant and pay what is owed (£250)", needs: { money: 250 },
        result: "An accountant from Abingdon has gone through everything, pursing his lips, and the house has paid. The Inspector is satisfied, and has filed the house under ‘eccentric but honest’.",
        effects: { money: -250, outside: { official: -10 } } },
      { label: "Plead that the house is a religious community", rhetoric: "belief",
        outcomes: [
          { chance: 0.4, result: "The Inspector, a Methodist, accepted that a good part of it was voluntary contribution. The house paid a little, and was thanked.",
            effects: { money: -60, outside: { official: -3 } } },
          { chance: 0.6, result: "The Inspector did not accept it, and has opened an enquiry, which will cost a great deal more in the end.",
            effects: { money: -150, outside: { official: 10 } } } ] } ] },

  { id: "police-enquiry", kind: "visitor", title: "A detective constable", every: 39,
    when: { outside: { officialAbove: 55 }, chance: 0.3 },
    text: "A detective constable from Abingdon has called, ‘just to put a face to the name’. He has had letters, and a petition, and two telephone calls from families. He is sure there is nothing in any of it. He would like a look round, if it is no trouble.",
    choices: [
      { label: "Show him everything",
        result: "He was shown everything, and given tea, and went away with nothing in his notebook but the word ‘odd’, underlined.",
        effects: { outside: { official: -8 }, pit: 1 } },
      { label: "Show him the public rooms only",
        result: "He was shown the Drawing Room and the garden. He asked to see the Chamber, and was told it was a box room. He has made a note of that.",
        effects: { outside: { official: 5 } } } ] }
];
