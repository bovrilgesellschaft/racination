/*
  RACINATION — data/slide-events.js
  ---------------------------------------------------------------
  Milestone 9b: the events of the Slide. The household's petitions
  for Ordinances, the Mistress's own sleepless proposals, the
  devout's petitions against Concessions, and incursions of the Pit.

  The format is the one in WRITING-EVENTS.md, with these extras:

    when: { slide: { petition: "silence" } }      the household petitions for that Ordinance
                                                   (only once it is thinkable; more often as the Pit rises)
    when: { slide: { proposal: "silence" } }      the Mistress considers it herself
    when: { slide: { removal: "radio" } }         the devout petition against that Concession
    when: { slide: { incursion: "transistor", band: "damp" } }
                                                   an incursion of the Pit, from that band upwards;
                                                   a Concession that ends it stops it happening
    effects: { slide: { adopt: "silence" } }      the Ordinance is adopted
    effects: { slide: { refuse: true } }          a petition refused: the devout are hurt
    effects: { slide: { withdraw: "radio" } }     the Concession is withdrawn
    effects: { slide: { keep: "radio" } }         the Concession is kept against the devout's wishes

  Ordinances never come any other way. There is no button for them.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.slideEvents = [

  /* ================= The household's petitions ================= */

  { id: "petition-silence", kind: "incident", title: "A petition for the Silence", every: 13,
    when: { slide: { petition: "silence" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} came to the Study in tears. She had heard two of the household at supper discussing a television programme, in detail, with relish, and nobody had stopped them. She asks, with five names under hers, that the house keep silence about the outside world at table and on the stairs. ‘Only until the Pit is lower,’ she says.",
    choices: [
      { label: "Grant it: the Silence", rhetoric: "belief",
        result: "The Ordinance of the Silence was granted. {resident.first} kissed the Mistress's hand, which she has never done before.",
        effects: { slide: { adopt: "silence" }, resident: { devotion: 3 } } },
      { label: "Refuse it, kindly",
        result: "{mistress.name} said that a house which cannot bear to hear about the television is a house afraid of it. {resident.first} went away unconvinced, and the five names with her.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-clearing", kind: "incident", title: "A petition for a Clearing", every: 13,
    when: { slide: { petition: "clearing" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} has found, in one week, a hairdryer, a Walkman, two magazines and a packet of cigarettes in the household's rooms. She has made a list. She asks that everything modern in the house be gathered up and burnt, once and for all, and the house begin again clean.",
    choices: [
      { label: "Grant it: the Clearing", rhetoric: "belief",
        result: "The Clearing was granted. {resident.first} went round the house that evening with a laundry basket and a look of great peace.",
        effects: { slide: { adopt: "clearing" }, resident: { devotion: 3 } } },
      { label: "Refuse it, kindly",
        result: "{mistress.name} said that the house does not burn its members' belongings. {resident.first} folded her list very small and put it in her pocket.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-vigils", kind: "incident", title: "A petition for Vigils", every: 13,
    when: { slide: { petition: "vigils" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} asks that the Chapel be kept by night, two at a time, so that the house is never without someone at prayer while the Pit is in the lane. She has drawn up a rota already, in her best hand. Her own name is on it four times.",
    choices: [
      { label: "Grant it: Vigils", rhetoric: "belief",
        result: "Vigils were granted. {resident.first} kept the first one herself, and came down to Matins radiant and swaying.",
        effects: { slide: { adopt: "vigils" }, resident: { devotion: 3 } } },
      { label: "Refuse it, kindly",
        result: "{mistress.name} said that the household needs its sleep more than the Chapel needs its company. {resident.first} kept vigil alone that night anyway.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-post", kind: "incident", title: "A petition about the post", every: 13,
    when: { slide: { petition: "post" }, resident: { devotionAbove: 60 } },
    text: "A letter came for one of the household from an old friend, full of news about jobs and flats and a party in Camden, and she cried all evening and talked of leaving. {resident.name} asks, with the Housekeeper's support, that the post be read before it is handed out. ‘To spare them,’ she says. ‘Only what would hurt them need be kept back.’",
    choices: [
      { label: "Grant it: the Opened Post", rhetoric: "belief",
        result: "It was granted. The Housekeeper took the letter-knife from the hall table to her parlour that afternoon.",
        effects: { slide: { adopt: "post" }, resident: { devotion: 3 } } },
      { label: "Refuse it: a woman's letters are her own",
        result: "{mistress.name} said that a woman's letters are her own, whatever is in them. {resident.first} said that the Pit would be grateful, and left the Study rather quickly.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-faults", kind: "incident", title: "A petition for a Book of Faults", every: 13,
    when: { slide: { petition: "faults" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} says that the Pit gets in through small things that nobody sees, or that everybody sees and nobody mentions. She asks that a book be kept on the hall table, and that each woman write in it the faults she sees in her sisters, out of love, so that they can be corrected before they grow.",
    choices: [
      { label: "Grant it: the Book of Faults", rhetoric: "belief",
        result: "It was granted. {resident.first} bought the book herself in Wantage: green cloth, ruled in columns. She wrote the first entry that evening.",
        effects: { slide: { adopt: "faults" }, resident: { devotion: 3 } } },
      { label: "Refuse it",
        result: "{mistress.name} said that the house would not set its women to watch one another. {resident.first} said that they watched one another already, and the only question was whether it was written down.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-confession", kind: "incident", title: "A petition for Confession", every: 13,
    when: { slide: { petition: "confession" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} has confessed to the Mistress, unasked, that she listened to a pop song in the village shop and enjoyed it. She says she has not slept for the shame of it. She asks that every woman confess her faults aloud at Matins, so that nothing festers in the dark where the Pit can feed on it.",
    choices: [
      { label: "Grant it: Confession", rhetoric: "belief",
        result: "It was granted. {resident.first} made the first confession the next morning, and wept, and was embraced by the whole household, and has never looked happier.",
        effects: { slide: { adopt: "confession" }, resident: { devotion: 3 } } },
      { label: "Refuse it",
        result: "{mistress.name} told her that a pop song in a shop is not a sin, and that she should sleep. {resident.first} did not sleep.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-severance", kind: "incident", title: "A petition for Severance", every: 13,
    when: { slide: { petition: "severance" }, resident: { devotionAbove: 60 } },
    text: "A mother came to the gate on Sunday and stood there shouting until one of the household went down to her, and that woman has been in pieces since. {resident.name} asks, with the Housekeeper's name first on the list, that the house cut itself off from families altogether. ‘They are not our families any more,’ she says. ‘We are.’",
    choices: [
      { label: "Grant it: Severance", rhetoric: "belief",
        result: "Severance was granted. The house is the household's family now. {resident.first} went to the Chapel to give thanks.",
        effects: { slide: { adopt: "severance" }, resident: { devotion: 3 } } },
      { label: "Refuse it",
        result: "{mistress.name} said that no woman in the house will be cut off from her mother by the house's order. {resident.first} said nothing, which was worse.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-gate", kind: "incident", title: "A petition about the gate", every: 13,
    when: { slide: { petition: "gate" }, resident: { devotionAbove: 60 } },
    text: "Two women left last month in the night, and one of them came back in the morning in tears, saying she had not known what she was doing. {resident.name} asks that no one be permitted to leave without the Mistress's leave, ‘to protect them from themselves when the Pit is strong.’ She has brought a padlock. It is new, and has two keys.",
    choices: [
      { label: "Grant it: the Gate", rhetoric: "belief",
        result: "The Gate was granted. {resident.first} fitted the padlock herself and gave both keys to the Mistress, and seemed lighter for it.",
        effects: { slide: { adopt: "gate" }, resident: { devotion: 3 } } },
      { label: "Refuse it: the house keeps no one",
        result: "{mistress.name} said that the house keeps no one who wishes to go. {resident.first} left the padlock on the hall table. It is still there.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-shunning", kind: "incident", title: "A petition against the doubting", every: 13,
    when: { slide: { petition: "shunning" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} says that doubt is catching, and that three of the household are spreading it at supper, and that the rest of them cannot keep the Pit out while it sits at their own table. She asks that a woman who doubts not be spoken to until she has confessed it. ‘For her own sake,’ she says. ‘Silence is a kind of mercy.’",
    choices: [
      { label: "Grant it: Shunning", rhetoric: "belief",
        result: "It was granted. {resident.first} moved her chair to the other end of the table that evening.",
        effects: { slide: { adopt: "shunning" }, resident: { devotion: 3 } } },
      { label: "Refuse it",
        result: "{mistress.name} said that the house does not send its women to Coventry. {resident.first} said that the house would not need to, soon.",
        effects: { slide: { refuse: true } } } ] },

  { id: "petition-fold", kind: "incident", title: "A petition for the Fold", every: 13,
    when: { slide: { petition: "fold" }, resident: { devotionAbove: 60 } },
    text: "The household, nearly all of it, came to the Study together after Compline, with {resident.name} at its head. They ask to take a vow: of absolute obedience to the Mistress and the house, and to give up to the house their money and their papers, so that there is nothing left in them for the Pit to hold on to. Some of them are crying. All of them mean it.",
    choices: [
      { label: "Receive the vow: the Fold", rhetoric: "belief",
        result: "The vow of the Fold was received. {resident.first} was the first to kneel.",
        effects: { slide: { adopt: "fold" }, resident: { devotion: 5 } } },
      { label: "Refuse it",
        result: "{mistress.name} told them that she would not take their freedom, even as a gift. They went out of the Study one by one, very quietly, and the house felt larger and colder for it.",
        effects: { slide: { refuse: true } } } ] },

  /* ================= The Mistress's own proposals ================= */

  { id: "proposal-silence", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "silence" } },
    text: "{mistress.name} could not sleep. She lay and listened to the house and thought: if only they did not talk about it. If the outside world were simply not spoken of, at table, on the stairs, it would have nowhere to live. Only for a season.",
    choices: [
      { label: "Ordain the Silence", rhetoric: "belief",
        result: "At Matins {mistress.name} ordained the Silence. The devout were overjoyed. Nobody else said anything, which was, after all, the point.",
        effects: { slide: { adopt: "silence" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and lay awake a long time after.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-clearing", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "clearing" } },
    text: "{mistress.name} could not sleep. She thought of all the small modern things hidden in the household's drawers, a lipstick here, a cassette there, each one a door left ajar. One bonfire, and the house would be clean.",
    choices: [
      { label: "Ordain a Clearing", rhetoric: "belief",
        result: "{mistress.name} ordained a Clearing for Saturday. She was surprised how many of the household thanked her.",
        effects: { slide: { adopt: "clearing" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away. It had smelled of smoke.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-vigils", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "vigils" } },
    text: "{mistress.name} lay awake and thought that if she could not sleep, someone at least ought to be praying. Perhaps the house should never be left unwatched in the dark.",
    choices: [
      { label: "Ordain Vigils", rhetoric: "belief",
        result: "{mistress.name} ordained Vigils, and kept the first herself, and the house loved her for it.",
        effects: { slide: { adopt: "vigils" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and lit a candle in her own window instead.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-post", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "post" } },
    text: "{mistress.name} thought of the letters that came every morning: from mothers and friends and banks and old lovers, each one a hand reaching in. Perhaps, if the post were read first. Only what would wound them need be kept back. Only for a season.",
    choices: [
      { label: "Ordain the Opened Post", rhetoric: "belief",
        result: "{mistress.name} ordained it at Matins. The Housekeeper nodded, as if she had been expecting it.",
        effects: { slide: { adopt: "post" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away. A woman's letters are her own. She said it aloud to the dark, to be sure.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-faults", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "faults" } },
    text: "{mistress.name} thought: I cannot see everything. But together they see everything. If they told one another, lovingly, what they saw, nothing could grow in the dark.",
    choices: [
      { label: "Ordain the Book of Faults", rhetoric: "belief",
        result: "{mistress.name} ordained the Book of Faults. It was full within the month.",
        effects: { slide: { adopt: "faults" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and was frightened by how reasonable it had seemed.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-confession", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "confession" } },
    text: "{mistress.name} thought that the house had too many secrets, and that every secret was a room the Pit could live in. If every fault were said aloud at Matins, there would be no rooms left.",
    choices: [
      { label: "Ordain Confession", rhetoric: "belief",
        result: "{mistress.name} ordained Confession, and made the first one herself, and the household wept.",
        effects: { slide: { adopt: "confession" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and with it a fault of her own that she had been meaning to confess.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-severance", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "severance" } },
    text: "{mistress.name} thought of the mothers at the gate, the fathers on the telephone in the village box, the sisters with their offers of a spare room. The household would be at peace if it had no other family. They are not her daughters. And yet.",
    choices: [
      { label: "Ordain Severance", rhetoric: "belief",
        result: "{mistress.name} ordained Severance. The letters from home will go back unopened from now on.",
        effects: { slide: { adopt: "severance" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and wrote to her own sister for the first time in years.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-gate", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "gate" } },
    text: "{mistress.name} thought of the women who had gone down the drive in the night and been swallowed up. If the gate were locked, only for a while, only until the Pit was lower, nobody need be lost in a bad hour.",
    choices: [
      { label: "Ordain the Gate", rhetoric: "belief",
        result: "{mistress.name} ordained the Gate. The padlock was fitted by noon.",
        effects: { slide: { adopt: "gate" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away. A house that locks its gate is a prison, whatever it calls itself.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-shunning", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "shunning" } },
    text: "{mistress.name} thought of the doubters at the far end of the table, and how their doubt spread like damp. If no one answered it, it would have nothing to feed on.",
    choices: [
      { label: "Ordain Shunning", rhetoric: "belief",
        result: "{mistress.name} ordained it. The far end of the table went quiet that evening, and has stayed quiet.",
        effects: { slide: { adopt: "shunning" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and sat at the far end of the table at supper, and talked to the doubters until Compline.",
        effects: { mistressDoubt: 1 } } ] },

  { id: "proposal-fold", kind: "incident", title: "A thought at three in the morning", every: 13,
    when: { slide: { proposal: "fold" } },
    text: "{mistress.name} thought: they would give me everything, if I asked. Their money, their names, their wills. And then there would be nothing left of them for the Pit to take.",
    choices: [
      { label: "Ask for the vow of the Fold", rhetoric: "belief",
        result: "{mistress.name} asked for the vow. Every woman in the house gave it.",
        effects: { slide: { adopt: "fold" } } },
      { label: "Put the thought away",
        result: "{mistress.name} put the thought away, and was sick in the washbasin, and did not know why.",
        effects: { mistressDoubt: 2 } } ] },

  /* ================= The devout against a Concession ================= */

  { id: "removal-underclothes", kind: "incident", title: "A petition about underclothes", every: 26,
    when: { slide: { removal: "underclothes" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} has seen, on the washing line, a garment that she describes only as ‘elastic’. She asks that the concession be withdrawn.",
    choices: [
      { label: "Withdraw it", result: "The concession was withdrawn. The washing line is entirely 1934 again.", effects: { slide: { withdraw: "underclothes" } } },
      { label: "Keep it", result: "{mistress.name} said that what a woman wears under her frock is between her and the Goddess. {resident.first} was not consoled.", effects: { slide: { keep: true } } } ] },

  { id: "removal-books", kind: "incident", title: "A petition about the Library", every: 26,
    when: { slide: { removal: "books" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} found three of the household reading a novel of 1979 in the Library, aloud, and laughing. She asks that books written after 1940 be put out of the house again.",
    choices: [
      { label: "Withdraw it", result: "The modern books went into a box in the garage, and from there to the church jumble sale.", effects: { slide: { withdraw: "books" } } },
      { label: "Keep it", result: "{mistress.name} said that a book is not the Pit merely because it is recent. {resident.first} said that in her experience it usually was.", effects: { slide: { keep: true } } } ] },

  { id: "removal-newspaper", kind: "incident", title: "A petition about the newspaper", every: 26,
    when: { slide: { removal: "newspaper" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} asks that the daily newspaper be stopped. There was a picture in it this morning that she will not describe, and two of the household argued about the government over the marmalade.",
    choices: [
      { label: "Withdraw it", result: "The paper was stopped. Breakfast is quiet again.", effects: { slide: { withdraw: "newspaper" } } },
      { label: "Keep it", result: "{mistress.name} said that the house must know what it is standing against. {resident.first} said that it knew.", effects: { slide: { keep: true } } } ] },

  { id: "removal-radio", kind: "incident", title: "A petition about the radio", every: 26,
    when: { slide: { removal: "radio" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} asks that the radio be taken out of the house. It was meant for the dance bands, she says, and the household now leaves it on for the news, and the news is the Pit's own voice.",
    choices: [
      { label: "Withdraw it", result: "The radio went back to the shop in Wantage. The household listens to the gramophone, and pretends not to miss the news.", effects: { slide: { withdraw: "radio" } } },
      { label: "Keep it", result: "{mistress.name} kept it. {resident.first} now leaves any room it is playing in.", effects: { slide: { keep: true } } } ] },

  { id: "removal-telephone", kind: "incident", title: "A petition about the telephone", every: 26,
    when: { slide: { removal: "telephone" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} asks that the telephone be taken out. It rings at all hours, she says, with mothers and banks and men who will not give their names, and every time it rings someone in the house goes pale.",
    choices: [
      { label: "Withdraw it", result: "The telephone was disconnected. The village box is a mile away, which {resident.first} says is exactly the right distance.", effects: { slide: { withdraw: "telephone" } } },
      { label: "Keep it", result: "{mistress.name} said that the household's families must be able to reach them. {resident.first} said that was rather the problem.", effects: { slide: { keep: true } } } ] },

  { id: "removal-clothes", kind: "incident", title: "A petition about dress", every: 26,
    when: { slide: { removal: "clothes" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} saw a woman of the house in jeans in the kitchen garden, and asks, shaking, whether the house still believes anything at all.",
    choices: [
      { label: "Withdraw it", result: "The concession was withdrawn. The jeans went in the bonfire, and their owner went to her room.", effects: { slide: { withdraw: "clothes" } } },
      { label: "Keep it", result: "{mistress.name} said that the house believes a great deal, and that none of it is in a pair of trousers. {resident.first} was not answered by this.", effects: { slide: { keep: true } } } ] },

  { id: "removal-television", kind: "incident", title: "A petition about the television", every: 26,
    when: { slide: { removal: "television" }, resident: { devotionAbove: 60 } },
    text: "{resident.name} came to the Study white to the lips. The household watched a game show last night in the Drawing Room, all of it, and laughed, and nobody said Compline. She asks that the television be taken out of the house before it takes the house.",
    choices: [
      { label: "Withdraw it", result: "The television was carried out to the garage and covered with a dust sheet. The Drawing Room looks larger without it, and emptier.", effects: { slide: { withdraw: "television" } } },
      { label: "Keep it", result: "{mistress.name} kept it. {resident.first} said Compline alone in the Chapel, loudly.", effects: { slide: { keep: true } } } ] },

  /* ================= Incursions of the Pit ================= */

  { id: "incursion-transistor", kind: "incident", title: "A transistor radio", every: 13, incursion: true,
    when: { slide: { incursion: "transistor", band: "damp" }, resident: {} },
    text: "A transistor radio was found under {resident.name}'s pillow, still warm, tuned to a station that plays nothing but the Top Forty.",
    choices: [
      { label: "Confiscate it, gently", result: "The radio was confiscated. {resident.first} said she only listened to it to fall asleep. It is probably true.", effects: { resident: { doubt: 2 }, pit: -1 } },
      { label: "Let her keep it", rhetoric: "play", result: "She kept it. The house heard it, faintly, every night after that.", effects: { pit: 1 } } ] },

  { id: "incursion-paperback", kind: "incident", title: "A paperback", every: 13, incursion: true,
    when: { slide: { incursion: "paperback", band: "damp" }, resident: {} },
    text: "{resident.name} was found reading a paperback thriller of 1982 in the airing cupboard, by torchlight. It has a gun on the cover.",
    choices: [
      { label: "Take it from her", result: "The book was taken. {resident.first} asked, very quietly, whether she might at least know how it ended.", effects: { resident: { doubt: 2 }, pit: -0.5 } },
      { label: "Ask how it ends", rhetoric: "play", result: "{mistress.name} asked her how it ended. {resident.first} told her. It ended badly, which they agreed was the Pit all over.", effects: { pit: 0.5, resident: { doubt: -1 } } } ] },

  { id: "incursion-nylons", kind: "incident", title: "On the washing line", every: 13, incursion: true,
    when: { slide: { incursion: "nylons", band: "damp" }, resident: {} },
    text: "Garments of a distinctly modern cut were found on the washing line. {resident.name} has owned up to them, crimson, in the scullery.",
    choices: [
      { label: "Have them burnt", result: "They were burnt. {resident.first} has gone back to the house's own, and to chafing.", effects: { resident: { doubt: 2 }, pit: -0.5 } },
      { label: "Let it pass", rhetoric: "play", result: "{mistress.name} let it pass. The washing line remains a matter of some comment.", effects: { pit: 0.5 } } ] },

  { id: "incursion-newspaper", kind: "incident", title: "A newspaper", every: 13, incursion: true,
    when: { slide: { incursion: "newspaper", band: "seepage" }, resident: {} },
    text: "{resident.name} has been buying a newspaper in the village every morning and reading it behind the potting shed. She knows who the Chancellor is. She knows a great deal.",
    choices: [
      { label: "Forbid it", result: "It was forbidden. {resident.first} still walks past the shop every morning, and slows down.", effects: { resident: { doubt: 3 }, pit: -1 } },
      { label: "Ask her what is in it", rhetoric: "play", result: "{mistress.name} asked her what was in it, and listened for half an hour, and was appalled, and laughed. So did {resident.first}.", effects: { pit: 1, resident: { doubt: -1 } } } ] },

  { id: "incursion-relatives", kind: "visitor", title: "Relatives at the gate", every: 13, incursion: true,
    when: { slide: { incursion: "relatives", band: "seepage" }, resident: { tie: "family" } },
    text: "{resident.name}'s parents arrived unannounced in a Rover, and stood at the gate, and asked to see their daughter, and would not go away.",
    choices: [
      { label: "Let them see her", result: "They saw her, in the Morning Room, for an hour. Her mother cried. {resident.first} cried. Everybody went away worse.", effects: { resident: { doubt: 4 }, pit: 2 } },
      { label: "Send them away", rhetoric: "belief", result: "They were sent away. {resident.first} watched the Rover go from an upstairs window, and did not come down to supper.", effects: { resident: { doubt: 3, devotion: 2 }, record: "guestsKeptFromFamily" } } ] },

  { id: "incursion-jeans", kind: "incident", title: "At the bus stop", every: 13, incursion: true,
    when: { slide: { incursion: "jeans", band: "seepage" }, resident: { racinationBelow: 50 } },
    text: "{resident.name} was found at the bus stop on the Wantage road in jeans and a cagoule, with no luggage, crying. She said she did not know where she had been going.",
    choices: [
      { label: "Bring her home and say nothing", result: "She was brought home. Nothing was said. The jeans are in the bottom of her wardrobe, and she knows exactly where.", effects: { resident: { doubt: 3 }, pit: 2 } },
      { label: "Bring her home to the Chapel", rhetoric: "belief", result: "She was brought home to the Chapel, and the household prayed over her, and she was very grateful, and has not been quite herself since.", effects: { resident: { devotion: 3, racination: -2 } } } ] },

  { id: "incursion-television", kind: "incident", title: "In the potting shed", every: 13, incursion: true,
    when: { slide: { incursion: "television", band: "seepage" }, resident: {} },
    text: "A portable television, battery-operated, was found in the potting shed, with a deckchair in front of it and a rug. {resident.name} has been watching the snooker.",
    choices: [
      { label: "Smash it", rhetoric: "belief", result: "The Housekeeper smashed it with a spade in front of the household. It went on talking for a moment after the screen broke, which everybody found very hard to forget.", effects: { resident: { doubt: 4 }, pit: -2, record: "propertyDestroyed" } },
      { label: "Confiscate it", result: "It was confiscated, and locked in the cellar. Someone has been heard down there since, at snooker times.", effects: { resident: { doubt: 2 }, pit: -1 } } ] },

  { id: "incursion-word", kind: "incident", title: "On the scullery wall", every: 13, incursion: true,
    when: { slide: { incursion: "word", band: "flood" } },
    text: "Someone has written on the scullery wall, in lipstick, a word that the house does not have in its vocabulary. It has been scrubbed off. Everybody knows who wrote it. Nobody will say.",
    choices: [
      { label: "Ask at Matins who wrote it", rhetoric: "belief", result: "{mistress.name} asked at Matins. Nobody answered. The silence went on for a very long time.", effects: { household: { doubt: 1.5 }, pit: -1 } },
      { label: "Paint over it, and let it be", result: "The wall was painted over. The word shows through in certain lights.", effects: { pit: 2 } } ] },

  { id: "incursion-lane", kind: "incident", title: "Cars in the lane", every: 13, incursion: true,
    when: { slide: { incursion: "lane", band: "flood" } },
    text: "Cars have begun to park in the lane at night, with their radios on, and young men in them who shout things at the windows. The village says it is a dare. The house says nothing, and draws the curtains.",
    choices: [
      { label: "Call the police", result: "The police came, eventually, and moved them on, and asked a great many questions about the house while they were there.", effects: { pit: 1, record: "journalistKnown" } },
      { label: "Pray louder", rhetoric: "belief", result: "Compline was said very loudly, with the windows open. The cars went away. They came back on Friday.", effects: { household: { devotion: 1, doubt: 1 }, pit: 1 } } ] }
];
