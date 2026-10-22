/*
  RACINATION — working.js
  Milestone 8: the Working (GDD §3.3).

  The windows (from the precomputed ephemeris), discovery and the
  Mistress's stance, planning and keeping a Working, its hidden
  strength, the nudges it leaves and the coincidences the ledger
  records, the Chamber's Charge and its hauntings, Visualisation,
  the readings, secret Workings, being seen, and the sinister current.

  The magic is never confirmed. Nothing here ever tells the player
  that a Working worked.

  Consent: both women are asked, through the "working" part of the
  consent profile (intimacy.js). A Working with a partner who does
  not know its purpose is the defining heresy: it takes the harm
  path, plays no scene, and weighs on the failure ladder.

  Words and figures: data/working.js. Events: data/working-events.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var W = D.working;
  var E = D.ephemeris;
  var H = window.RACINATION_HOUSEHOLD;
  if (!W || !E || !H) return;

  var DAY = 86400000;
  var START = (function () { var p = E.start.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); })();
  var MISTRESS = 0;

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pickFrom(list) { return list[Math.floor(rand() * list.length)]; }
  function pence(p) { return Math.round(Number(p || 0) * 100); }
  function fill(text, t) { return String(text || "").replace(/\{(\w+)\}/g, function (m, k) { return t[k] != null ? t[k] : m; }); }
  function IN() { return window.RACINATION_INTIMACY; }

  function lady(id) { for (var i = 0; i < W.ladies.length; i++) if (W.ladies[i].id === id) return W.ladies[i]; return null; }
  function site(id) { for (var i = 0; i < W.sites.length; i++) if (W.sites[i].id === id) return W.sites[i]; return null; }
  function findResident(state, id) {
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }
  function person(state, id) { return id === MISTRESS ? state.mistress : findResident(state, id); }
  function nameOf(state, id) { var p = person(state, id); return p ? p.title + " " + p.surname : "someone"; }

  function adjust(r, fx) {
    if (!r || !fx) return;
    ["racination", "devotion", "doubt"].forEach(function (k) {
      if (!fx[k]) return;
      r.meters[k] = clamp(r.meters[k] + fx[k], 0, 100);
      if (r.last) r.last[k] = (r.last[k] || 0) + fx[k];
    });
  }

  /* ============================================================
     State
     ============================================================ */

  function ensure(state) {
    if (!state.working) state.working = {};
    var w = state.working;
    if (typeof w.discovered !== "boolean") w.discovered = false;
    if (w.stance === undefined) w.stance = null;
    if (!w.reading) w.reading = "undecided";
    ["charge", "sinister", "exposed"].forEach(function (k) { if (typeof w[k] !== "number") w[k] = 0; });
    ["keptWeek", "lastChamberWeek", "chamberRestUntil"].forEach(function (k) { if (typeof w[k] !== "number") w[k] = -1; });
    if (!Array.isArray(w.influences)) w.influences = [];
    if (!Array.isArray(w.later)) w.later = [];
    if (typeof w.count !== "number") w.count = 0;
    // Visualisation for women from saves made before Milestone 8.
    state.residents.forEach(function (r) {
      if (r.skills && typeof r.skills.visualisation !== "number") r.skills.visualisation = Math.floor(rand() * 2);
    });
  }

  /* ============================================================
     The windows (Design decision D1)
     ============================================================ */

  function dayString(t) {
    var i = Math.round((t - START) / DAY);
    if (i < 0 || i >= E.days.length) return null;
    return E.days[i];
  }
  function bodyIndex(body) { return E.bodies.indexOf(body); }
  function minutes(hhmm) { return hhmm === "----" ? null : (+hhmm.slice(0, 2)) * 60 + (+hhmm.slice(2)); }
  function clock(hhmm) { return hhmm.slice(0, 2) + ":" + hhmm.slice(2); }

  // The windows on one day (a UTC midnight, in ms).
  function windowsOn(t) {
    var s = dayString(t);
    if (!s) return [];
    var dow = new Date(t).getUTCDay();
    var out = [];
    W.ladies.forEach(function (L) {
      if (L.day !== dow) return;
      var bi = bodyIndex(L.body);
      var rise = s.substr(bi * 8, 4), set = s.substr(bi * 8 + 4, 4);
      var sunrise = minutes(s.substr(0, 4)), sunset = minutes(s.substr(4, 4));
      [["build", rise], ["banish", set]].forEach(function (x) {
        var m = minutes(x[1]);
        if (m == null) return;
        // Full dark: an hour after sunset until an hour before sunrise (W.darkMargin).
        var dm = W.darkMargin || 0;
        var night = L.body === "sun" || (sunset != null && m >= sunset + dm) || (sunrise != null && m < sunrise - dm);
        if (!night) return;
        out.push({ key: t + ":" + L.id + ":" + x[0], date: t, lady: L.id, mode: x[0], time: x[1], clock: clock(x[1]) });
      });
    });
    return out;
  }

  function windowsBetween(t0, days) {
    var out = [];
    for (var i = 0; i < days; i++) out = out.concat(windowsOn(t0 + i * DAY));
    return out;
  }

  function windowsInMonth(year, month) {
    var t = Date.UTC(year, month, 1), out = [];
    while (new Date(t).getUTCMonth() === month) { out = out.concat(windowsOn(t)); t += DAY; }
    return out;
  }

  function windowLabel(w) {
    var L = lady(w.lady);
    var d = new Date(w.date);
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return days[d.getUTCDay()] + " " + d.getUTCDate() + " " + months[d.getUTCMonth()] + ", " + w.clock + ": "
      + capital(L.name) + (w.mode === "build" ? " rises" : " sets")
      + " (" + (w.mode === "build" ? "to build" : "to banish") + ")";
  }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ============================================================
     Planning and keeping a Working
     ============================================================ */

  // Couples who may keep a Working: courting or bonded; with the Mistress only if she has embraced it.
  function couples(state) {
    var I = IN();
    if (!I || !state.romance) return [];
    var w = state.working;
    return state.romance.courtships.filter(function (c) {
      if (!(c.courting || c.bonded)) return false;
      if ((c.a === MISTRESS || c.b === MISTRESS) && w.stance !== "embrace") return false;
      return person(state, c.a) && person(state, c.b);
    }).map(function (c) {
      return { key: c.a + "-" + c.b, a: c.a, b: c.b, bonded: !!c.bonded, label: nameOf(state, c.a) + " and " + nameOf(state, c.b) + (c.bonded ? " (bonded)" : " (courting)") };
    });
  }

  function canPlan(state) {
    var w = state.working;
    if (!w.discovered) return "The house knows nothing of the Working.";
    if (w.stance === "forbid") return "The Mistress has forbidden the Working.";
    var I = IN();
    if (I && !I.gatesOpen(state)) return I.data.closedNote;
    if (w.keptWeek === state.week) return "A Working has been kept this week already.";
    return "";
  }

  function sitesOpen(state) {
    var w = state.working;
    return W.sites.filter(function (s) { return !(s.id === "chamber" && w.chamberRestUntil > state.week); });
  }

  function strengthOf(state, c, L, S, late, partners) {
    var k = W.strength;
    var v = k.base + (c.bonded ? k.bonded : k.courting);
    partners.forEach(function (p) { if (p.skills) v += k.perVisualisation * (p.skills.visualisation || 0); });
    if (!S.outdoor) v += k.chargeAtFull * state.working.charge / 100;
    if (S.ladies.indexOf(L.id) >= 0) v += k.siteSympathy;
    var pa = person(state, c.a), pb = person(state, c.b);
    var same = pa && pb && pa.polarity === pb.polarity;
    var rd = state.working.reading;
    if (rd === "polar") v += same ? k.readingClash : k.readingMatch;
    if (rd === "mirror") v += same ? k.readingMatch : k.readingClash;
    if (c.a === MISTRESS || c.b === MISTRESS) v += k.mistressTakesPart;
    v += k.perBelief * ((state.events && state.events.belief) || 0);
    if (late) v *= k.late;
    return clamp(v, 0.1, k.max);
  }

  function isSceptic(r) {
    return r.meters.devotion < W.scepticBelow || r.meters.doubt > W.scepticAbove;
  }

  // opts: { window: key, site: id, couple: "a-b", phrase, image, informed: bool }
  function keep(state, opts, monday, season) {
    ensure(state);
    var I = IN();
    var why = canPlan(state);
    if (why) return { ok: false, why: why };
    var win = windowsBetween(monday, 7).filter(function (x) { return x.key === opts.window; })[0];
    if (!win) return { ok: false, why: "Choose one of this week's windows." };
    var S = site(opts.site);
    if (!S || sitesOpen(state).indexOf(S) < 0) return { ok: false, why: "That site is not open to the house." };
    var cp = couples(state).filter(function (x) { return x.key === opts.couple; })[0];
    if (!cp) return { ok: false, why: "Choose a courting or bonded couple." };
    var c = I.courtshipBetween(state, cp.a, cp.b);
    var pa = person(state, cp.a), pb = person(state, cp.b);
    var g = I.gate(state, [pa, pb]);
    if (g) return { ok: false, why: g };
    if (S.cost && state.money < pence(S.cost)) return { ok: false, why: "The house cannot afford the journey." };

    var L = lady(win.lady);
    var withM = cp.a === MISTRESS || cp.b === MISTRESS;
    var residents = [pa, pb].filter(function (p) { return p && p !== state.mistress; });
    var t = { a: nameOf(state, cp.a), b: nameOf(state, cp.b), site: S.name, lady: L.name, planet: L.planet, rose: W.roseWords[win.mode] };

    // The defining heresy: a partner who does not know what the Working is for. The harm path; no scene.
    if (opts.informed === false) {
      var victim = residents[residents.length - 1];
      state.working.keptWeek = state.week;
      I.markHarm(state, victim, "uninformedWorking", "working");
      var hText = fill(W.lines.uninformed, { b: victim.title + " " + victim.surname });
      note(state, "A Working", hText);
      return { ok: true, text: hText };
    }

    // Both women are asked, and must want it.
    var reasons = {};
    for (var i = 0; i < residents.length; i++) {
      var r = residents[i];
      var d = I.decide(state, r, "working", withM);
      if (!d.yes) {
        var again = r.declinedWorkingWeek != null && state.week - r.declinedWorkingWeek < 8;
        r.declinedWorkingWeek = state.week;
        if (again) adjust(r, { doubt: 2 });
        return { ok: true, text: fill(W.lines.declined, { a: r.title + " " + r.surname }) };
      }
      reasons[r.id] = d.reason;
    }
    var free = residents.every(function (r) { return I.isFree(reasons[r.id]); });
    residents.forEach(function (r) {
      r.lastYes = { area: "working", week: state.week, believed: reasons[r.id] === "desire" ? "She seemed to want it." : "She seemed willing." };
      if (I.isExtracted(reasons[r.id])) I.extracted(state, r, "working");
    });

    state.working.keptWeek = state.week;
    if (S.cost) {
      state.money -= pence(S.cost);
      if (state.house && state.house.spent) state.house.spent.push({ label: "Travelling expenses", amount: -pence(S.cost) });
    }

    // Arriving in time (D2).
    var late = false;
    if (S.outdoor && S.late) {
      var roll = rand();
      if (roll < S.late * 0.2) {
        var mText = fill(W.lines.missed, t);
        note(state, "A Working", mText);
        return { ok: true, text: mText };
      }
      late = roll < S.late;
    }

    var strength = strengthOf(state, { a: cp.a, b: cp.b, bonded: cp.bonded }, L, S, late, [pa, pb]);
    // An extracted yes gives a thin current, and does harm besides (intimacy.js has marked it).
    if (!free) strength *= 0.5;
    var w = state.working;
    w.count++;
    w.influences.push({ lady: L.id, mode: win.mode, strength: strength, weeks: W.weeks + Math.floor(strength * 2) });
    if (L.later) w.later.push({ lady: L.id, mode: win.mode, strength: strength, week: state.week, target: L.later });
    if (!S.outdoor) {
      w.charge = clamp(w.charge + W.charge.perWorking * strength, 0, 100);
      w.lastChamberWeek = state.week;
    }
    // Sceptics mind.
    var sd = W.scepticDoubt[w.stance] || 0;
    if (sd) state.residents.forEach(function (x) { if (residents.indexOf(x) < 0 && isSceptic(x)) adjust(x, { doubt: sd }); });
    // Being seen.
    if (S.outdoor && state.events) {
      var seen = (S.seen && S.seen[season]) || 0;
      if (rand() < seen) state.events.followUps.push({ id: pickFrom(["working-seen-ramblers", "working-seen-farmer", "working-seen-constable"]), week: state.week + 1 });
    }

    var text = (late ? fill(W.lines.late, t) + " " : "") + fill(W.lines.kept, t);
    note(state, "A Working", text);
    var cast = { mistress: { kind: "mistress" } };
    var partnerId = cp.a === MISTRESS ? cp.b : cp.a;
    var belovedId = partnerId === cp.a ? cp.b : cp.a;
    cast.partner = { kind: "resident", id: partnerId };
    cast.beloved = belovedId === MISTRESS ? { kind: "mistress" } : { kind: "resident", id: belovedId };
    return {
      ok: true, text: text,
      scene: {
        params: {
          planet: L.id, planetName: L.planet, lady: L.name, site: S.id, outdoor: S.outdoor ? "yes" : "no", mode: win.mode,
          "with": withM ? "mistress" : "resident", phrase: opts.phrase || L.phrases[0], image: opts.image || L.images[0],
          room: S.name, season: season
        },
        cast: cast,
        free: free
      }
    };
  }

  function note(state, title, text) {
    if (state.events) state.events.notes.push({ week: state.week, title: title, result: text });
  }

  /* ============================================================
     The week
     ============================================================ */

  function applyNudge(state, fx, scale, lines) {
    if (!fx) return;
    var hs = state.house;
    if (fx.reputation && hs) hs.reputation = clamp(hs.reputation + fx.reputation * scale, 0, 100);
    if (fx.pit && hs) hs.pit = clamp(hs.pit + fx.pit * scale, 0, 100);
    if (fx.money) {
      var p = pence(fx.money * scale);
      if (p) {
        state.money += p;
        if (hs && hs.spent) hs.spent.push({ label: "Sundry receipts", amount: p });
      }
    }
    if (fx.authority && state.mistress) state.mistress.meters.authority = clamp(state.mistress.meters.authority + fx.authority * scale, 0, 100);
    if (fx.doubt) state.residents.forEach(function (r) { adjust(r, { doubt: fx.doubt * scale }); });
    if (fx.courtship && state.romance) state.romance.courtships.forEach(function (c) { if (c.courting && !c.bonded) c.progress += fx.courtship * scale; });
  }

  function weekly(state) {
    ensure(state);
    var w = state.working;
    var lines = [];

    // Visualisation, trained at devotions.
    state.residents.forEach(function (r) {
      var ev = state.romance && state.romance.evenings && state.romance.evenings[r.id];
      var devout = r.duty === "devotions" || (ev && ev.reg === "devotions");
      if (devout && (r.skills.visualisation || 0) < 5 && rand() < W.visualisationTraining) r.skills.visualisation = (r.skills.visualisation || 0) + 1;
    });

    if (!w.discovered) {
      if (rand() < W.strayCoincidence) lines.push(strayLine());
      return lines;
    }

    // The nudges, and what the ledger makes of them.
    var still = [];
    w.influences.forEach(function (inf) {
      var L = lady(inf.lady);
      if (!L) return;
      applyNudge(state, L[inf.mode], inf.strength, lines);
      if (rand() < W.coincidenceChance) lines.push(pickFrom(W.coincidences[L.id]));
      inf.weeks -= 1;
      if (inf.weeks > 0) still.push(inf);
    });
    w.influences = still;
    if (rand() < W.strayCoincidence) lines.push(strayLine());

    // The Chamber.
    if (w.lastChamberWeek !== state.week) w.charge = clamp(w.charge - W.charge.fadePerIdleWeek * (w.chamberRestUntil > state.week ? 2 : 1), 0, 100);
    if (w.charge > W.charge.hauntAbove && rand() < W.charge.hauntChance) {
      var hnt = pickFrom(W.hauntings);
      lines.push(hnt.text);
      state.residents.forEach(function (r) { adjust(r, { doubt: hnt.doubt || 0 }); });
      if (state.events && hnt.belief) state.events.belief = clamp(state.events.belief + hnt.belief, -100, 100);
    }

    // Under Forbid, a devoted couple may keep a Working in secret.
    if (w.stance === "forbid" && state.romance && state.events && rand() < W.secretWorkingChance) {
      var cands = state.romance.courtships.filter(function (c) {
        if (!(c.courting || c.bonded) || c.a === MISTRESS || c.b === MISTRESS) return false;
        var a = findResident(state, c.a), b = findResident(state, c.b);
        return a && b && a.consent && b.consent && a.consent.working === "want" && b.consent.working !== "hard" && a.meters.devotion > 60;
      });
      if (cands.length) {
        var c = pickFrom(cands);
        state.events.followUps.push({ id: "working-secret", week: state.week + 1, resident: c.a, other: c.b });
      }
    }
    return lines;
  }

  function strayLine() {
    var L = pickFrom(W.ladies);
    return pickFrom(W.coincidences[L.id]);
  }

  /* ============================================================
     Events: conditions and effects (data/working-events.js)
     ============================================================ */

  function conditionOK(state, c) {
    ensure(state);
    var w = state.working;
    if (c.discovered != null && w.discovered !== c.discovered) return false;
    if (c.stance && [].concat(c.stance).indexOf(w.stance) < 0) return false;
    if (c.chargeAbove != null && !(w.charge > c.chargeAbove)) return false;
    if (c.sinisterAtLeast != null && !(w.sinister >= c.sinisterAtLeast)) return false;
    if (c.reading && w.reading !== c.reading) return false;
    if (c.readingDecided != null && (w.reading === "polar" || w.reading === "mirror") !== c.readingDecided) return false;
    return true;
  }

  function applyEffects(state, fx) {
    ensure(state);
    var w = state.working;
    if (fx.discover) w.discovered = true;
    if (fx.stance) setStance(state, fx.stance);
    if (fx.reading) w.reading = fx.reading;
    if (fx.sinister) w.sinister = Math.max(0, w.sinister + fx.sinister);
    if (fx.charge) w.charge = clamp(w.charge + fx.charge, 0, 100);
    if (fx.restChamber) w.chamberRestUntil = state.week + fx.restChamber;
    if (fx.exposed) {
      w.exposed += fx.exposed;
      if (state.events) state.events.records.workingExposed = (state.events.records.workingExposed || 0) + 1;
    }
  }

  function setStance(state, s) {
    var w = state.working;
    if (!W.stances[s] || w.stance === s) return;
    w.stance = s;
    var b = W.stances[s].belief || 0;
    if (b && state.events) state.events.belief = clamp(state.events.belief + b, -100, 100);
  }

  // From the Calendar page, at a cost in Authority.
  function changeStance(state, s) {
    ensure(state);
    var w = state.working;
    if (!w.discovered) return "The house knows nothing of the Working.";
    if (!W.stances[s] || w.stance === s) return "";
    var m = state.mistress;
    if (!m || m.meters.authority < W.stanceChangeCost) return "That needs " + W.stanceChangeCost + " Authority.";
    m.meters.authority = clamp(m.meters.authority - W.stanceChangeCost, 0, 100);
    setStance(state, s);
    return "";
  }

  function chargeWord(state) {
    var c = state.working.charge;
    for (var i = 0; i < W.chargeWords.length; i++) if (c < W.chargeWords[i].below) return W.chargeWords[i].word;
    return W.chargeWords[W.chargeWords.length - 1].word;
  }

  window.RACINATION_WORKING = {
    data: W,
    setRandom: setRandom,
    ensure: ensure,
    lady: lady,
    site: site,
    windowsOn: windowsOn,
    windowsBetween: windowsBetween,
    windowsInMonth: windowsInMonth,
    windowLabel: windowLabel,
    couples: couples,
    canPlan: canPlan,
    sitesOpen: sitesOpen,
    keep: keep,
    weekly: weekly,
    conditionOK: conditionOK,
    applyEffects: applyEffects,
    changeStance: changeStance,
    chargeWord: chargeWord
  };

})();
