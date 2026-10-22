/*
  RACINATION — data/wardrobe.js
  ---------------------------------------------------------------
  The garments a woman can own.

  era      "period" = 1930s (good for Racination and Devotion)
           "pit"    = modern (bad for them)
  slot     where it goes on the body: dress, top, bottom, knit,
           coat, legs, shoes, accessory.
           A woman wears either a dress, or a top with a bottom.
  years    the range of years it may be dated (period garments
           show their year in the portrait, e.g. "1934 day dress").
  weight   how often it turns up (1 = ordinary).
  colours, fabrics, details: one of each is chosen when the
           garment is made.
  prose    how the game describes it.     Tokens: {colour} {fabric} {detail}
  portrait the plain words for the portrait. Tokens: {colour} {fabric} {detail} {year}

  Each detail is a pair: [prose words, portrait words].
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.wardrobe = {

  periodColours: ["navy", "bottle-green", "burgundy", "dove-grey", "cream", "black", "powder-blue",
                  "rust", "mustard", "plum", "eau-de-nil", "oyster", "chocolate-brown", "cornflower-blue"],

  garments: [

    /* ---------- 1930s ---------- */

    { id: "day-dress", era: "period", slot: "dress", years: [1930, 1939], weight: 3,
      fabrics: ["crêpe", "rayon crêpe", "wool jersey", "fine wool"],
      details: [
        ["with a white piqué collar and short puffed sleeves", "white Peter Pan collar, puffed sleeves"],
        ["with a narrow belt of the same stuff and a row of covered buttons", "self-fabric belt, covered buttons"],
        ["with a softly draped cowl neck", "draped cowl neckline"],
        ["with flutter sleeves and a bow at the throat", "flutter sleeves, bow at the neck"]
      ],
      prose: "a {colour} {fabric} day dress, cut close through the body and falling to the mid-calf, {detail}",
      portrait: "{colour} {fabric} {year} day dress with {detail}, belted waist, mid-calf skirt" },

    { id: "tea-frock", era: "period", slot: "dress", years: [1932, 1939], weight: 2,
      colours: ["floral", "sprigged", "spotted", "small-check"],
      fabrics: ["cotton voile", "printed rayon", "lawn"],
      details: [
        ["with a frilled collar", "frilled collar"],
        ["with short cape sleeves", "short cape sleeves"],
        ["with a tie belt and pin-tucked bodice", "tie belt, pin-tucked bodice"]
      ],
      prose: "a {colour} {fabric} tea frock {detail}, the skirt cut on the cross so that it moves when she does",
      portrait: "{colour} {fabric} {year} tea dress with {detail}, bias-cut mid-calf skirt" },

    { id: "shirtwaister", era: "period", slot: "dress", years: [1934, 1939], weight: 1,
      fabrics: ["linen", "cotton twill", "fine wool"],
      details: [
        ["with a buttoned front and patch pockets", "button front, patch pockets"],
        ["with a pointed collar and turned-back cuffs", "pointed collar, turned-back cuffs"]
      ],
      prose: "a {colour} {fabric} shirtwaister {detail}, which the house regards as practical but not defeatist",
      portrait: "{colour} {fabric} {year} shirtwaist dress with {detail}, belted, mid-calf" },

    { id: "blouse", era: "period", slot: "top", years: [1930, 1939], weight: 2,
      colours: ["white", "ivory", "cream", "oyster", "pale pink", "powder-blue"],
      fabrics: ["silk", "rayon crêpe", "cotton lawn"],
      details: [
        ["with a pussy-cat bow", "pussy-bow neck"],
        ["with a jabot of lace at the throat", "lace jabot"],
        ["with tucked yoke and pearl buttons", "tucked yoke, pearl buttons"]
      ],
      prose: "a {colour} {fabric} blouse {detail}",
      portrait: "{colour} {fabric} {year} blouse with {detail}" },

    { id: "skirt", era: "period", slot: "bottom", years: [1930, 1939], weight: 2,
      fabrics: ["tweed", "flannel", "wool gabardine"],
      details: [
        ["with knife pleats", "knife-pleated"],
        ["cut on the bias", "bias-cut"],
        ["with a kick pleat behind", "slim with a kick pleat"]
      ],
      prose: "a {colour} {fabric} skirt {detail}, to the mid-calf",
      portrait: "{detail} {colour} {fabric} mid-calf skirt" },

    { id: "cardigan", era: "period", slot: "knit", years: [1930, 1939], weight: 2,
      fabrics: ["hand-knitted wool", "botany wool", "angora"],
      details: [
        ["buttoned to the throat", "buttoned"],
        ["worn open, with pockets full of hairpins", "worn open"],
        ["knitted in a lacy stitch", "lacy-knit"]
      ],
      prose: "a {colour} {fabric} cardigan {detail}",
      portrait: "{detail} {colour} {fabric} {year} cardigan" },

    { id: "bolero", era: "period", slot: "knit", years: [1933, 1939], weight: 1,
      fabrics: ["velvet", "knitted wool"],
      details: [["", ""]],
      prose: "a little {colour} {fabric} bolero",
      portrait: "short {colour} {fabric} {year} bolero jacket" },

    { id: "coat", era: "period", slot: "coat", years: [1930, 1939], weight: 2,
      fabrics: ["tweed", "camel-hair", "wool bouclé"],
      details: [
        ["with a fur collar of uncertain origin", "fur collar"],
        ["belted, with wide lapels", "belted, wide lapels"]
      ],
      prose: "a {colour} {fabric} coat {detail}",
      portrait: "{colour} {fabric} {year} coat, {detail}" },

    { id: "stockings", era: "period", slot: "legs", years: [1930, 1939], weight: 3,
      colours: ["fawn", "nude", "smoke", "black"],
      fabrics: ["lisle", "rayon", "silk"],
      details: [["", ""]],
      prose: "{colour} {fabric} stockings with seams she checks in every glass she passes",
      portrait: "seamed {colour} stockings" },

    { id: "t-bars", era: "period", slot: "shoes", years: [1930, 1939], weight: 2,
      colours: ["black", "navy", "brown", "tan"],
      fabrics: ["leather", "suede"],
      details: [["", ""], [", a little worn at the strap", ""]],
      prose: "{colour} {fabric} T-bar shoes{detail}",
      portrait: "{colour} T-bar shoes" },

    { id: "courts", era: "period", slot: "shoes", years: [1930, 1939], weight: 2,
      colours: ["black", "navy", "brown", "two-tone"],
      fabrics: ["leather", "patent leather", "suede"],
      details: [["", ""]],
      prose: "{colour} {fabric} court shoes with a modest heel",
      portrait: "{colour} {year} court shoes" },

    { id: "brogues", era: "period", slot: "shoes", years: [1930, 1939], weight: 1,
      colours: ["brown", "tan", "oxblood"],
      fabrics: ["leather"],
      details: [["", ""]],
      prose: "sturdy {colour} brogues, polished on Saturday nights",
      portrait: "{colour} leather brogues" },

    { id: "pearls", era: "period", slot: "accessory", years: [1930, 1939], weight: 1,
      colours: [""], fabrics: [""],
      details: [["a single string of pearls, very likely real", "single strand of pearls"]],
      prose: "{detail}", portrait: "{detail}" },

    { id: "brooch", era: "period", slot: "accessory", years: [1930, 1939], weight: 1,
      colours: [""], fabrics: [""],
      details: [["a paste brooch in the shape of a swallow", "small paste swallow brooch"],
                ["a marcasite brooch at the collar", "marcasite brooch"]],
      prose: "{detail}", portrait: "{detail}" },

    { id: "watch", era: "period", slot: "accessory", years: [1930, 1939], weight: 1,
      colours: [""], fabrics: [""],
      details: [["a small wristwatch on a black grosgrain band", "small wristwatch on a black ribbon band"]],
      prose: "{detail}", portrait: "{detail}" },

    /* ---------- The Pit ---------- */

    { id: "jeans", era: "pit", slot: "bottom", years: [1978, 1983], weight: 3,
      colours: ["stonewashed", "faded blue", "black"],
      fabrics: ["denim"],
      details: [["", ""]],
      prose: "a pair of {colour} jeans, worn as though they were nothing to be ashamed of",
      portrait: "{colour} {year} jeans" },

    { id: "cords", era: "pit", slot: "bottom", years: [1975, 1983], weight: 1,
      colours: ["brown", "bottle-green", "mustard"],
      fabrics: ["corduroy"],
      details: [["", ""]],
      prose: "{colour} corduroy trousers gone bald at the knee",
      portrait: "{colour} corduroy {year} trousers" },

    { id: "sweatshirt", era: "pit", slot: "top", years: [1979, 1983], weight: 2,
      colours: ["grey", "navy", "pastel pink", "jade"],
      fabrics: ["sweatshirt cotton"],
      details: [["with the name of an American university on it", "with American college lettering"],
                ["cut wide at the neck", "wide-necked"]],
      prose: "a {colour} sweatshirt {detail}",
      portrait: "{colour} {year} sweatshirt, {detail}" },

    { id: "t-shirt", era: "pit", slot: "top", years: [1977, 1983], weight: 1,
      colours: ["white", "black", "red"],
      fabrics: ["cotton"],
      details: [["advertising a band", "band T-shirt"], ["with a slogan on it", "slogan T-shirt"]],
      prose: "a {colour} T-shirt {detail}",
      portrait: "{colour} {year} {detail}" },

    { id: "batwing", era: "pit", slot: "knit", years: [1980, 1983], weight: 1,
      colours: ["electric blue", "cerise", "black"],
      fabrics: ["acrylic"],
      details: [["", ""]],
      prose: "a {colour} batwing jumper in some synthetic fibre that crackles",
      portrait: "{colour} {year} batwing jumper" },

    { id: "cagoule", era: "pit", slot: "coat", years: [1976, 1983], weight: 2,
      colours: ["orange", "navy", "royal blue"],
      fabrics: ["nylon"],
      details: [["", ""]],
      prose: "a {colour} nylon cagoule that rustles in chapel",
      portrait: "{colour} nylon {year} cagoule" },

    { id: "leather-jacket", era: "pit", slot: "coat", years: [1977, 1983], weight: 1, background: "former punk",
      colours: ["black"], fabrics: ["leather"],
      details: [["covered in studs and safety pins", "studded with safety pins"]],
      prose: "a {colour} leather jacket {detail}",
      portrait: "{colour} {year} punk leather jacket {detail}" },

    { id: "tights", era: "pit", slot: "legs", years: [1975, 1983], weight: 2,
      colours: ["American tan", "black", "navy"],
      fabrics: ["nylon"],
      details: [["", ""]],
      prose: "{colour} tights from a packet",
      portrait: "{colour} tights" },

    { id: "trainers", era: "pit", slot: "shoes", years: [1979, 1983], weight: 2,
      colours: ["white", "grey"],
      fabrics: ["canvas", "nylon"],
      details: [["", ""]],
      prose: "{colour} trainers, which squeak on the hall tiles",
      portrait: "{colour} {year} trainers" },

    { id: "boots", era: "pit", slot: "shoes", years: [1977, 1983], weight: 1,
      colours: ["cherry-red", "black"],
      fabrics: ["leather"],
      details: [["", ""]],
      prose: "{colour} lace-up boots with air-cushioned soles",
      portrait: "{colour} lace-up {year} boots" },

    { id: "digital-watch", era: "pit", slot: "accessory", years: [1978, 1983], weight: 1,
      colours: [""], fabrics: [""],
      details: [["a digital watch that beeps on the hour, including Matins", "black plastic digital watch"]],
      prose: "{detail}", portrait: "{detail}" },

    { id: "earrings", era: "pit", slot: "accessory", years: [1980, 1983], weight: 1,
      colours: [""], fabrics: [""],
      details: [["large plastic earrings", "large plastic earrings"]],
      prose: "{detail}", portrait: "{detail}" }
  ]
};
