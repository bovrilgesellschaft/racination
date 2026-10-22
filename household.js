/*
  RACINATION — household.js
  Milestone 2: making residents, describing them, dressing them,
  writing their portrait descriptions, and moving their meters each week.
  Milestone 3: the same descriptions serve the Mistress (see mistress.js).

  The words and numbers it uses live in the data folder:
  data/appearance.js, data/wardrobe.js and data/residents.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var A = D.appearance, W = D.wardrobe, R = D.residents;

  var rand = Math.random;   // replaced by the engine's seeded generator

  /* ============================================================
     Small helpers
     ============================================================ */

  function randInt(lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); }
  function pick(list) { return list[Math.floor(rand() * list.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function weighted(list, weightOf) {
    var total = 0, i, w;
    var ws = [];
    for (i = 0; i < list.length; i++) {
      w = Math.max(0, Number(weightOf(list[i], i)) || 0);
      ws.push(w); total += w;
    }
    if (total <= 0) return pick(list);
    var r = rand() * total;
    for (i = 0; i < list.length; i++) {
      r -= ws[i];
      if (r < 0) return list[i];
    }
    return list[list.length - 1];
  }

  // A fixed choice for a given woman, so her description does not change between screens.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function fixedPick(list, key) {
    if (!list || !list.length) return "";
    return list[hash(key) % list.length];
  }

  function opt(list, text) {
    for (var i = 0; i < list.length; i++) if (list[i].text === text) return list[i];
    return { text: text, prose: text, portrait: text };
  }

  function fill(template, tokens) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) {
      return tokens[k] != null ? tokens[k] : "";
    });
  }

  function tidy(s) {
    return String(s)
      .replace(/\b([Aa]) ([aeiou])/g, "$1n $2")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:])/g, "$1")
      .replace(/,\s*,/g, ",")
      .replace(/,\./g, ".")
      .trim();
  }

  function capital(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function article(word) { return /^[aeiou]/i.test(word) ? "an" : "a"; }

  function listJoin(items) {
    items = items.filter(Boolean);
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  var NUMBER_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  function heightWords(inches) {
    var ft = Math.floor(inches / 12), inch = inches % 12;
    return NUMBER_WORDS[ft] + " foot" + (inch ? " " + NUMBER_WORDS[inch] : "");
  }

  /* ============================================================
     Lookups
     ============================================================ */

  function background(id) {
    for (var i = 0; i < R.backgrounds.length; i++) if (R.backgrounds[i].id === id) return R.backgrounds[i];
    return R.backgrounds[0];
  }
  function desire(id) {
    for (var i = 0; i < R.desires.length; i++) if (R.desires[i].id === id) return R.desires[i];
    return R.desires[0];
  }
  function duty(id) {
    for (var i = 0; i < R.duties.length; i++) if (R.duties[i].id === id) return R.duties[i];
    return R.duties[R.duties.length - 1];
  }
  function garmentDef(id) {
    for (var i = 0; i < W.garments.length; i++) if (W.garments[i].id === id) return W.garments[i];
    return null;
  }

  /* ============================================================
     Making a resident
     ============================================================ */

  function makeLooks(polarity, pitness) {
    var skin = pick(A.skin);
    var fam = skin.family || "fair";
    var famWeight = function (o) { return o.weights ? (o.weights[fam] != null ? o.weights[fam] : 1) : 1; };

    var eyeColour = weighted(A.eyeColour, famWeight);

    // Hair colour follows polarity, usually.
    var r = rand(), tone;
    if (polarity === "blonde") tone = r < 0.85 ? "fair" : (r < 0.93 ? "red" : "dark");
    else tone = r < 0.85 ? "dark" : (r < 0.93 ? "red" : "fair");
    var hairPool = A.hairColour.filter(function (h) { return h.tone === tone; });
    if (!hairPool.length) hairPool = A.hairColour;
    var hairColour = weighted(hairPool, famWeight);

    var hairLength = pick(A.hairLength);
    var era = rand() < pitness ? "pit" : "period";
    var styles = A.hairStyle.filter(function (s) {
      return s.era === era && (!s.lengths || s.lengths.indexOf(hairLength.text) >= 0);
    });
    if (!styles.length) styles = A.hairStyle.filter(function (s) { return !s.lengths || s.lengths.indexOf(hairLength.text) >= 0; });
    if (!styles.length) styles = A.hairStyle;
    var hairStyle = pick(styles);

    var makeEra = rand() < pitness ? "pit" : "period";
    var makeups = A.makeup.filter(function (m) { return m.era === makeEra; });
    var makeup = pick(makeups.length ? makeups : A.makeup);

    var height = weighted(A.height, function (o, i) { return [1, 2, 3, 4, 4, 3, 2, 1][i] || 1; });
    var physique = weighted(A.physique, function (o, i) { return [1, 2, 3, 4, 3, 2, 1][i] || 1; });
    var bust = randInt(physique.bust[0], physique.bust[1]);
    var waist = randInt(physique.waist[0], physique.waist[1]);
    var hips = randInt(physique.hips[0], physique.hips[1]);
    if (waist > bust - 4) waist = bust - 4;
    if (waist > hips - 6) waist = hips - 6;

    return {
      skin: skin.text,
      eyeColour: eyeColour.text,
      hairColour: hairColour.text,
      hairLength: hairLength.text,
      hairStyle: hairStyle.text,
      makeup: makeup.text,
      height: height.text,
      inches: randInt(height.inches[0], height.inches[1]),
      physique: physique.text,
      bust: bust, waist: waist, hips: hips,
      nose: pick(A.nose).text,
      eyeShape: weighted(A.eyeShape, famWeight).text,
      eyelashes: pick(A.eyelashes).text,
      eyebrows: pick(A.eyebrows).text,
      lips: pick(A.lips).text,
      chin: pick(A.chin).text,
      cheeks: pick(A.cheeks).text,
      face: pick(A.face).text
    };
  }

  function makeGarment(def, source) {
    var colours = def.colours || W.periodColours;
    var g = {
      g: def.id,
      era: def.era,
      slot: def.slot,
      year: randInt(def.years[0], def.years[1]),
      colour: pick(colours),
      fabric: pick(def.fabrics || [""]),
      detail: randInt(0, (def.details || [["", ""]]).length - 1),
      condition: randInt(55, 100),
      source: source || "brought"
    };
    return g;
  }

  function garmentFor(slot, era, bgName) {
    var pool = W.garments.filter(function (d) {
      return d.slot === slot && d.era === era && !d.mistress && (!d.background || d.background === bgName);
    });
    if (!pool.length) return null;
    return weighted(pool, function (d) {
      var w = d.weight || 1;
      if (d.background && d.background === bgName) w *= 4;
      return w;
    });
  }

  function makeWardrobe(pitness, bgName, tenureMonths) {
    var items = [];
    function add(slot, era) {
      var def = garmentFor(slot, era, bgName);
      if (def) items.push(makeGarment(def, era === "period" ? (rand() < 0.5 ? "made" : "bought") : "brought"));
    }
    function era(p) { return rand() < p ? "pit" : "period"; }

    // Her main clothes.
    if (rand() >= pitness * 0.9) {
      if (rand() < 0.65) add("dress", "period");
      else { add("top", "period"); add("bottom", "period"); }
    } else {
      add("top", "pit"); add("bottom", "pit");
    }
    // Something of the other kind as well.
    if (pitness > 0.3 && rand() < 0.7) { add("top", "pit"); add("bottom", "pit"); }
    if (pitness < 0.7) {
      if (rand() < 0.5) add("dress", "period"); else { add("top", "period"); add("bottom", "period"); }
    }
    // Long-standing residents have built up more.
    var extra = Math.min(3, Math.floor(tenureMonths / 18));
    for (var i = 0; i < extra; i++) add(rand() < 0.6 ? "dress" : "top", "period");

    add("legs", era(pitness));
    add("shoes", era(pitness));
    if (rand() < 0.8) add("knit", era(pitness));
    if (rand() < 0.7) add("coat", era(pitness));
    if (rand() < 0.6) add("accessory", era(pitness));
    if (bgName === "former punk") add("coat", "pit");

    // Make sure she can always dress: legs and shoes at least.
    if (!items.some(function (g) { return g.slot === "legs"; })) add("legs", "period");
    if (!items.some(function (g) { return g.slot === "shoes"; })) add("shoes", "period");
    var hasDress = items.some(function (g) { return g.slot === "dress"; });
    var hasTop = items.some(function (g) { return g.slot === "top"; });
    var hasBottom = items.some(function (g) { return g.slot === "bottom"; });
    if (!hasDress && !(hasTop && hasBottom)) add("dress", "period");
    return items;
  }

  function makeResident(id, polarity, usedSurnames, usedFirst) {
    var bg = pick(R.backgrounds);
    var tenure = rand() < 0.3 ? randInt(0, 6) : randInt(7, 60);   // months in the house by January 1983
    var pitness = clamp(bg.pit * (1 - tenure / 30), 0, 1);

    var surname, first, tries = 0;
    do { surname = pick(R.surnames); tries++; } while (usedSurnames.indexOf(surname) >= 0 && tries < 50);
    tries = 0;
    do { first = pick(R.firstNames); tries++; } while (usedFirst.indexOf(first) >= 0 && tries < 50);
    usedSurnames.push(surname); usedFirst.push(first);

    var skills = {};
    R.skills.forEach(function (s) {
      var v = randInt(0, 2) + (bg.skills[s] || 0) + (rand() < 0.25 ? 1 : 0);
      if (s === "programming" && !bg.skills[s]) v = rand() < 0.1 ? 1 : 0;
      skills[s] = clamp(v, 0, 5);
    });

    var nTies = tenure < 12 ? randInt(1, 3) : (tenure < 36 ? randInt(0, 2) : randInt(0, 1));
    var kinds = bg.ties.slice();
    var ties = [];
    while (ties.length < nTies) {
      var kind = kinds.length ? kinds.shift() : pick(Object.keys(R.ties));
      if (ties.some(function (t) { return t.kind === kind; })) { if (!kinds.length && ties.length >= Object.keys(R.ties).length) break; continue; }
      ties.push({ kind: kind, text: pick(R.ties[kind]) });
    }

    var des = weighted(R.desires, function (d) {
      if (!d.polarity) return 2;
      return d.polarity === polarity ? 3 : 0;
    });

    var rac = clamp(Math.round(25 + tenure * 0.8 + randInt(-8, 8) - bg.pit * 10), 8, 80);
    var dev = clamp(Math.round(30 + tenure * 0.6 + randInt(-10, 10) + (bg.id === "nun" ? 15 : 0)), 10, 85);
    var dbt = clamp(Math.round(10 + randInt(0, 20) + ties.length * 4 - tenure * 0.1), 0, 60);

    var natl = weighted(R.nationalities, function (n) { return n.weight; });

    return {
      id: id,
      title: bg.title,
      first: first,
      surname: surname,
      age: randInt(Math.max(R.ages[0], (bg.ages || R.ages)[0]), Math.min(R.ages[1], (bg.ages || R.ages)[1])),
      polarity: polarity,
      nationality: natl.name,
      background: bg.id,
      tenure: tenure,
      skills: skills,
      ties: ties,
      desire: des.id,
      secret: (function () {
        var pool = R.secrets.filter(function (x) { return typeof x === "string" || !x.background || x.background === bg.id; });
        var x = pick(pool.length ? pool : R.secrets);
        return typeof x === "string" ? x : x.text;
      })(),
      looks: makeLooks(polarity, pitness),
      wardrobe: makeWardrobe(pitness, bg.name, tenure),
      duty: "rest",
      prevDuty: null,
      meters: { racination: rac, devotion: dev, doubt: dbt },
      last: { racination: 0, devotion: 0, doubt: 0 }
    };
  }

  function generateHousehold(startId) {
    var n = R.startingHousehold || 8;
    var minEach = R.minimumOfEachPolarity || 3;
    var pols = [];
    for (var i = 0; i < n; i++) pols.push(rand() < 0.5 ? "blonde" : "brunette");
    var count = function (p) { return pols.filter(function (x) { return x === p; }).length; };
    var idx = 0;
    while (count("blonde") < minEach) { pols[idx++ % n] = "blonde"; }
    idx = n - 1;
    while (count("brunette") < minEach) { pols[idx--] = "brunette"; }

    var usedS = [], usedF = [];
    var list = pols.map(function (p, j) { return makeResident(startId + j, p, usedS, usedF); });
    autoRota(list);
    return list;
  }

  /* ============================================================
     The rota
     ============================================================ */

  // Why a woman cannot take a duty, or "" if she can.
  function ineligible(r, d) {
    if (d.polarity && d.polarity !== "any" && d.polarity !== r.polarity) {
      return d.polarity === "blonde" ? "blondes only" : "brunettes only";
    }
    if (d.skill && (r.skills[d.skill] || 0) < (d.minSkill || 0)) {
      return "needs " + R.skillNames[d.skill] + " " + d.minSkill;
    }
    return "";
  }

  function autoRota(list) {
    var order = ["kitchen", "devotions", "sewing", "garden", "kitchen", "laundry", "correspondence", "garden", "guestcare"];
    list.forEach(function (r) { r.duty = null; });
    order.forEach(function (dutyId) {
      var d = duty(dutyId);
      var best = null, bestScore = -1;
      list.forEach(function (r) {
        if (r.duty || ineligible(r, d)) return;
        var s = (d.skill ? r.skills[d.skill] : 0) + rand() * 0.5;
        if (s > bestScore) { bestScore = s; best = r; }
      });
      if (best) best.duty = dutyId;
    });
    list.forEach(function (r) {
      if (r.duty) return;
      var bestD = "rest", bestS = -1;
      R.duties.forEach(function (d) {
        if (d.id === "rest" || d.id === "computing" || ineligible(r, d)) return;
        var s = d.skill ? r.skills[d.skill] : 0;
        if (s > bestS) { bestS = s; bestD = d.id; }
      });
      r.duty = bestD;
    });
  }

  /* ============================================================
     What she wears this week
     ============================================================ */

  function outfit(r, season) {
    var by = {};
    r.wardrobe.forEach(function (g) {
      (by[g.slot] = by[g.slot] || []).push(g);
    });
    function best(slot) {
      var list = by[slot] || [];
      if (!list.length) return null;
      var period = list.filter(function (g) { return g.era === "period"; });
      var pool = period.length ? period : list;
      // The best-kept garment of the preferred kind.
      return pool.slice().sort(function (a, b) { return b.condition - a.condition; })[0];
    }
    var worn = [];
    var dress = best("dress");
    var top = best("top"), bottom = best("bottom");
    var dressPeriod = dress && dress.era === "period";
    var pairPeriod = top && bottom && top.era === "period" && bottom.era === "period";
    if (dress && (dressPeriod || !pairPeriod)) worn.push(dress);
    else if (top && bottom) { worn.push(top); worn.push(bottom); }
    else if (dress) worn.push(dress);

    if (season !== "summer") { var k = best("knit"); if (k) worn.push(k); }
    if (r.duty === "garden" && (season === "winter" || season === "autumn")) { var c = best("coat"); if (c) worn.push(c); }
    var legs = best("legs"); if (legs) worn.push(legs);
    var shoes = best("shoes"); if (shoes) worn.push(shoes);
    var acc = best("accessory"); if (acc) worn.push(acc);
    return worn;
  }

  function periodShare(worn) {
    if (!worn.length) return 0;
    return worn.filter(function (g) { return g.era === "period"; }).length / worn.length;
  }

  function garmentTokens(g, forPortrait) {
    var def = garmentDef(g.g) || { details: [["", ""]] };
    var det = (def.details || [["", ""]])[g.detail] || ["", ""];
    var year = g.era === "period" ? String(g.year) : (g.year >= 1980 ? "1980s" : "1970s");
    return {
      colour: g.colour, fabric: g.fabric, year: year,
      detail: forPortrait ? det[1] : det[0]
    };
  }

  function garmentProse(g) {
    var def = garmentDef(g.g);
    if (!def) return "something the house cannot name";
    return tidy(fill(def.prose, garmentTokens(g, false)));
  }

  function garmentPortrait(g) {
    var def = garmentDef(g.g);
    if (!def) return "";
    return tidy(fill(def.portrait, garmentTokens(g, true)).replace(/with ,/g, "with").replace(/ with$/, ""));
  }

  function garmentName(g) {
    var def = garmentDef(g.g);
    if (!def) return g.g;
    var t = garmentTokens(g, false);
    var label = def.prose.replace(/,.*$/, "");
    return tidy(fill(label, t));
  }

  /* ============================================================
     Moods and expressions
     ============================================================ */

  function moodOf(r) {
    var m = r.meters;
    if (r.isMistress) {
      if (m.doubt >= 55 || m.doubt > m.conviction + 10) return "troubled";
      if (m.conviction >= 75 && m.doubt < 40) return "radiant";
      return "content";
    }
    if (m.racination < 30) return "pit";
    if (m.doubt >= 55) return "troubled";
    if (m.racination >= 75 && m.doubt < 40) return "radiant";
    return "content";
  }

  function expression(r) {
    var mood = moodOf(r);
    var pool = A.expressions.filter(function (e) {
      return e.mood === mood && (!e.polarity || e.polarity === r.polarity);
    });
    if (!pool.length) pool = A.expressions;
    return fixedPick(pool, r.id + ":" + r.first + ":" + mood);
  }

  /* ============================================================
     Description and portrait
     ============================================================ */

  function displayName(r) { return r.title + " " + r.surname; }

  function lookTokens(r) {
    var L = r.looks;
    var phys = opt(A.physique, L.physique);
    var h = opt(A.height, L.height);
    var notes = (A.heightNotes && A.heightNotes[L.height]) || [""];
    return {
      name: displayName(r),
      height: h.prose,
      build: phys.prose,
      heightNote: fixedPick(notes, r.id + "h" + r.surname),
      inches: heightWords(L.inches),
      skin: opt(A.skin, L.skin).prose,
      hairColour: opt(A.hairColour, L.hairColour).prose,
      hairLength: opt(A.hairLength, L.hairLength).prose,
      hairStyle: opt(A.hairStyle, L.hairStyle).prose,
      face: opt(A.face, L.face).prose,
      cheeks: opt(A.cheeks, L.cheeks).prose,
      chin: opt(A.chin, L.chin).prose,
      eyeColour: opt(A.eyeColour, L.eyeColour).prose,
      eyeShape: opt(A.eyeShape, L.eyeShape).prose,
      lashes: opt(A.eyelashes, L.eyelashes).prose,
      brows: opt(A.eyebrows, L.eyebrows).prose,
      nose: opt(A.nose, L.nose).prose,
      lips: opt(A.lips, L.lips).prose,
      makeup: opt(A.makeup, L.makeup).prose,
      figure: (A.figureWords && A.figureWords[L.physique]) || phys.prose,
      bust: L.bust, waist: L.waist, hips: L.hips
    };
  }

  function polarityNote(r) {
    var tone = opt(A.hairColour, r.looks.hairColour).tone;
    if (r.isMistress) return tone === "fair" ? ((D.mistress && D.mistress.fairHairNote) || A.polarityNotes.brunetteFair) : "";
    if (r.polarity === "blonde" && tone === "dark") return A.polarityNotes.blondeDark;
    if (r.polarity === "brunette" && tone === "fair") return A.polarityNotes.brunetteFair;
    return "";
  }

  function appearanceProse(r) {
    var t = lookTokens(r);
    var S = A.sentences;
    var key = r.id + r.surname;
    var parts = [
      fill(fixedPick(S.opening, key + "o"), t),
      fill(fixedPick(S.hair, key + "h"), t),
      polarityNote(r),
      fill(fixedPick(S.face, key + "f"), t),
      fill(fixedPick(S.eyes, key + "e"), t),
      fill(fixedPick(S.figure, key + "g"), t)
    ];
    return tidy(parts.filter(Boolean).join(" "));
  }

  function dressProse(r, season) {
    var worn = outfit(r, season);
    var by = {};
    worn.forEach(function (g) { by[g.slot] = g; });
    var out = [];
    if (by.dress) out.push("She is wearing " + garmentProse(by.dress) + ".");
    else if (by.top && by.bottom) out.push("She is wearing " + garmentProse(by.top) + ", with " + garmentProse(by.bottom) + ".");
    if (by.knit) out.push("Over it she has " + garmentProse(by.knit) + ".");
    if (by.coat) out.push("For the garden she has put on " + garmentProse(by.coat) + ".");
    var below = [by.legs ? garmentProse(by.legs) : "", by.shoes ? garmentProse(by.shoes) : ""].filter(Boolean);
    if (below.length) out.push("Below are " + listJoin(below) + ".");
    if (by.accessory) out.push("She wears " + garmentProse(by.accessory) + ".");
    return tidy(out.join(" "));
  }

  function fullDescription(r, season) {
    return {
      appearance: appearanceProse(r),
      dress: dressProse(r, season),
      expression: expression(r).prose
    };
  }

  function portrait(r, season) {
    var L = r.looks;
    var heightP = opt(A.height, L.height).portrait;
    var buildP = opt(A.physique, L.physique).portrait;
    var lead = heightP + ", " + buildP;
    var person = article(lead) + " " + lead + " " + r.nationality + " woman aged " + r.age;
    var mk = opt(A.makeup, L.makeup).portrait;
    var bits = [
      capital(person),
      opt(A.skin, L.skin).portrait,
      opt(A.face, L.face).portrait,
      opt(A.cheeks, L.cheeks).portrait,
      opt(A.hairLength, L.hairLength).portrait + " " + opt(A.hairColour, L.hairColour).portrait + " hair " + opt(A.hairStyle, L.hairStyle).portrait,
      opt(A.eyeShape, L.eyeShape).portrait + " " + opt(A.eyeColour, L.eyeColour).portrait + " eyes",
      opt(A.eyebrows, L.eyebrows).portrait,
      opt(A.lips, L.lips).portrait + (mk ? ", " + mk : ""),
      r.markPortrait || "",
      expression(r).portrait
    ].filter(Boolean);

    var worn = outfit(r, season);
    var upper = [], lower = [];
    worn.forEach(function (g) {
      var p = garmentPortrait(g);
      if (!p) return;
      if (g.slot === "legs" || g.slot === "shoes" || g.slot === "accessory") lower.push(p);
      else upper.push(p);
    });
    var clothes = capital(upper.join(", ")) + (lower.length ? "; " + lower.join(", ") : "");
    var setting = capital(r.setting || duty(r.duty).setting || "Victorian rectory drawing room");

    return tidy("Colour studio photograph, three-quarter length. " + bits.join(", ") + ". " + clothes + ". " + setting + ", soft studio light.");
  }

  /* ============================================================
     The week
     ============================================================ */

  function weekly(r, season, opts) {
    opts = opts || {};
    var periodMult = opts.periodMult != null ? opts.periodMult : 1;
    var pitMult = opts.pitMult != null ? opts.pitMult : 1;
    var d = R.drift;
    var du = duty(r.duty);
    var des = desire(r.desire);
    var worn = outfit(r, season);
    var share = periodShare(worn);
    var m = r.meters;
    var before = { racination: m.racination, devotion: m.devotion, doubt: m.doubt };

    var dRac = share * d.dressPeriod * periodMult + (1 - share) * d.dressPit * pitMult;
    var dDev = (share - 0.5) * 2 * d.dressDevotion * (share >= 0.5 ? periodMult : pitMult);
    var dDbt = 0;

    dRac += du.racination || 0;
    dDev += du.devotion || 0;
    dDbt += du.doubt || 0;

    if (du.skill) dRac += d.skillBonus * (r.skills[du.skill] || 0);
    if (des.likes.indexOf(du.id) >= 0) { dRac += d.likedDuty; dDbt += d.likedDutyDoubt; }

    dRac += d.perTie * r.ties.length;
    dDbt += d.perTieDoubt * r.ties.length;

    if (m.devotion >= 70) dDbt += d.devotionCalmsDoubt;
    if (m.racination >= 70) dDbt += d.racinationCalmsDoubt;
    if (m.doubt >= 60) dDev += d.doubtErodesDevotion;

    if (dRac > 0 && d.taper) dRac *= clamp((d.taper - m.racination) / 60, 0.15, 1.3);
    dRac += (rand() * 2 - 1) * d.noise;
    dDev += (rand() * 2 - 1) * d.noise;
    dDbt += (rand() * 2 - 1) * d.noise;

    m.racination = clamp(m.racination + dRac, 0, 100);
    m.devotion = clamp(m.devotion + dDev, 0, 100);
    m.doubt = clamp(m.doubt + dDbt, 0, 100);

    r.last = {
      racination: m.racination - before.racination,
      devotion: m.devotion - before.devotion,
      doubt: m.doubt - before.doubt
    };
    r.prevDuty = r.duty;

    var events = [];
    var name = displayName(r);
    // Giving up Pit styles once she is racinated enough.
    if (m.racination >= R.periodStyleAt) {
      var hs = opt(A.hairStyle, r.looks.hairStyle);
      if (hs.era === "pit") {
        var choices = A.hairStyle.filter(function (s) {
          return s.era === "period" && (!s.lengths || s.lengths.indexOf(r.looks.hairLength) >= 0);
        });
        if (choices.length) {
          r.looks.hairStyle = pick(choices).text;
          events.push(fill(R.restyleLines.hair, { name: name }));
        }
      }
      var mk = opt(A.makeup, r.looks.makeup);
      if (mk.era === "pit") {
        var ms = A.makeup.filter(function (x) { return x.era === "period"; });
        if (ms.length) {
          r.looks.makeup = pick(ms).text;
          events.push(fill(R.restyleLines.makeup, { name: name }));
        }
      }
    }
    var departs = m.racination >= 100;
    return { events: events, departs: departs, share: share };
  }

  function departureLine(r) {
    return fill(pick(R.departureLines), { name: displayName(r) });
  }

  function householdMood(list) {
    if (!list.length) return "";
    var counts = { radiant: 0, content: 0, troubled: 0, pit: 0 };
    list.forEach(function (r) { counts[moodOf(r)]++; });
    var top = "content", n = -1;
    ["troubled", "pit", "radiant", "content"].forEach(function (k) {
      if (counts[k] > n) { n = counts[k]; top = k; }
    });
    return fixedPick(R.moodLines[top], String(list.length) + top + n);
  }

  /* ============================================================
     Shared with the engine
     ============================================================ */

  window.RACINATION_HOUSEHOLD = {
    setRandom: function (fn) { rand = fn; },
    generateHousehold: generateHousehold,
    makeResident: makeResident,
    autoRota: autoRota,
    ineligible: ineligible,
    duty: duty,
    duties: function () { return R.duties; },
    background: background,
    desire: desire,
    displayName: displayName,
    describe: fullDescription,
    portrait: portrait,
    outfit: outfit,
    periodShare: periodShare,
    garmentName: garmentName,
    garmentProse: garmentProse,
    moodOf: moodOf,
    weekly: weekly,
    departureLine: departureLine,
    householdMood: householdMood,
    skillNames: R.skillNames,
    skills: R.skills,
    polarities: R.polarities,
    lines: R,

    // Helpers shared with mistress.js
    helpers: {
      pick: function (l) { return pick(l); },
      randInt: function (a, b) { return randInt(a, b); },
      clamp: clamp, opt: opt, fill: fill, tidy: tidy, capital: capital,
      fixedPick: fixedPick, garmentDef: garmentDef, makeGarment: function (d, s) { return makeGarment(d, s); },
      appearanceProse: appearanceProse, dressProse: dressProse, expression: expression
    }
  };

})();
