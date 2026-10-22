window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "courtship-reading.js", text: `

# A courtship evening between two residents: reading aloud.

=== scene: courtship-reading
title: An evening reading aloud
participants: partner, beloved
trigger: courtship(with = resident)
outcome: racination +1, bond +1
room: the Library

--- beat: opening
[gaslight]
{beloved.name} had found a novel of 1934 in a box at a jumble sale, and asked whether {partner.name} would care to hear a chapter. They took it to {room}, with one lamp between them.
[candlelight]
{beloved.first} had found a novel of 1934 in a box at the Wantage jumble sale, its spine gone and its title page foxed, and a much better book than its cover promised: a romance of the Riviera, all yachts and misunderstandings. She asked, a little too casually, whether {partner.first} would care to hear a chapter.

They took it to {room}, where the fire had been lit for them by somebody who was not saying who, and sat on the window seat with one lamp between them and a rug over both their knees.
* Begin -> beat: reading

--- beat: reading
[gaslight]
{beloved.first} read well, in a low voice, and when she came to the parts that were about love she read them a little more slowly.
[candlelight]
{beloved.first} read well, in a low unhurried voice that made the author sound better than she was. {partner.first} watched her mouth shape the words more than she listened to them, and then, when she noticed herself doing it, looked at the fire, and then back again.

When the book came to the moonlit terrace and the declaration, {beloved.first}'s voice slowed and went a little rough. She read the declaration through to the end without looking up. Then she did look up, and the lamp was between them, and for a moment neither of them could think of a single thing in the whole of English literature to say.
* Take the book from her -> beat: book
* Ask her to read it again -> beat: again

--- beat: book
[gaslight]
{partner.first} took the book from her and closed it, gently, with a finger in the place.
[candlelight]
{partner.first} took the book out of her hands and closed it, very gently, with a finger in the place, as one does when one fully intends to come back. Then she leaned across the lamp, which was nearly a disaster, and moved the lamp, which was not, and kissed her.

{beloved.first} made a small surprised sound and then no sound at all. The novel slid off the rug onto the floor. Neither of them went to pick it up for some time.
* Go on -> beat: late

--- beat: again
[gaslight]
She read it again, more slowly still, and this time looked up at the end of every line.
[candlelight]
"Again?" said {beloved.first}, and laughed, and read it again, more slowly still, and this time she did not look at the page at all for the last few lines, because she had them by heart already, and was saying them to {partner.first} rather than reading them to her. The fire crackled. Somewhere upstairs a gramophone was playing, faintly, the wrong tune for the moment, and it did not matter.
* Go on -> beat: late

--- beat: late
[gaslight]
It was very late when they went up. The book was left on the window seat, with a hairpin in it to keep the place.
[candlelight]
It was very late when they went up, and the fire was out, and the room was cold, and neither of them had noticed. The book was left on the window seat with a hairpin in it to keep the place. In the morning the Housekeeper found it there, and put it carefully back exactly where it had been, hairpin and all, and said nothing to anyone.

--- beat: aftercare
[gaslight]
They put the book down there, and sat on with the lamp and the fire, and talked of other things until it was time to go up.
[candlelight]
They put the book down there, and sat on with the lamp and the rug and the fire, and talked of other things: of Wantage, and of the jumble sale, and of a cat {partner.first} had once had, who sat on books. It was a good evening. Not every evening needs to end on a terrace in the moonlight.
` });
