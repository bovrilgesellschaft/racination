window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "bonding-night.js", text: `

# The night after a bonding. {beloved} may be another resident or the Mistress.

=== scene: bonding-night
title: The bonding night
participants: partner, beloved
trigger: bonding
outcome: racination +2, devotion +1
room: the Blue Room

--- beat: opening
[gaslight]
The household had made up {room} for them while they were at Evensong: clean linen, a fire, a jug of primroses, and a card on the pillow signed by everybody, some of it in verse.
[candlelight]
The household had made up {room} for them while they were still at Evensong: the best linen, aired and lavender-scented; a fire laid and lit; a jug of primroses on the washstand; candles in every holder the house possessed. On the pillow was a card signed by everybody, some of it in verse, most of it bad, all of it meant.

{partner.first} read it twice and had to sit down on the edge of the bed. {beloved.first} closed the door behind them, and the latch fell with a small decided sound, and the house outside the door went entirely, tactfully quiet.
* Go on -> beat: hairpins

--- beat: hairpins
[gaslight]
For a long while they only talked, by the fire, about the day. Then {beloved.first} began, one by one, to take the pins out of {partner.first}'s hair.
[candlelight]
For a long while they only talked, sitting by the fire in their bonding frocks, about the day: who had cried, which hymn had gone wrong, the look on the Housekeeper's face. Then {beloved.first} got up and stood behind the chair and began, one by one, to take the pins out of {partner.first}'s hair.

There were a great many pins. She took her time. Each one went into the china dish on the mantelpiece with a small clear sound, and with each one {partner.first}'s head bent a little further back, until it rested against her, and her {partner.hair} hair came down at last in a heavy fall over both their hands. {partner.first} shut her eyes. Her breathing had changed.
* Go on -> beat: threshold

--- beat: threshold
[gaslight]
What followed belongs to them. The candles were put out, one by one, until only the fire was left; and then, the fire being nobody's business either, we will draw the curtain there.
[candlelight]
Buttons, then: the long row of them down the back of the bonding frock, each one a small separate question asked and answered. Silk sliding away. The cool of the room, and the warmth of the fire on one side, and the greater warmth of each other on the other. {beloved.first}'s mouth at the nape of her neck, where the hair had been. {partner.first} turning in her arms, at last, with a sound that was half a laugh and half something altogether more serious.

The candles were put out, one by one, by whichever of them could reach. The rest was firelight, and murmuring, and the old bed creaking its long approval, and a slowness that had all night in front of it and meant to use every hour.
* Go on -> beat: morning (if with = resident)
* Go on -> beat: morning-mistress (if with = mistress)

--- beat: morning
[gaslight]
In the morning they came down late to breakfast, together, and the household stood up when they came in, which it does not do for anyone but the Mistress.
[candlelight]
In the morning the sun came in at the gap in the curtains and found them asleep in a tangle of linen and {partner.hair} hair, with the card from the household fallen on the floor.

They came down late to breakfast, together, in their ordinary frocks, a little shy and entirely unable to stop looking at one another, and the household stood up when they came in, which it does not do for anyone but the Mistress. Somebody started to clap and was shushed. {partner.first} went scarlet to the hairline, and was, the house agreed afterwards, the happiest thing it had seen since 1969.

--- beat: morning-mistress
[gaslight]
In the morning {partner.first} came down to breakfast alone, a little late, and took her usual place; and when {beloved.name} came in after her, the whole household found something of great interest in its toast.
[candlelight]
In the morning the sun came in at the gap in the curtains and found them asleep, {partner.first}'s {partner.hair} hair spread across both pillows and the household's card fallen on the floor.

She came down to breakfast alone, a little late, and took her usual place at the long table, very upright, and buttered her toast with tremendous care. When {beloved.name} came in after her and said "Good morning" to the room in her ordinary voice, the whole household found something of great interest in its toast, and {partner.first} went scarlet to the hairline, and was, the house agreed afterwards, the happiest thing it had seen since 1969.

--- beat: aftercare
[gaslight]
They stopped, and lay together by the fire wrapped in the eiderdown, and talked until they slept. Nothing more was needed.
[candlelight]
They stopped there, easily, without any trouble about it, and lay together by the fire wrapped in the eiderdown with the primroses on the washstand and the candles guttering, and talked in whispers until they slept. Nothing more was needed. A bond is not a single night; it is all the ones after it.
` });
