/*
  RACINATION — data/computing.js
  ---------------------------------------------------------------
  Milestone 9: the Computing Room (GDD §5.6). The house writes
  games for the home computer and sells them on cassette.

  Safe to edit: words in quotation marks and numbers.
  Keep the names before the colons as they are.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.computing = {

  /* ---------- What can be written ----------
     letters   how much the Letters skill counts towards quality (an adventure is mostly writing) */
  types: [
    { id: "adventure", label: "Text adventure", letters: 0.6, note: "Mostly writing. In fashion early in the decade, less so later." },
    { id: "maze", label: "Maze game", letters: 0.2, note: "Mostly programming. Sells steadily." },
    { id: "educational", label: "Educational", letters: 0.4, note: "Spelling, sums or the kings and queens. Never a hit, never a flop." }
  ],
  scopes: [
    { id: "small", label: "Small", work: 12, quality: 0, price: "full", note: "About six weeks with a good programmer." },
    { id: "ambitious", label: "Ambitious", work: 28, quality: 0.8, price: "premium", note: "About a season. Better, if it is finished." }
  ],
  maxTeam: 3,

  /* ---------- Quality, each week a woman works on it ---------- */
  quality: {
    base: 2.5,
    perProgramming: 0.7,
    perRacination: 1 / 30,       // a racinated programmer writes a better game
    perPit: -1 / 40,             // the Pit in the house makes it worse
    roomAtWorst: -1              // at Condition 0; nothing at Condition 100
  },
  // Progress each week: this, plus this much for each point of Programming.
  progressBase: 1,
  progressPerProgramming: 0.5,
  reviewLuck: 1.5,               // the review score can land this far either way

  /* ---------- Cassette runs ---------- */
  runs: [250, 500, 1000, 2000],
  pressingSetup: 20,             // pounds, each run
  unitCost: { 1983: 0.45, 1984: 0.42, 1985: 0.40, 1986: 0.36, 1987: 0.34, 1988: 0.32, 1989: 0.30 },
  remainderAfter: 12,            // weeks on sale before unsold stock is sold off
  remainderPrice: 0.05,

  /* ---------- Prices and the house's share ---------- */
  // Retail price by year; budget games from 1986. The house keeps a share after the distributor and the shops.
  prices: {
    1983: { full: 5.95, premium: 7.95 }, 1984: { full: 5.95, premium: 7.95 }, 1985: { full: 6.95, premium: 8.95 },
    1986: { full: 1.99, premium: 7.95 }, 1987: { full: 1.99, premium: 8.95 }, 1988: { full: 1.99, premium: 8.95 },
    1989: { full: 1.99, premium: 9.95 }
  },
  houseShare: 0.2,

  /* ---------- The market (D3) ----------
     peak     copies a week, at the best week, for an average game
     types    how each kind is faring that year */
  market: {
    1983: { peak: 160, types: { adventure: 1.3, maze: 1.0, educational: 0.5 } },
    1984: { peak: 200, types: { adventure: 1.3, maze: 1.0, educational: 0.5 } },
    1985: { peak: 190, types: { adventure: 1.1, maze: 1.0, educational: 0.5 } },
    1986: { peak: 240, types: { adventure: 0.9, maze: 1.1, educational: 0.5 } },
    1987: { peak: 180, types: { adventure: 0.7, maze: 1.0, educational: 0.5 } },
    1988: { peak: 120, types: { adventure: 0.5, maze: 0.9, educational: 0.45 } },
    1989: { peak: 70,  types: { adventure: 0.4, maze: 0.8, educational: 0.4 } }
  },
  // Budget games (from 1986) sell in greater numbers.
  budgetVolume: 1.8,
  premiumVolume: 0.7,
  // How sales rise and fall, week by week after release.
  curve: [0.6, 1.0, 0.9, 0.7, 0.5, 0.35, 0.25, 0.15, 0.08, 0.05, 0.04, 0.03],
  // Review score's effect on sales: (score / this) squared.
  reviewPivot: 6,

  /* ---------- Advertising ---------- */
  advert: { cost: 25, sales: 1.35, pit: 0.5 },

  /* ---------- Consequences ---------- */
  pitPerGameOnSale: 0.15,
  hitAt: 8,                       // a review score this high is a hit
  hitRacinationDrain: 1,          // each week a hit sells, for the woman who wrote it
  mercurySales: 0.3,              // a Lady of Letters nudge, at full strength (never confirmed)

  /* ---------- The computing press ---------- */
  magazines: ["Home Micro Weekly", "ZX Adventurer", "Popular Computing Gazette", "Micro User Monthly"],
  reviews: [
    { atLeast: 9, lines: ["A stonking good game, and spiffingly old-fashioned with it. Buy it now.", "Whoever Hesperis Software are, they can come round our office any time. Megagame.", "Gorgeous, clever and utterly bonkers. Our reviewer has started saying ‘rather’."] },
    { atLeast: 7, lines: ["Charming, if a bit posh. The music is a waltz, which is a first.", "Solid and well made. The instructions are written like a letter from your gran.", "Tasteful. Very tasteful. Slightly too tasteful, if we're honest, but we kept playing."] },
    { atLeast: 5, lines: ["Perfectly all right. We found ourselves wondering why every character curtseys.", "Middling. The loading screen is a vase of flowers, which is nice.", "Not bad, not good. Comes with a pressed violet in the box, for some reason."] },
    { atLeast: 3, lines: ["Slow and peculiar. The man in the shop said it was a good laugh. It isn't.", "We tried. We really did. The parser only understands ‘please’.", "Every room is a drawing room. Every drawing room has a fire. We are bored of fires."] },
    { atLeast: 0, lines: ["Didn't load on two of our three machines, and we wish it hadn't on the third.", "Possibly the strangest cassette ever sent to this office. Zero stars, and a funny look.", "Came with a handwritten note asking us to be kind. We have not been."] }
  ],

  /* ---------- Words ---------- */
  lines: {
    started: "Work has begun in the Computing Room on ‘{title}’.",
    finished: "‘{title}’ is finished, and waits on the Computing Room table for a cassette run to be ordered.",
    nobody: "Nobody worked in the Computing Room this week, and ‘{title}’ sat where it was.",
    review: "{magazine} gave ‘{title}’ {score} out of 10: ‘{line}’",
    sales: "‘{title}’ sold {n} copies this week.",
    soldOut: "‘{title}’ has sold out. The shops are asking for more.",
    remaindered: "The last {n} copies of ‘{title}’ went to a wholesaler in Croydon at {price} each.",
    hitDrain: "{name} has been reading the computing papers in bed."
  }
};
