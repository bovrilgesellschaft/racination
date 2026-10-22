window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "working-outdoor.js", text: `

# A Working out on the land, at any of the outdoor sites.

=== scene: working-outdoor
title: The Working on the land
participants: partner, beloved
trigger: working(outdoor = yes)
outcome: racination +1, bond +1
room: the downs

--- beat: opening
[gaslight]
They left the house by the scullery door after eleven, with a torch, a rug, a thermos and the notebook, and walked the last mile to {room} because the Austin's lights would have been seen from the lane. It was very dark, and very quiet, and the sky was enormous.
[candlelight]
They left the house by the scullery door after eleven, in stout shoes under their good frocks, with a torch, a tartan rug, a thermos of cocoa and the green notebook in a biscuit tin, and drove as far as they dared in the Austin with the lights off for the last stretch. Then they walked.

At night, {room} is not a place one has ever really been in daylight. The wind came over the grass in long slow breaths. Sheep, somewhere, shifted and complained. {partner.first} took {beloved.first}'s arm on the rough bit and did not give it back.
* Go on -> beat: purpose

--- beat: purpose
[gaslight]
They spread the rug where the notebook said, and stood facing the quarter of the sky where {lady} would come, and said what the Working was for: {image}. Then the phrase, into the wind: "{phrase}."
[candlelight]
They spread the rug where the notebook said, out of the wind, and stood facing the quarter of the sky where {lady} would come. The torch was switched off. Their eyes changed, slowly, until the whole hillside was grey and silver and full of shapes.

They said aloud what the Working was for, one after the other, in the voices one uses in church: {image}. Then the phrase, into the wind, which took it and carried it off over the valley, over and over until they were breathless and laughing and serious all at once: "{phrase}."
* Go on -> beat: working

--- beat: working
[gaslight]
When {lady} came, they were ready for her. What the land saw that night it has kept to itself, as it has kept a great deal else for three thousand years.
[candlelight]
When {lady} came, a point of light lifting clear of the black line of the hills or sinking to it, they were ready for her. They knelt on the rug, and then lay on it, and the cold made them clumsy and then made them careful. Hands under coats; buttons; a gasp at cold fingers, and a laugh, and then no laughter. The ground was hard under the rug and the sky was enormous over them and neither mattered.

They kept the picture between them all the while, as the notebook asks, and it grew brighter as they did, until at the height of it {partner.first} cried out, quite unexpectedly, and something answered: a bird, or the wind in the grass, or nothing at all. They let the picture go into the dark, and the dark took it.
* Go on -> beat: after

--- beat: after
[gaslight]
They walked home under the stars with the rug round both of them, and were in by four, and at Matins nobody asked where they had been.
[candlelight]
They lay a while under the rug and their coats, warm in the middle and frozen at the edges, and watched {lady} climb, or sink, until the cold won. Then they walked home under the whole sky with the rug round both their shoulders, and shared the cocoa on the way, and were in by the scullery door before four.

At Matins nobody asked where they had been. There was chalk, or leaf-mould, or moss on both their hems, and the Housekeeper looked at it, and then at them, and then quite deliberately at the hymn board.

--- beat: aftercare
[gaslight]
They stopped there, and wrapped up in the rug, and drank the cocoa looking at the sky. The Ladies come round again; there is always another night.
[candlelight]
They stopped there, easily, and sat wrapped together in the rug with the cocoa, looking at the sky, which was quite enough to be going on with. The Ladies come round again; there is always another night. They walked home slowly, and talked the whole way, and were happy.
` });
