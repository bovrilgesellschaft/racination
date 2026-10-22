window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "mistress-evening.js", text: `

# An evening of the Mistress's own courtship.

=== scene: mistress-evening
title: An evening in the Study
participants: mistress, partner
trigger: courtship(with = mistress)
outcome: devotion +1, bond +1
room: the Study

--- beat: opening
[gaslight]
After Compline {mistress.name} sent word that she would be glad of {partner.name}'s company in {room}, if she were not too tired. She was not too tired. She was, the household observed, very carefully not too tired.
[candlelight]
After Compline {mistress.name} sent word down by the Housekeeper that she would be glad of {partner.name}'s company in {room}, if she were not too tired. {partner.first} was not too tired. She was, the household observed over the cocoa, very carefully and very visibly not too tired, and went upstairs to change her stockings before she went.

The Study smelled of {mistress.scent} and the coal fire. There was sherry in the good glasses, which is a thing that had not happened in the Study since the Coronation.
* Sit with her -> beat: talk

--- beat: talk
[gaslight]
They talked. It is not recorded what about. It is recorded that the Housekeeper, passing the door at eleven, heard {partner.first} laughing in a way she had not laughed since she came to the house.
[candlelight]
They talked. {mistress.name} asked her questions in that {mistress.voice} voice, and listened to the answers as if each of them were a letter she had been waiting for: about the life she had left behind her, and what {partner.first} had been afraid of when she first came up the drive, and whether she was still afraid of it.

At some point {mistress.name} reached over and tucked back a strand of {partner.first}'s {partner.hair} hair that had come loose from its pins, and then did not take her hand away at once. {partner.first} went very still, and then leaned, very slightly, into it.
* Take her hand -> beat: hand
* Let the evening rest there -> beat: goodnight

--- beat: hand
[gaslight]
{mistress.name} took her hand, and held it for a long time, while the fire burned down.
[candlelight]
{mistress.name} took her hand and turned it over and looked at it, at the needle-pricks on the fingertips and the ink on the side of the second finger, as if it were something remarkable, and then raised it and kissed the inside of the wrist.

{partner.first} drew a breath that shook all the way down. Neither of them said anything for a long while. The fire burned down. The clock in the hall struck, and struck again, and neither of them counted.
* Go on -> beat: goodnight

--- beat: goodnight
[gaslight]
At the door {mistress.name} wished her goodnight, and {partner.first} went up the stairs as if they were not there.
[candlelight]
At the door {mistress.name} wished her goodnight and kissed her, once, on the forehead, with great formality, as a Mistress may; and then, after a moment, once more, not on the forehead, and with no formality at all.

{partner.first} went up the stairs as if they were not there. The household, which had been listening from three separate landings, retired very quietly to bed and talked about nothing else for a week.

--- beat: aftercare
[gaslight]
They let the evening rest there, by the fire, and it was enough.
[candlelight]
They let the evening rest there, by the fire, with the sherry and the silence, and {mistress.name} said that there was no hurry about anything, and {partner.first} believed her. It was enough. It was, for that evening, a great deal.
` });
