/*
  RACINATION — data/appearance.js
  ---------------------------------------------------------------
  The appearance lists, from Edmund's PhysicalAttributes spreadsheet,
  with the agreed changes:
    - bust and buttock size replaced by dressmaker's measurements,
      worked out from Physique (see "physique" below);
    - colouring weighted so that faces hang together;
    - smiles and passing looks moved to "expressions", which follow
      a woman's meters;
    - new lists for hair style and make-up.

  Each option has:
    text     — the name as it appears in the spreadsheet
    prose    — the words the game's own descriptions use
    portrait — the plain words used in the portrait description

  Optional:
    weights  — how likely it is for each complexion family
               (fair, medium, deep). Leave out for "equally likely".
    lengths  — (hair styles only) which hair lengths it suits.

  To add an option, copy a line, change the words and keep the
  comma at the end. Removing an option is safe too.
  ---------------------------------------------------------------
*/

window.RACINATION_DATA = window.RACINATION_DATA || {};

window.RACINATION_DATA.appearance = {

  /* ---------- Colouring ---------- */

  // family groups complexions so eye and hair colour can follow.
  skin: [
    { text: "fair",        family: "fair",   prose: "a fair complexion",        portrait: "fair skin" },
    { text: "olive",       family: "medium", prose: "an olive complexion",      portrait: "olive skin" },
    { text: "beige",       family: "fair",   prose: "a pale beige complexion",  portrait: "light beige skin" },
    { text: "gold-beige",  family: "medium", prose: "a golden complexion",      portrait: "golden beige skin" },
    { text: "tan",         family: "medium", prose: "a warm tan complexion",    portrait: "tan skin" },
    { text: "light brown", family: "deep",   prose: "a light brown complexion", portrait: "light brown skin" },
    { text: "brown",       family: "deep",   prose: "a brown complexion",       portrait: "brown skin" }
  ],

  eyeColour: [
    { text: "blue",        prose: "blue",        portrait: "blue",        weights: { fair: 5, medium: 1.5, deep: 0.2 } },
    { text: "green",       prose: "green",       portrait: "green",       weights: { fair: 3, medium: 2, deep: 0.3 } },
    { text: "hazel",       prose: "hazel",       portrait: "hazel",       weights: { fair: 3, medium: 3, deep: 1 } },
    { text: "light brown", prose: "light brown", portrait: "light brown", weights: { fair: 2, medium: 3, deep: 2 } },
    { text: "brown",       prose: "brown",       portrait: "brown",       weights: { fair: 2, medium: 4, deep: 4 } },
    { text: "dark brown",  prose: "dark brown",  portrait: "dark brown",  weights: { fair: 1, medium: 3, deep: 5 } },
    { text: "grey",        prose: "grey",        portrait: "grey",        weights: { fair: 4, medium: 1, deep: 0.2 } },
    { text: "black",       prose: "so dark as to be nearly black", portrait: "near-black", weights: { fair: 0.2, medium: 1, deep: 3 } }
  ],

  /*
    tone decides how hair colour follows polarity:
    blondes are usually "fair", brunettes usually "dark", and "red" is rare for either.
  */
  hairColour: [
    { text: "blonde",            tone: "fair", prose: "blonde",            portrait: "blonde",            weights: { fair: 5, medium: 1, deep: 0.1 } },
    { text: "pale blonde",       tone: "fair", prose: "pale blonde",       portrait: "pale blonde",       weights: { fair: 4, medium: 0.5, deep: 0.1 } },
    { text: "dirty blonde",      tone: "fair", prose: "dark-gold",         portrait: "dirty blonde",      weights: { fair: 3, medium: 2, deep: 0.3 } },
    { text: "dark blonde",       tone: "fair", prose: "dark blonde",       portrait: "dark blonde",       weights: { fair: 3, medium: 2, deep: 0.3 } },
    { text: "strawberry blonde", tone: "fair", prose: "strawberry-blonde", portrait: "strawberry blonde", weights: { fair: 3, medium: 0.5, deep: 0.1 } },
    { text: "ginger",            tone: "red",  prose: "ginger",            portrait: "ginger",            weights: { fair: 3, medium: 0.5, deep: 0.1 } },
    { text: "red",               tone: "red",  prose: "red",               portrait: "red",               weights: { fair: 3, medium: 1, deep: 0.2 } },
    { text: "dark red",          tone: "red",  prose: "dark red",          portrait: "dark auburn red",   weights: { fair: 2, medium: 2, deep: 0.5 } },
    { text: "light brown",       tone: "dark", prose: "light brown",       portrait: "light brown",       weights: { fair: 4, medium: 2, deep: 1 } },
    { text: "brown",             tone: "dark", prose: "brown",             portrait: "brown",             weights: { fair: 3, medium: 4, deep: 3 } },
    { text: "dark brown",        tone: "dark", prose: "dark brown",        portrait: "dark brown",        weights: { fair: 3, medium: 4, deep: 4 } },
    { text: "black",             tone: "dark", prose: "black",             portrait: "black",             weights: { fair: 1, medium: 3, deep: 5 } },
    { text: "raven",             tone: "dark", prose: "raven-black",       portrait: "glossy raven-black", weights: { fair: 1, medium: 2, deep: 3 } }
  ],

  /* ---------- Hair ---------- */

  hairLength: [
    { text: "close-cropped",    prose: "cropped close to the head", portrait: "close-cropped" },
    { text: "very short",       prose: "very short",                portrait: "very short" },
    { text: "short",            prose: "short",                     portrait: "short" },
    { text: "ear-length",       prose: "ear-length",                portrait: "ear-length" },
    { text: "chin-length",      prose: "chin-length",               portrait: "chin-length" },
    { text: "shoulder-length",  prose: "shoulder-length",           portrait: "shoulder-length" },
    { text: "mid-back length",  prose: "long, to the middle of her back", portrait: "long" },
    { text: "waist-length",     prose: "long enough to sit on",     portrait: "very long" }
  ],

  /*
    Hair styles. era "period" is 1930s; era "pit" is how a woman arrives.
    A Pit style is reset to a period one once a resident's Racination is high enough.
  */
  hairStyle: [
    { text: "Eton crop",     era: "period", lengths: ["close-cropped", "very short"],
      prose: "brushed flat and sleek in an Eton crop", portrait: "in a sleek brushed Eton crop" },
    { text: "shingle",       era: "period", lengths: ["very short", "short"],
      prose: "cut in a neat shingle at the nape", portrait: "in a neat shingled cut" },
    { text: "finger waves",  era: "period", lengths: ["short", "ear-length", "chin-length"],
      prose: "set in close finger waves", portrait: "in close finger waves" },
    { text: "Marcel waves",  era: "period", lengths: ["ear-length", "chin-length", "shoulder-length"],
      prose: "set in deep Marcel waves", portrait: "in deep Marcel waves" },
    { text: "pin curls",     era: "period", lengths: ["short", "ear-length", "chin-length", "shoulder-length"],
      prose: "set overnight in pin curls and brushed out soft", portrait: "in soft brushed-out pin curls" },
    { text: "waves and chignon", era: "period", lengths: ["shoulder-length", "mid-back length"],
      prose: "set in finger waves and gathered into a low knot at the nape", portrait: "in finger waves with a low chignon" },
    { text: "pageboy roll",  era: "period", lengths: ["chin-length", "shoulder-length"],
      prose: "turned under in a smooth pageboy roll", portrait: "in a smooth turned-under pageboy roll" },
    { text: "low chignon",   era: "period", lengths: ["shoulder-length", "mid-back length", "waist-length"],
      prose: "drawn back from a centre parting into a low chignon", portrait: "parted in the centre and drawn back into a low chignon" },
    { text: "coronet plaits", era: "period", lengths: ["mid-back length", "waist-length"],
      prose: "plaited and pinned round her head in a coronet", portrait: "in plaits pinned round the head like a coronet" },

    { text: "perm",          era: "pit", lengths: ["short", "ear-length", "chin-length", "shoulder-length"],
      prose: "permed into a frizz of the kind the Pit admires", portrait: "in a frizzy 1980s perm" },
    { text: "feathered cut", era: "pit", lengths: ["chin-length", "shoulder-length"],
      prose: "cut in feathers and blown dry, as if by a gale", portrait: "in a feathered, blow-dried 1980s cut" },
    { text: "spiky crop",    era: "pit", lengths: ["close-cropped", "very short", "short"],
      prose: "standing up in spikes, with sugar water or worse", portrait: "in a spiky 1980s crop" },
    { text: "fringe and ponytail", era: "pit", lengths: ["shoulder-length", "mid-back length", "waist-length"],
      prose: "scraped into a ponytail under a heavy fringe", portrait: "in a ponytail with a heavy fringe" },
    { text: "loose",         era: "pit", lengths: ["shoulder-length", "mid-back length", "waist-length"],
      prose: "worn loose and largely unbrushed", portrait: "worn loose and unstyled" },
    { text: "crimped",       era: "pit", lengths: ["shoulder-length", "mid-back length"],
      prose: "crimped, apparently on purpose", portrait: "crimped in a 1980s style" }
  ],

  /* ---------- Figure ---------- */

  // Height in inches (low to high) is used for the prose.
  height: [
    { text: "very short",   inches: [58, 59], prose: "very short",    portrait: "very short" },
    { text: "short",        inches: [60, 61], prose: "short",         portrait: "short" },
    { text: "rather short", inches: [62, 63], prose: "rather short",  portrait: "fairly short" },
    { text: "average",      inches: [64, 65], prose: "middling-tall", portrait: "average-height" },
    { text: "rather tall",  inches: [66, 67], prose: "rather tall",   portrait: "fairly tall" },
    { text: "tall",         inches: [68, 69], prose: "tall",          portrait: "tall" },
    { text: "very tall",    inches: [70, 71], prose: "very tall",     portrait: "very tall" },
    { text: "towering",     inches: [72, 74], prose: "towering",      portrait: "very tall, over six feet" }
  ],

  /*
    Physique sets the dressmaker's measurements, in inches:
    bust, waist and hips, each as [lowest, highest]. All are adult figures.
  */
  physique: [
    { text: "skinny",  prose: "spare",     portrait: "very slim",            bust: [32, 33], waist: [23, 25], hips: [33, 35] },
    { text: "thin",    prose: "thin",      portrait: "slim",                 bust: [32, 34], waist: [24, 26], hips: [34, 36] },
    { text: "slender", prose: "slender",   portrait: "slender",              bust: [33, 35], waist: [24, 27], hips: [35, 37] },
    { text: "average", prose: "well-made", portrait: "medium-build",         bust: [34, 37], waist: [27, 30], hips: [36, 39] },
    { text: "curvy",   prose: "shapely",   portrait: "curvaceous",           bust: [36, 40], waist: [26, 29], hips: [38, 42] },
    { text: "plump",   prose: "plump",     portrait: "plump",                bust: [38, 42], waist: [31, 35], hips: [40, 44] },
    { text: "round",   prose: "generous",  portrait: "full-figured",         bust: [40, 44], waist: [34, 38], hips: [42, 46] }
  ],

  // How the figure is described, by physique.
  figureWords: {
    skinny: "spare", thin: "thin", slender: "slender", average: "well proportioned",
    curvy: "an hourglass", plump: "comfortable", round: "generous"
  },

  /* ---------- Features ---------- */

  nose: [
    { text: "button nose",       prose: "a small nose",          portrait: "small nose" },
    { text: "delicate nose",     prose: "a delicate nose",       portrait: "delicate nose" },
    { text: "flat-tipped nose",  prose: "a flat-tipped nose",    portrait: "flat-tipped nose" },
    { text: "sharp nose",        prose: "a sharp nose",          portrait: "sharp, straight nose" },
    { text: "prominent nose",    prose: "a prominent nose",      portrait: "prominent nose" },
    { text: "wide nose",         prose: "a wide nose",           portrait: "wide nose" },
    { text: "broad nose",        prose: "a broad nose",          portrait: "broad nose" },
    { text: "bulbous nose",      prose: "a bulbous nose",        portrait: "bulbous nose" },
    { text: "crooked nose",      prose: "a nose broken once and set by an optimist", portrait: "slightly crooked nose" },
    { text: "upturned nose",     prose: "an upturned nose",      portrait: "upturned nose" },
    { text: "freckled nose",     prose: "a freckled nose",       portrait: "freckled nose" }
  ],

  eyeShape: [
    { text: "narrow eyes",        prose: "narrow",          portrait: "narrow",        weights: { fair: 1, medium: 1, deep: 1 } },
    { text: "heavy-lidded eyes",  prose: "heavy-lidded",    portrait: "heavy-lidded" },
    { text: "almond-shaped eyes", prose: "almond-shaped",   portrait: "almond-shaped" },
    { text: "hooded eyes",        prose: "hooded",          portrait: "hooded" },
    { text: "deep-set eyes",      prose: "deep-set",        portrait: "deep-set" },
    { text: "wide-set eyes",      prose: "wide-set",        portrait: "wide-set" },
    { text: "large eyes",         prose: "large",           portrait: "large" },
    { text: "prominent eyes",     prose: "prominent",       portrait: "prominent" },
    { text: "upturned eyes",      prose: "tilted upward at the corners", portrait: "upturned" },
    { text: "downturned eyes",    prose: "turned down at the corners",   portrait: "downturned" },
    { text: "slender eyes",       prose: "long and slender", portrait: "long, slender" },
    { text: "monolid eyes",       prose: "smooth-lidded",   portrait: "monolid",       weights: { fair: 0.5, medium: 1, deep: 0.6 } }
  ],

  eyelashes: [
    { text: "long eyelashes",  prose: "long-lashed",     portrait: "long eyelashes" },
    { text: "thick eyelashes", prose: "thick-lashed",    portrait: "thick eyelashes" },
    { text: "curly eyelashes", prose: "curling-lashed",  portrait: "curled eyelashes" },
    { text: "wispy eyelashes", prose: "wispy-lashed",    portrait: "wispy eyelashes" },
    { text: "sparse eyelashes", prose: "sparsely lashed", portrait: "sparse eyelashes" }
  ],

  eyebrows: [
    { text: "thin eyebrows",          prose: "thin brows",                      portrait: "thin eyebrows" },
    { text: "plucked eyebrows",       prose: "brows plucked to a fine pencilled arch", portrait: "thin pencilled arched eyebrows" },
    { text: "thick eyebrows",         prose: "thick brows",                     portrait: "thick eyebrows" },
    { text: "bushy eyebrows",         prose: "bushy brows",                     portrait: "bushy eyebrows" },
    { text: "arched eyebrows",        prose: "arched brows",                    portrait: "arched eyebrows" },
    { text: "unkempt eyebrows",       prose: "brows that have never been told", portrait: "unshaped eyebrows" },
    { text: "expressive eyebrows",    prose: "expressive brows",                portrait: "expressive eyebrows" },
    { text: "straight eyebrows",      prose: "straight brows",                  portrait: "straight eyebrows" },
    { text: "well-groomed eyebrows",  prose: "well-kept brows",                 portrait: "neat eyebrows" }
  ],

  lips: [
    { text: "thin lips",         prose: "thin lips",          portrait: "thin lips" },
    { text: "full lips",         prose: "full lips",          portrait: "full lips" },
    { text: "bow-shaped lips",   prose: "a small bow-shaped mouth", portrait: "bow-shaped lips" },
    { text: "curved lips",       prose: "a curving mouth",    portrait: "curved lips" },
    { text: "wide lips",         prose: "a wide mouth",       portrait: "wide mouth" },
    { text: "heart-shaped lips", prose: "a heart-shaped mouth", portrait: "heart-shaped lips" },
    { text: "plump lips",        prose: "plump lips",         portrait: "plump lips" }
  ],

  chin: [
    { text: "pointed chin",  prose: "a pointed chin",  portrait: "pointed chin" },
    { text: "large chin",    prose: "a large chin",    portrait: "strong chin" },
    { text: "square chin",   prose: "a square chin",   portrait: "square chin" },
    { text: "cleft chin",    prose: "a cleft chin",    portrait: "cleft chin" },
    { text: "dimpled chin",  prose: "a dimpled chin",  portrait: "dimpled chin" },
    { text: "jutting chin",  prose: "a jutting chin",  portrait: "jutting chin" },
    { text: "weak chin",     prose: "a retiring chin", portrait: "small receding chin" },
    { text: "sharp chin",    prose: "a sharp chin",    portrait: "sharp chin" }
  ],

  cheeks: [
    { text: "high cheekbones",  prose: "high cheekbones",       portrait: "high cheekbones" },
    { text: "sharp cheekbones", prose: "sharp cheekbones",      portrait: "sharp cheekbones" },
    { text: "round cheeks",     prose: "round cheeks",          portrait: "round cheeks" },
    { text: "hollow cheeks",    prose: "hollow cheeks",         portrait: "hollow cheeks" },
    { text: "rosy cheeks",      prose: "cheeks pink from the cold house", portrait: "rosy cheeks" },
    { text: "freckled cheeks",  prose: "freckled cheeks",       portrait: "freckled cheeks" },
    { text: "dimples",          prose: "dimples",               portrait: "dimpled cheeks" }
  ],

  face: [
    { text: "heart-shaped face", prose: "heart-shaped",    portrait: "heart-shaped face" },
    { text: "oval-shaped face",  prose: "a long oval",     portrait: "oval face" },
    { text: "round face",        prose: "round",           portrait: "round face" },
    { text: "sharp-featured face", prose: "sharp-featured", portrait: "sharp-featured face" },
    { text: "angular face",      prose: "angular",         portrait: "angular face" },
    { text: "rough-hewn face",   prose: "rough-hewn",      portrait: "strong, rough-hewn face" },
    { text: "pockmarked face",   prose: "lightly pockmarked", portrait: "lightly pockmarked face" },
    { text: "soft-featured face", prose: "soft-featured",  portrait: "soft-featured face" },
    { text: "freckled face",     prose: "freckled",        portrait: "freckled face" },
    { text: "dimpled face",      prose: "dimpled",         portrait: "dimpled face" }
  ],

  /* ---------- Make-up (new) ---------- */

  makeup: [
    { text: "red mouth",     era: "period", prose: ", painted a sensible red",               portrait: "red lipstick" },
    { text: "dark red",      era: "period", prose: ", painted a dark claret red",            portrait: "dark red lipstick" },
    { text: "powder and rouge", era: "period", prose: ", with a little powder and a touch of rouge", portrait: "light powder and rouge, soft red lipstick" },
    { text: "bare",          era: "period", prose: ", unpainted, with only cold cream to answer for", portrait: "no make-up" },
    { text: "blue eyeshadow", era: "pit",   prose: ", and a smear of blue eyeshadow she has not yet given up", portrait: "blue 1980s eyeshadow, pink lipstick" },
    { text: "frosted pink",  era: "pit",    prose: ", frosted pink in the modern way",       portrait: "frosted pink 1980s lipstick" },
    { text: "black liner",   era: "pit",    prose: ", and a good deal of black eyeliner",    portrait: "heavy black eyeliner" }
  ],

  /* ---------- Expressions ---------- */

  /*
    These change with a woman's meters:
      radiant  — high Racination, little Doubt
      content  — the ordinary run of things
      troubled — high Doubt
      pit      — low Racination, the outside world still on her
    polarity (optional) limits an expression to blondes or brunettes.
  */
  expressions: [
    { mood: "radiant",  prose: "She smiles readily now, with a joy she does not trouble to hide.", portrait: "joyful smile" },
    { mood: "radiant",  prose: "Her eyes are bright, and she looks at the world as though it had lately been returned to her.", portrait: "bright eyes, warm smile" },
    { mood: "radiant",  prose: "She has a captivating smile and has recently remembered how to use it.", portrait: "captivating smile" },
    { mood: "radiant",  prose: "An easy smile comes and goes on her face like sun on a lawn.", portrait: "easy, gentle smile" },

    { mood: "content",  prose: "She smiles rarely and enigmatically, in the manner of a woman who has filed the joke for later.", portrait: "faint enigmatic smile" },
    { mood: "content",  prose: "She has a crooked smile, which she uses sparingly.", portrait: "slight crooked smile" },
    { mood: "content",  prose: "She has a dimpled smile, which the house has learned to look for.", portrait: "dimpled smile" },
    { mood: "content",  prose: "Her eyes are sleepy and amused, as if she had been told something comfortable.", portrait: "calm, sleepy-eyed expression" },
    { mood: "content",  polarity: "brunette", prose: "Her gaze is piercing, and she knows it.", portrait: "piercing, composed gaze" },
    { mood: "content",  polarity: "blonde", prose: "She looks out at the room with a soft, waiting attention.", portrait: "soft, attentive expression" },

    { mood: "troubled", prose: "Her smile has gone tight-lipped lately.", portrait: "tight-lipped smile" },
    { mood: "troubled", prose: "She grins nervously when spoken to, as if expecting the question to be a trick.", portrait: "nervous grin" },
    { mood: "troubled", prose: "There is a furrow in her brow that was not there at Michaelmas.", portrait: "furrowed brow, unsmiling" },
    { mood: "troubled", prose: "Her eyes have a hollow look, and the Housekeeper has noticed it.", portrait: "hollow, tired eyes" },
    { mood: "troubled", prose: "She has a sallow, haggard look about her this week.", portrait: "pale, drawn expression" },
    { mood: "troubled", polarity: "brunette", prose: "Her brow is stern, and nobody is quite sure at whom.", portrait: "stern expression" },

    { mood: "pit",      prose: "She smiles a bright professional smile, which she learnt in an office and has not yet put down.", portrait: "bright professional smile" },
    { mood: "pit",      prose: "She grins with a cockiness the house hopes is temporary.", portrait: "cocky grin" },
    { mood: "pit",      prose: "She narrows her eyes at everything, as at a television picture.", portrait: "narrowed eyes, sceptical look" },
    { mood: "pit",      prose: "Her eyes have the flat look of the motorway service station.", portrait: "flat, guarded expression" }
  ],

  /* ---------- Sentences used to build the description ---------- */

  /*
    Tokens in curly brackets are filled in by the game:
      {name} {height} {build} {heightNote} {skin} {hairColour} {hairLength} {hairStyle}
      {face} {cheeks} {chin} {eyeColour} {eyeShape} {lashes} {brows} {nose} {lips} {makeup}
      {figure} {bust} {waist} {hips} {inches}
    One of each list is chosen for each woman, and stays with her.
  */
  sentences: {
    opening: [
      "{name} is a {height}, {build} woman{heightNote}.",
      "{name} is {height} and {build}.",
      "{name} stands {inches} in her stockinged feet, a {build} woman{heightNote}."
    ],
    hair: [
      "She has {skin}; her {hairColour} hair is {hairLength} and {hairStyle}.",
      "She has {skin}, and her {hairColour} hair, {hairLength}, is {hairStyle}."
    ],
    face: [
      "Her face is {face}, with {cheeks} and {chin}.",
      "The face is {face}: {cheeks}, {chin}."
    ],
    eyes: [
      "Her eyes are {eyeColour} and {eyeShape}, {lashes}, under {brows}. She has {nose} and {lips}{makeup}.",
      "The eyes are {eyeColour}, {eyeShape} and {lashes}, beneath {brows}; there is {nose}, and {lips}{makeup}."
    ],
    figure: [
      "Her figure is {figure}, {bust}–{waist}–{hips} by the Sewing Room's tape.",
      "By the Sewing Room's tape she is {bust}–{waist}–{hips}, a figure the dressmaker calls {figure}.",
      "The Sewing Room has her down as {bust}–{waist}–{hips}: {figure}, and no trouble to fit."
    ]
  },

  // Added after "woman" in the opening sentence, by height.
  heightNotes: {
    "very short": [", who has never in her life reached the top shelf and has stopped pretending to want to", ""],
    "short": [", compact and quick on the stairs", ""],
    "rather short": ["", ", neat as a pin"],
    "average": ["", ", of the height dress patterns are drawn for"],
    "rather tall": ["", ", who stoops a little in doorways out of courtesy"],
    "tall": [", who carries her height as though it had been issued to her and she meant to return it in good condition", ""],
    "very tall": [", who has to duck under the scullery beam and does so with dignity", ""],
    "towering": [", who makes the Drawing Room look underfurnished", ", who frightens the coalman"]
  },

  // Said when hair colour goes against polarity.
  polarityNotes: {
    blondeDark: "Her hair is darker than doctrine would like, and the house has views on it.",
    brunetteFair: "That a brunette should be so fair is a matter on which the house has views."
  }
};
