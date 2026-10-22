/*
  RACINATION — mistress.js
  Milestone 3: the Mistress. Random choices for the creation screen,
  building her from those choices, her description and portrait,
  her text tokens ({mistress.hair} and so on), and her weekly meters.

  The words and numbers live in data/mistress.js and data/appearance.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var M = D.mistress, A = D.appearance, W = D.wardrobe, R = D.residents;
  var H = window.RACINATION_HOUSEHOLD;
  if (!M || !H) return;
  var h = H.helpers;

  /* ============================================================
     Lookups
     ============================================================ */

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function voice(id) { return byId(M.voices, id); }
  function mark(id) { return byId(M.marks, id); }
  function scent(id) { return byId(M.scents, id); }
  function style(id) { return byId(M.styles, id); }
  function background(id) { return byId(M.backgrounds, id); }

  // Hair styles and make-up she may choose: 1930s only, and suited to her hair length.
  function hairStylesFor(length) {
    var list = A.hairStyle.filter(function (s) {
      return s.era === "period" && (!s.lengths || s.lengths.indexOf(length) >= 0);
    });
    return list.length ? list : A.hairStyle.filter(function (s) { return s.era === "period"; });
  }
  function makeupChoices() {
    return A.makeup.filter(function (m) { return m.era === "period"; });
  }

  /* ============================================================
     Random choices (the "Choose for me" buttons)
     ============================================================ */

  function randomName(d) {
    d.title = h.pick(M.titles);
    d.first = h.pick(M.firstNames);
    var taken = [];
    var tries = 0, s;
    do { s = h.pick(M.surnames); tries++; } while (taken.indexOf(s) >= 0 && tries < 20);
    d.surname = s;
  }

  function randomAge(d) {
    d.age = h.randInt(M.ages[0], M.ages[1]);
    d.nationality = h.pick(M.nationalities);
  }

  function remeasure(d) {
    var p = h.opt(A.physique, d.looks.physique);
    if (!p.bust) return;
    var bust = h.randInt(p.bust[0], p.bust[1]);
    var waist = h.randInt(p.waist[0], p.waist[1]);
    var hips = h.randInt(p.hips[0], p.hips[1]);
    if (waist > bust - 4) waist = bust - 4;
    if (waist > hips - 6) waist = hips - 6;
    d.looks.bust = bust; d.looks.waist = waist; d.looks.hips = hips;
  }

  function reheight(d) {
    var ht = h.opt(A.height, d.looks.height);
    d.looks.inches = ht.inches ? h.randInt(ht.inches[0], ht.inches[1]) : 65;
  }

  function randomLooks(d) {
    var L = {};
    L.skin = h.pick(A.skin).text;
    L.hairColour = h.pick(A.hairColour).text;
    L.hairLength = h.pick(A.hairLength).text;
    L.hairStyle = h.pick(hairStylesFor(L.hairLength)).text;
    L.makeup = h.pick(makeupChoices()).text;
    L.eyeColour = h.pick(A.eyeColour).text;
    L.eyeShape = h.pick(A.eyeShape).text;
    L.eyelashes = h.pick(A.eyelashes).text;
    L.eyebrows = h.pick(A.eyebrows).text;
    L.nose = h.pick(A.nose).text;
    L.lips = h.pick(A.lips).text;
    L.chin = h.pick(A.chin).text;
    L.cheeks = h.pick(A.cheeks).text;
    L.face = h.pick(A.face).text;
    L.height = h.pick(A.height).text;
    L.physique = h.pick(A.physique).text;
    d.looks = L;
    reheight(d);
    remeasure(d);
  }

  function randomManner(d) {
    d.voice = h.pick(M.voices).id;
    d.mark = h.pick(M.marks).id;
    d.scent = h.pick(M.scents).id;
  }

  function randomStyle(d) { d.style = h.pick(M.styles).id; ensureWardrobe(d); }

  // Her clothes are made once for each style she picks, so the preview does not change colour at every keystroke.
  function ensureWardrobe(d) {
    if (!d.wardrobe || d.wardrobeStyle !== d.style) {
      d.wardrobe = makeWardrobe(d.style);
      d.wardrobeStyle = d.style;
    }
  }
  function randomBackground(d) { d.background = h.pick(M.backgrounds).id; }

  function randomDraft() {
    var d = {};
    randomName(d);
    randomAge(d);
    randomLooks(d);
    randomManner(d);
    randomStyle(d);
    randomBackground(d);
    return d;
  }

  function chooseFor(d, section) {
    switch (section) {
      case "name": randomName(d); break;
      case "age": randomAge(d); break;
      case "looks": randomLooks(d); break;
      case "manner": randomManner(d); break;
      case "style": randomStyle(d); break;
      case "background": randomBackground(d); break;
      default:
        var fresh = randomDraft();
        Object.keys(fresh).forEach(function (k) { d[k] = fresh[k]; });
    }
  }

  // Keep a draft consistent after a change on the form.
  function settle(d, field) {
    if (field === "looks.hairLength") {
      var ok = hairStylesFor(d.looks.hairLength).some(function (s) { return s.text === d.looks.hairStyle; });
      if (!ok) d.looks.hairStyle = hairStylesFor(d.looks.hairLength)[0].text;
    }
    if (field === "looks.physique") remeasure(d);
    if (field === "looks.height") reheight(d);
    if (field === "style") ensureWardrobe(d);
  }

  /* ============================================================
     Building her
     ============================================================ */

  function makeWardrobe(styleId) {
    var st = style(styleId);
    var items = [];
    st.garments.forEach(function (id, i) {
      var def = h.garmentDef(id);
      if (!def) return;
      var g = h.makeGarment(def, i < 2 ? "made" : "bought");
      g.condition = i === 0 ? 100 : h.randInt(70, 95);
      items.push(g);
    });
    return items;
  }

  function build(d, startOfRun) {
    var bg = background(d.background);
    var st = style(d.style);
    var skills = {};
    R.skills.forEach(function (s) { skills[s] = bg.skills[s] != null ? bg.skills[s] : 1; });
    var S = M.start;
    var authority = h.clamp(Math.round(S.authorityBase + (d.age - 30) * S.authorityPerYearOver30 + (bg.authority || 0)), 0, 100);
    var m = {
      isMistress: true,
      id: 0,
      title: d.title,
      first: d.first,
      surname: d.surname,
      age: d.age,
      nationality: d.nationality,
      polarity: "brunette",
      looks: JSON.parse(JSON.stringify(d.looks)),
      voice: d.voice,
      mark: d.mark,
      scent: d.scent,
      style: d.style,
      background: d.background,
      skills: skills,
      contacts: bg.contacts.slice(),
      wardrobe: d.wardrobe && d.wardrobeStyle === d.style ? JSON.parse(JSON.stringify(d.wardrobe)) : makeWardrobe(d.style),
      meters: {
        authority: authority,
        conviction: h.clamp(S.conviction + (bg.conviction || 0), 0, 100),
        doubt: h.clamp(S.doubt + (bg.doubt || 0), 0, 100)
      },
      last: { authority: 0, conviction: 0, doubt: 0 },
      gossip: Math.round((M.ages[1] - d.age) / (M.ages[1] - M.ages[0]) * 100),
      standing: voice(d.voice).standing || 0,
      dressCode: st.dressCode,
      crisisWeeks: 0,
      duty: null
    };
    return m;
  }

  // A draft turned into a Mistress-shaped object, for the live preview.
  function preview(d) {
    return build(d, true);
  }

  function prepare(m) {
    m.markPortrait = mark(m.mark).portrait;
    m.setting = "Victorian study with a writing desk";
    return m;
  }

  /* ============================================================
     Description, portrait and tokens
     ============================================================ */

  function displayName(m) { return m.title + " " + m.surname; }

  function describe(m, season) {
    prepare(m);
    var personal = [voice(m.voice).prose, mark(m.mark).prose, scent(m.scent).prose, style(m.style).prose]
      .filter(Boolean).join(" ");
    return {
      opening: M.descriptionOpening,
      appearance: H.helpers.appearanceProse(m),
      personal: personal,
      dress: H.helpers.dressProse(m, season),
      expression: H.helpers.expression(m).prose
    };
  }

  function portrait(m, season) {
    prepare(m);
    return H.portrait(m, season);
  }

  function tokens(m) {
    if (!m) return {};
    var L = m.looks;
    return {
      name: displayName(m),
      title: m.title,
      first: m.first,
      surname: m.surname,
      age: String(m.age),
      hair: h.opt(A.hairColour, L.hairColour).prose,
      hairStyle: h.opt(A.hairStyle, L.hairStyle).text,
      eyes: h.opt(A.eyeColour, L.eyeColour).prose,
      height: h.opt(A.height, L.height).prose,
      build: h.opt(A.physique, L.physique).prose,
      voice: voice(m.voice).short,
      mark: mark(m.mark).short,
      scent: scent(m.scent).short,
      style: style(m.style).short,
      background: background(m.background).short,
      nationality: m.nationality
    };
  }

  // Fill {mistress.something} in any text.
  function fillTokens(text, m) {
    if (!text || !m) return text;
    var t = tokens(m);
    return String(text).replace(/\{mistress\.(\w+)\}/g, function (all, k) {
      return t[k] != null ? t[k] : all;
    });
  }

  /* ============================================================
     Her week
     ============================================================ */

  function wobble() { return h.randInt(0, 1000) / 1000 * 2 - 1; }

  function weekly(m, residents, departures) {
    var dr = M.drift;
    var mt = m.meters;
    var before = { authority: mt.authority, conviction: mt.conviction, doubt: mt.doubt };
    var counts = { radiant: 0, content: 0, troubled: 0, pit: 0 };
    var devotions = 0;
    residents.forEach(function (r) {
      counts[H.moodOf(r)]++;
      if (r.duty === "devotions") devotions++;
    });
    var n = Math.max(1, residents.length);
    var dA = 0, dC = 0, dD = 0;
    Object.keys(counts).forEach(function (k) {
      var share = counts[k] / n;
      dA += (dr.authorityByMood[k] || 0) * share;
      dD += (dr.doubtByMood[k] || 0) * share;
    });
    dC += dr.convictionPerDevotions * devotions;
    dC += dr.convictionPerDeparture * departures;
    dC += dr.convictionFade;
    if (!residents.length) { dD += 0.5; dC -= 0.3; }
    dA += wobble() * dr.noise;
    dC += wobble() * dr.noise;
    dD += wobble() * dr.noise;

    mt.authority = h.clamp(mt.authority + dA, 0, 100);
    mt.conviction = h.clamp(mt.conviction + dC, 0, 100);
    mt.doubt = h.clamp(mt.doubt + dD, 0, 100);
    m.last = {
      authority: mt.authority - before.authority,
      conviction: mt.conviction - before.conviction,
      doubt: mt.doubt - before.doubt
    };
    m.crisisWeeks = mt.doubt > mt.conviction ? (m.crisisWeeks || 0) + 1 : 0;
  }

  function inCrisis(m) { return m && (m.crisisWeeks || 0) >= M.drift.crisisWeeks; }

  /* ============================================================
     Shared with the engine
     ============================================================ */

  window.RACINATION_MISTRESS = {
    data: M,
    randomDraft: randomDraft,
    chooseFor: chooseFor,
    settle: settle,
    remeasure: remeasure,
    hairStylesFor: hairStylesFor,
    makeupChoices: makeupChoices,
    build: build,
    preview: preview,
    describe: describe,
    portrait: portrait,
    tokens: tokens,
    fillTokens: fillTokens,
    weekly: weekly,
    inCrisis: inCrisis,
    displayName: displayName,
    voice: voice, mark: mark, scent: scent, style: style, background: background
  };

})();
