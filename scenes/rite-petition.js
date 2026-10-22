window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "rite-petition.js", text: `

# The rite, when she has asked for it herself.

=== scene: rite-petition
title: The petition granted
participants: mistress, partner, presider
trigger: rite(petition = yes)
outcome: racination +1, devotion +1
room: the Morning Room

--- beat: opening
[gaslight]
She had asked for it after Evensong, quietly, in the passage, and been told to come to {room} at nine. At five to nine {partner.name} was waiting outside the door, in her best, with her hands clasped so tightly that the knuckles showed.
[candlelight]
She had asked for it after Evensong, quietly, in the passage by the linen cupboard, with her eyes on the floor and her colour very high, and had been told to come to {room} at nine.

At five to nine {partner.first} was waiting outside the door in her best frock, the blue one with the cut-glass buttons, and her hair freshly pinned. She had done her face with great care and then, it seemed, thought better of the lipstick and taken it off again. When the door opened she went in as a woman goes into the sea on a cold morning: all at once, before she can change her mind.
* Go on -> beat: asking

--- beat: asking
[gaslight]
"You asked to be put right," {presider.name} said. "Tell me why." She told her. It took a little while, and was more about the house than about the fault.
[candlelight]
"You asked to be put right," {presider.name} said. "Tell me why."

{partner.first} told her. It came out haltingly at first and then all in a rush, and it was less about the fault than about the house, and about how far she had come since she arrived with one suitcase and the twentieth century still on her, and how she needed, sometimes, to feel the distance measured. {presider.first} listened without interrupting. At the end she said only, "Very well," and {partner.first} shut her eyes as if she had been given a present.
* Go on -> beat: token (if measure = token)
* Go on -> beat: formal (if measure = formal)
* Go on -> beat: severe (if measure = severe)

--- beat: token
[gaslight]
It was a light correction, mostly ceremony, with the words of the house said over her slowly. She asked for nothing more, and was given nothing less.
[candlelight]
It was a light correction, mostly ceremony: the words of the house said over her slowly, a hand at the nape of her neck, three strokes of the flat of the hand given almost tenderly and counted aloud. She counted with them, her voice a little behind. It was nothing, and it was everything she had asked for; her whole body sighed with it.
* Go on -> beat: closing

--- beat: formal
[gaslight]
The rite was kept as the house keeps it. She bore it well, as she had known she would, and at the end of it she was crying a little and smiling a good deal.
[candlelight]
The rite was kept as the house keeps it, and she bore it as she had known she would: badly at first, with gasps and a hand flung out to grip the chair, and then well, settling into it, letting it carry her.

The brush rose and fell. {partner.first}'s breath caught and broke and caught again, and somewhere in the middle of it her fingers loosened on the chair, and her face, turned to the cushions, went still and private and wondering. By the end she was crying a little and smiling a good deal, and could not have said which had begun first.
* Go on -> beat: closing

--- beat: severe
[gaslight]
She had asked for the long form, and she was given it, with all its pauses and its questions. When it was done she lay quite still for a long moment, like a swimmer who has reached the far shore.
[candlelight]
She had asked for the long form, and named it plainly, and she was given it: the strap from its silk scarf, the pauses and the questions in their places, the low voice asking and her own voice answering, "Yes. Go on."

It was hard, and she had wanted it hard. She cried out, and went on, and cried out again, and her answers between grew shorter and more breathless and more certain. When it was done she lay quite still for a long moment, like a swimmer who has reached the far shore and does not yet trust the sand.
* Go on -> beat: closing

--- beat: closing
[gaslight]
"It is finished." "Thank you." The form was kept to the end, and then, the form being kept, they were simply two women in a warm room.
[candlelight]
"It is finished," {presider.name} said, and helped her up, and did not let go of her hands at once.

"Thank you," said {partner.first}. She was flushed to the hairline and her eyes were swimming and she looked, the Housekeeper said afterwards, like a window that has just been cleaned.
* -> aftercare

--- beat: aftercare
[gaslight]
They sat by the fire afterwards with tea and the gramophone playing quietly, and talked about other things, and she went up to bed singing under her breath.
[candlelight]
They sat by the fire afterwards, close, with a rug over {partner.first}'s knees and tea going cold beside her, and the gramophone playing something very quiet. She leaned her head on {presider.first}'s shoulder and talked, drowsily, about her mother's garden in Shropshire and the smell of phlox at dusk. She went up to bed singing under her breath, and the house heard her, and was glad.
` });
