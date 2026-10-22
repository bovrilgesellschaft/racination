/*
  RACINATION — data/scenekit.js
  ---------------------------------------------------------------
  Milestone 7: the Scene Kit's own words and figures. The scenes
  themselves live in the scenes folder (see WRITING-SCENES.md).

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.scenekit = {

  tiers: {
    gaslight: { label: "Gaslight", note: "Fade and implication. The default." },
    candlelight: { label: "Candlelight", note: "Sensual and frank, never anatomical." },
    author: { label: "Author", note: "Text written by the designer, in authored.js. Behind an 18+ confirmation." }
  },

  // The label of the route to aftercare that the engine adds to every beat.
  stopLabel: "Stop here, and sit with her",

  // When a scene goes past a woman's limit, her word arrives here.
  // {partner.first} and {houseword} are filled in.
  houseWord: {
    gaslight: "{partner.first} said, quite clearly, ‘{houseword}.’ Everything stopped at once.",
    candlelight: "{partner.first} said ‘{houseword}’, low and quite clear, and everything stopped at once: the hand, the words, the clock itself, it seemed. Nobody asked her why. Nobody needed to."
  },

  // Used when a scene has no beat called "aftercare" of its own.
  aftercare: {
    gaslight: "Afterwards there was tea, and the fire, and a shawl, and nothing at all was asked of her until she was ready.",
    candlelight: "Afterwards she was wrapped in the good shawl and sat by the fire with tea she did not drink, held, and talked to about nothing in particular, until her breathing slowed and the room came back round her like a tide coming in."
  },

  // Shown when the Mistress stops a scene early. Nothing is held against anyone.
  stoppedEarly: "It was left unfinished, and none the worse for that.",

  // Discretion: the house sometimes draws the curtain on a scene even when all is well,
  // so a scene played at Gaslight is never, by itself, proof of anything.
  curtainChance: 0.15,

  // The label for the button that ends a scene.
  closeLabel: "Close the door on it",
  continueLabel: "Go on",

  // Lines for the Evenings page.
  offers: {
    courtship: "Their evening",
    bonding: "Their bonding night",
    mistress: "Your evening with her"
  },

  // How many weeks a bonding night stays on offer.
  offerWeeks: 2,

  // The largest bonus a scene's outcome line can give, on each meter (Design decision D3).
  outcomeCap: 2
};
