/*
  RACINATION — data/house.js
  ---------------------------------------------------------------
  The house's name, its dates, and the lines the Housekeeper writes
  in the day-book. The money is in data/economy.js, and the Mistress's
  background sets the starting sum.

  This file is for editing. You can safely change:
    - any words between quotation marks
    - any number (money is in pounds, e.g. 18.50)
    - add or remove lines in the lists, keeping a comma after each

  Leave the names before the colons (startingMoney:, label: and so on)
  exactly as they are: the engine looks for them by name.

  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.house = {

  name: "Hesperis House",

  // The first Matins of the run (must be a Monday) and the last day.
  startDate: "1983-01-03",
  endDate:   "1989-12-31",

  // Money in hand before a Mistress is chosen (her background then sets it), in pounds.
  startingMoney: 1200.00,

  /*
    The weekly accounts now live in data/economy.js (Milestone 4a).
  */

  // The Housekeeper's line for the very first Monday.
  openingLine:
    "The books are opened. Hesperis House begins the year 1983 with a roof, a gramophone, a sum of money "
    + "and the settled conviction that the twentieth century was a mistake. The Housekeeper has ruled a fresh "
    + "page and written the date at the top of it as though daring the calendar to object.",

  // One of these is chosen each Monday, by season.
  // Any line can use the Mistress's tokens: {mistress.name}, {mistress.voice}, {mistress.hair},
  // {mistress.scent}, {mistress.mark}, {mistress.style} and the rest (see data/mistress.js).
  matinsLines: {
    winter: [
      "Frost on the inside of the Morning Room windows, which the house regards as a kind of lace and the ledger regards as coal.",
      "The post brought a seed catalogue and a circular about something called a video recorder. The circular was put on the fire, where it gave a surprisingly good heat.",
      "Matins was said in the Chapel by the light of two candles and a paraffin stove. The Goddess, who has seen worse, did not complain.",
      "Snow on the lane. The village shop is shut until the thaw, and with it the village's opinions.",
      "The pipes in the scullery froze on Thursday and were thawed with kettles, prayer and language the Housekeeper has asked not to have recorded.",
      "A hard white morning. The house rose at the bell, in the dark, as it has decided women always did."
    ],
    spring: [
      "The first primroses under the rectory hedge. The Housekeeper has entered them in the day-book, between the price of flour and a remark about the drains.",
      "A van went down the lane with its window open, broadcasting popular music. The house has agreed that it did not hear it.",
      "The garden is being dug. A spade of 1911 manufacture has outlived its third handle and shows no inclination to retire.",
      "Rain all week, soft and English. The house finds this reassuring: it is one of the few things the Pit has not yet improved.",
      "Lambs in the field beyond the churchyard. Nobody has explained to them what decade it is, and the house envies them."
    ],
    summer: [
      "Long light in the evenings and the gramophone on the lawn. Beyond the elms a wireless is following the cricket with an enthusiasm the house finds faintly indecent.",
      "Roses along the south wall. The post brought a postcard of Benidorm from somebody's sister, which has been placed face down on the hall table.",
      "Ramblers in the lane, wearing shorts. The Drawing Room curtains were drawn until they had gone by.",
      "Strawberries from the garden and cream from the farm. For one afternoon the house's accounts and its theology were in perfect agreement.",
      "Thunder on Wednesday night. The house took it as an opinion, and was not certain whose."
    ],
    autumn: [
      "The coal merchant called with his new prices, which have risen, as everything in the Pit rises except standards.",
      "Apples laid out in the attic on old newspapers, turned print side down.",
      "Fog in the mornings. The house is pleased with it, because it hides the pylons.",
      "The leaves are coming down in the drive. They are swept by hand, slowly, as a devotion and because the house does not own anything that blows.",
      "Blackberries along the lane, picked in gloves and made into jam. The village picks them too, in anoraks, which the house regards as a separate fruit."
    ],
    any: [
      "Nothing of consequence occurred, which in the present century is itself a small miracle, and was entered as such.",
      "The bell was rung at the proper hours and the proper hours were kept. The Housekeeper notes it as if it were news, and in 1980s England perhaps it is.",
      "The scent of {mistress.scent} on the back stairs told the house that {mistress.name} had been up before the bell.",
      "{mistress.name} read the lesson at Matins in her {mistress.voice} voice, and the household sat up straighter for it."
    ]
  },

  // One of these closes each Sunday reckoning.
  reckoningLines: [
    "The accounts were cast up at the kitchen table after Evensong, in ink, by lamplight.",
    "The week's figures were added twice, as the Housekeeper does not trust a sum that agrees with itself the first time.",
    "The ledger was blotted, closed and put back in the bureau, where it sits like a conscience with a brass lock.",
    "Receipts were spiked, bills were filed, and the house went up to bed past the cold landing window.",
    "The Housekeeper ruled off the week with a red line and a small sigh.",
    "{mistress.name} initialled the week's page in green ink and blotted it herself."
  ],

  // Shown on the placeholder rota page until Milestone 2.
  rotaPlaceholder:
    "The rota board hangs in the scullery passage, its pegs empty and its card unwritten. "
    + "The household's names will be chalked here in due course."

  // The endings' words are in data/economy.js (under "endings").
};
