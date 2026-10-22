window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
window.RACINATION_SCENE_FILES.push({ file: "rite.js", text: `

# The rite, on a charge brought by the house.
# Branches by measure: token, formal or severe.

=== scene: rite-charge
title: The rite
participants: mistress, partner, presider
trigger: rite(petition = no)
outcome: devotion +1
room: the Study

--- beat: opening
[gaslight]
The Study after Evensong. The curtains drawn, the lamp turned low, the gramophone wound and set going on something slow from 1931. {partner.name} stood before the desk with her hands folded, as the house requires, and heard the charge read again in full.

{presider.name} asked whether she understood it. She said that she did.
[candlelight]
The Study after Evensong, and the house gone quiet round it. The curtains were drawn, the lamp turned down until it made a small gold room inside the larger one, and the gramophone was wound and set going on a slow foxtrot from 1931 that nobody would remember to turn over.

{partner.first} stood before the desk with her hands folded, as the house requires, and listened to the charge read again in full. Her colour came and went. When {presider.name} asked whether she understood it, her voice was steadier than her hands: "I do." She had dressed for it, the way one dresses for church, and the effort showed in every pin.
* Go on -> beat: token (if measure = token)
* Go on -> beat: formal (if measure = formal)
* Go on -> beat: severe (if measure = severe)

--- beat: token
[gaslight]
The correction was mostly words: the old words of the house, said slowly, with a hand resting on her shoulder for the length of them. When they were finished {partner.first} let out a breath she seemed to have been holding since Matins.
[candlelight]
The correction was mostly words: the old words of the house, said slowly and without hurry, with {presider.first}'s hand resting on her shoulder for the whole length of them. It was a light hand. It did not need to be anything else.

{partner.first} kept her eyes down at first, and then, as the words went on, lifted them. By the end she was listening as one listens to music, with her lips a little parted. When it was over she let out a breath she seemed to have been holding since Matins, and something in her face unknotted.
* Go on -> beat: closing

--- beat: formal
[gaslight]
The rite went forward in its proper form. The words were said, and what follows the words followed them, as the house has always kept it. The gramophone ran down partway through, and nobody got up to wind it.
[candlelight]
The rite went forward in its proper form. The words were said in their order; then {presider.first} sat, and {partner.first} came to her as the form requires, and was taken across her lap with the plain, unhurried competence of a woman who has done this before and means it kindly.

The brush was ivory-backed and very old. Its first stroke made her gasp, more from surprise than anything; by the sixth her breath had found the rhythm of it, short and catching. She held on to the leg of the chair. The gramophone ran down into a long sigh of strings, and nobody got up to wind it, and for a while the only sounds in the Study were the clock, the brush, and {partner.first}'s quickening breath, which by the end had become something nearer to weeping and nearer still to relief.
* Go on -> beat: closing

--- beat: severe
[gaslight]
It was the long form of the rite, which the house keeps for a woman who has asked to be held to the whole of it. It went on for some time. The candles burned down a finger's breadth, and the gramophone ran out, and nobody moved to change it.
[candlelight]
It was the long form of the rite, which the house keeps only for a woman who has named it as something she wants. The strap came out of the bureau drawer where it lives wrapped in a silk scarf, and {partner.first} looked at it once and then very deliberately away.

It went on for some time. There were pauses in it, as the form requires: a hand on her back, a question asked low, a nod given. Then it went on again. She cried out more than once and did not say her word, and between the strokes her breathing had the long ragged sound of someone climbing a hill she has chosen to climb. The candles burned down a finger's breadth. When it was over she stayed exactly where she was, as if she could not quite believe the summit, and had to be lifted up into the light.
* Go on -> beat: closing

--- beat: closing
[gaslight]
"It is finished," {presider.name} said, which is the form. {partner.first} said, "Thank you," which is also the form, and meant it.
[candlelight]
"It is finished," {presider.name} said, which is the form, and put a hand to her cheek, which is not.

{partner.first} said "Thank you," which is also the form, in a voice gone hoarse and soft. Her face was wet and very open, the way a face is after weeping when the weeping has done what it came to do. She did not seem in any hurry to be anywhere else.
* -> aftercare

--- beat: aftercare
[gaslight]
Afterwards there was the fire, and tea, and the good shawl round her shoulders, and nothing at all was asked of her until she was ready to go up.
[candlelight]
Afterwards she was sat by the fire in the good shawl, the one with the long silk fringe, and given tea that she held in both hands and mostly did not drink. {presider.first} sat on the arm of the chair and talked to her about nothing in particular: the garden, the price of coal, a letter from Bath. Slowly {partner.first}'s shoulders came down from round her ears. When she went up at last she stopped in the doorway and looked back, and her smile was the kind the house is for.
` });
