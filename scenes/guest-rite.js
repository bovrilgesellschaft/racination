window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "guest-rite.js", text: `

# A paying guest's rite, at her own asking.

=== scene: guest-rite
title: A guest in the Study
participants: mistress, guest
trigger: guestrite
room: the Study

--- beat: opening
[gaslight]
{guest.name} had come down from {guest.town} for a week of another life, and on the Thursday she asked, very politely, whether the rite she had read about might be kept for her. {mistress.name} said that it might, and named the hour.
[candlelight]
{guest.name} had come down from {guest.town} for a week of another life, and had spent four days of it in borrowed crêpe de Chine, being called "Miss" by women who meant it, and growing visibly less like {guest.job} with every meal.

On the Thursday she asked, very politely and with her colour rising, whether the rite she had read about in the personal columns might be kept for her. {mistress.name} looked at her for a long moment, in that {mistress.voice} way of hers, and said that it might, and named the hour.
* Go on -> beat: nerves (if interest = curious)
* Go on -> beat: eager (if interest = wants)

--- beat: nerves
[gaslight]
At the door of the Study she lost her nerve a little, and was told she might go back to the Drawing Room and nobody would think the worse of her. She came in.
[candlelight]
At the door of the Study she lost her nerve, and stood there in her borrowed frock with one hand on the jamb, laughing at herself in a high unhappy way. {mistress.name} told her that she might go back to the Drawing Room and her cocoa, and that nobody in the house would think the worse of her, and meant it.

There was a pause in which {guest.first} visibly weighed {guest.town}, and the office, and the flat with the electric fire, against the lamplit room in front of her. Then she came in and shut the door herself.
* Go on -> beat: rite

--- beat: eager
[gaslight]
She came to the Study early, and had to wait in the passage, which she seemed to find part of the pleasure.
[candlelight]
She came to the Study ten minutes early and had to wait in the passage outside, on the hard chair under the barometer, which she seemed to find a large part of the pleasure. When the door opened she rose so quickly that she knocked the chair over, and set it right again, and went in with her chin up and her eyes shining.
* Go on -> beat: rite

--- beat: rite
[gaslight]
The rite was kept in its lighter form, as the house keeps it for guests: the words, the forms, a hand that was firm but not unkind. The {mistress.scent} in the room was the thing she said afterwards she would remember longest.
[candlelight]
The rite was kept in its lighter form, as the house keeps it for guests. The words were explained before they were said, and then said properly. Then {guest.first} was taken across {mistress.name}'s knee in a rustle of borrowed silk, and the flat of a hand came down, firm and measured, a dozen times.

She gasped at the first and laughed at the third and at the seventh made a sound she would not have recognised as her own. The room smelled of {mistress.scent} and beeswax and the coal fire. It was, she said afterwards, the most thoroughly anyone had paid attention to her since 1969.
* Go on -> beat: closing

--- beat: closing
[gaslight]
"It is finished," {mistress.name} said. {guest.first} said "Thank you," and then, unexpectedly, "Oh," and sat down rather suddenly on the hearthrug.
[candlelight]
"It is finished," {mistress.name} said, and set her on her feet.

{guest.first} said "Thank you," as she had been told was the form, and then, unexpectedly, "Oh," and sat down rather suddenly on the hearthrug with her skirts all round her, looking into the fire with an expression that nobody at her office had ever seen.
* -> aftercare

--- beat: aftercare
[gaslight]
She was given cocoa and a shawl, and sat by the fire until the Drawing Room clock struck eleven.
[candlelight]
She was given cocoa with a skin on it and the second-best shawl and a footstool, and sat by the fire until the Drawing Room clock struck eleven, talking in a low wondering voice about her mother, and the office, and whether a woman could simply decide not to go back to a century. {mistress.name} said that some had. {guest.first} said, "Yes," and looked at the fire for a long time.
` });
