window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "courtship-gramophone.js", text: `

# A courtship evening between two residents: the gramophone and dancing.

=== scene: courtship-gramophone
title: An evening at the gramophone
participants: partner, beloved
trigger: courtship(with = resident)
outcome: racination +1, bond +1
room: the Drawing Room

--- beat: opening
[gaslight]
After supper the rugs in {room} were rolled back and the gramophone wound. The others danced for a while and then, with a tact so heavy it could be heard, remembered letters to write. {partner.name} and {beloved.name} were left with a stack of bendies and the whole floor.
[candlelight]
After supper the rugs in {room} were rolled back and the gramophone wound, and for an hour the whole household danced, badly and happily, to whatever came out of the record cabinet. Then, with a tact so heavy it could be heard from the stairs, the others remembered letters that would not write themselves.

{partner.first} and {beloved.first} were left alone with a stack of bendies, a pot of cold cocoa and the whole of the floor. For a moment neither of them moved. Then {beloved.first} put on a slow waltz, very carefully, as if the record might break, and held out her hand.
* Dance -> beat: dance

--- beat: dance
[gaslight]
They danced until the needle hissed at the end of the side, and then stood a little longer without music, and then somebody laughed and turned the record over.
[candlelight]
They danced. {beloved.first} led, or {partner.first} did; it changed partway through, and neither of them noticed. The waltz was a Viennese one recorded in a ballroom in 1929, and the dance band sounded as if they were playing from the bottom of a well, and it did not matter in the least.

{partner.first}'s hand was warm through the crêpe at {beloved.first}'s waist. Her {partner.hair} hair smelled of the rinse they all used, rosemary and something cheaper, and at the turn she rested her cheek, for one bar only, against the other woman's. When the needle hissed at the end of the side they stood still in the middle of the floor and did not step apart.
* Turn the record over -> beat: second
* Sit by the fire instead -> beat: fire

--- beat: second
[gaslight]
The second side was a foxtrot, and they made rather a hash of it, laughing, and finished up on the sofa out of breath.
[candlelight]
The second side was a foxtrot, quicker than either of them could manage, and they made a glorious hash of it: trodden toes, a near thing with the standard lamp, {partner.first} laughing so hard she had to hold on to the mantelpiece. They finished up on the sofa in a heap of skirts, out of breath, with their heads tipped back against the cushions, still holding hands without having decided to.
* Go on -> beat: goodnight

--- beat: fire
[gaslight]
They sat on the hearthrug instead, close, and talked in low voices until the fire was nearly out.
[candlelight]
They sat on the hearthrug instead, close enough that their shoulders touched, and talked in the low voices of people who do not want to be overheard by the furniture. {beloved.first} told her about the first time she heard a dance band on the wireless in her grandmother's kitchen. {partner.first} told her something she had never told anyone in the house. The fire burned down to a red glow, and their faces in it were very soft.
* Go on -> beat: goodnight

--- beat: goodnight
[gaslight]
They said goodnight at the turn of the stairs, rather a long goodnight, and went up to their separate rooms with the lamps.
[candlelight]
They said goodnight at the turn of the stairs, by the window where the moon comes in. It was rather a long goodnight. At the end of it {beloved.first} kissed her, once, carefully, the way one touches a thing one has wanted for a long time and is afraid of spoiling, and {partner.first} kissed her back rather less carefully.

Then they went up to their separate rooms with the lamps, and neither of them, the household reported at breakfast, appeared to have slept a great deal.

--- beat: aftercare
[gaslight]
They stopped there, and sat a while by the fire with the cocoa, and nobody minded in the least.
[candlelight]
They stopped there, by one consent or the other, and sat a while on the sofa with the cold cocoa and a rug over their knees, talking about nothing much. Nobody minded in the least. There would be other evenings: that was rather the point of a courtship.
` });
