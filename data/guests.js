/*
  RACINATION — data/guests.js
  ---------------------------------------------------------------
  Paying guests (Milestone 5b). Each week's guests are made from
  these lists. A guest arrives full of the Pit and leaves either
  racinated or appalled; her review moves the house's reputation.
  All guests are adult women.

  Safe to edit: words in quotation marks and numbers.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.guests = {

  ages: [24, 55],

  firstNames: [
    "Amanda", "Beverley", "Carole", "Dawn", "Denise", "Diane", "Gail", "Jackie", "Jane", "Joanne",
    "Karen", "Kim", "Lorraine", "Maureen", "Michelle", "Pamela", "Sandra", "Sharon", "Tracey", "Yvonne",
    "Hazel", "Brenda", "Glenys", "Shirley", "Angela", "Lynn", "Corinne", "Janice"
  ],
  surnames: [
    "Gosling", "Pritchard", "Barraclough", "Hendry", "Mottram", "Dibble", "Fothergill", "Kemp", "Lightfoot", "Nuttall",
    "Pocock", "Rudd", "Scattergood", "Tibbs", "Wragg", "Ackroyd", "Blundell", "Cheeseman", "Dimmock", "Entwistle"
  ],
  jobs: [
    "a typist", "a dental receptionist", "a building-society clerk", "a librarian", "a bank cashier",
    "a doctor's secretary", "a canteen manageress", "a translator", "a civil servant", "a hairdresser",
    "a computer operator", "a florist", "a buyer for a department store", "a probation officer", "a widow of means"
  ],
  towns: [
    "Croydon", "Basingstoke", "Slough", "Luton", "Milton Keynes", "Swindon", "Reading", "Stevenage",
    "Harlow", "Bracknell", "Wolverhampton", "Bolton", "Ealing", "Cheltenham", "Hove", "Leamington Spa"
  ],

  /* How a guest's week ends. Her chance of leaving racinated is the
     house's guest satisfaction (0–100) ÷ 100, give or take. */
  racinatedReputation: 1.2,   // reputation gained from a happy review
  appalledReputation: -1.8,   // reputation lost from an unhappy one

  // Lines in the Sunday reckoning. {name}, {job} and {town} are filled in.
  racinatedLines: [
    "{name}, {job} from {town}, left racinated, in a borrowed hat she refused to give back. She has booked again for the autumn.",
    "{name}, {job} from {town}, wept on the platform and said it was the best week of her life. She will write to the personal columns.",
    "{name}, {job} from {town}, went home a different woman, and her husband will find out on Monday."
  ],
  appalledLines: [
    "{name}, {job} from {town}, left appalled on the Wednesday, muttering about cults. Her review will not be kind.",
    "{name}, {job} from {town}, endured the week with visible suffering and asked twice whether there was a television anywhere.",
    "{name}, {job} from {town}, left politely and will tell everyone in {town} that it was ‘very odd’."
  ]
};
