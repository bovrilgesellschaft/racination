window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "working-chamber.js", text: `

# A Working in the Chamber, under any Lady.

=== scene: working-chamber
title: The Working
participants: partner, beloved
trigger: working(site = chamber)
outcome: racination +1, bond +1
room: the Chamber

--- beat: opening
[gaslight]
The Chamber had been made ready while the house was at Compline: the candles set out, the old rug unrolled, the clock on the mantelpiece wound and checked against the wireless at the Housekeeper's insistence. {partner.first} and {beloved.first} came up the back stairs together a quarter of an hour before {lady}'s hour, and shut the door.
[candlelight]
The Chamber had been made ready while the house was at Compline: candles in a ring, the old Turkey rug unrolled, the curtains drawn back so that the window showed the right quarter of the sky, and the clock on the mantelpiece wound and checked against the pips on the wireless, which was the only thing the wireless was ever allowed to do.

{partner.first} and {beloved.first} came up the back stairs together a quarter of an hour before {lady}'s hour, in their white, with their hair down, and shut the door. The room was cold and smelled of candle-wax and of something else, older, that it always smells of now. They did not speak. They had agreed not to, until the words.
* Go on -> beat: purpose

--- beat: purpose
[gaslight]
They knelt facing one another and said aloud, as the notebook requires, what the Working was for: {image}. Then they said the phrase, once each, low: "{phrase}."
[candlelight]
They knelt facing one another in the middle of the ring, close enough for their knees to touch, and said aloud, as the green notebook requires, what the Working was for. {beloved.first} said it first and {partner.first} after her, the same words: {image}. They held it between them, the picture, the way one holds a bowl full to the brim.

Then the phrase, low, each in turn, and then together, until it stopped being words and was only rhythm: "{phrase}." The clock ticked towards the minute. {partner.first}'s hands were cold, and {beloved.first} took them and held them against her own throat to warm them, and did not let go.
* Go on -> beat: working

--- beat: working
[gaslight]
At the minute that {lady} came to the horizon they turned to one another, and what passed between them in the candlelight belongs to them and to the Lady. The candles burned very straight. Nobody in the house below was asleep, though nobody would have said so.
[candlelight]
At the minute {lady} came to the horizon, they turned to one another. It began as a kiss and went on as something the notebook has no name for, only directions: slow, and slower, the picture held all the while behind the eyes; nothing hurried, nothing taken, everything offered. Clothes were unfastened and set aside with the care of vestments. Their breath fell into the rhythm of the phrase and then out of it.

The candles burned very straight and very tall. {partner.first} said the other woman's name once, as if it were the phrase itself; and at the height of it, when the feeling stood up in them like a flame in still air, they both held the picture so hard that for a moment it was more real than the room, and they let it go, together, up and out through the window into the dark where the Lady was.
* Go on -> beat: after

--- beat: after
[gaslight]
Afterwards they lay on the rug in the dark while the candles guttered, and said nothing at all for a long time. The room felt fuller than it had.
[candlelight]
Afterwards they lay tangled on the rug under the old eiderdown while the candles guttered one by one, {partner.first}'s head on the other woman's shoulder, and said nothing at all for a long time. The Chamber felt fuller than it had: warm, as if someone had just left it, or just come in.

"Did it go?" {partner.first} whispered at last. "It went," said {beloved.first}, who could not possibly have known, and they both laughed, very quietly, so as not to disturb whatever was listening.

--- beat: aftercare
[gaslight]
They stopped there, and blew out the candles, and sat close together on the rug with the eiderdown round them until they were warm again. A Working half-kept is no failure. The Lady, the notebook says, is patient.
[candlelight]
They stopped there, by one consent or the other, and blew out the candles, and sat close on the rug with the eiderdown round both their shoulders until the cold went out of their hands. A Working half-kept is no failure, the notebook says: the Lady is patient, and comes round again. They went down the back stairs together at two in the morning, holding hands like conspirators.
` });
