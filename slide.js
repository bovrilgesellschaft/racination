/*
  RACINATION — slide.js
  Milestone 9b: the Slide.

  The rising tide of the Pit and its bands; the Ordinances, which
  arrive only by petition or by the Mistress's own sleepless thought,
  and which work, at first; their tolerance, repeal and backsliding;
  Severity; the Concessions; the end of love, which cannot be undone;
  and the three voices of the house.

  The boundary (design note, "The boundary"): every Ordinance is a
  form of control. None touches the intimate life of the house, and
  none relieves the Pit through it. Love simply ends when control
  has grown too great.

  Words and figures: data/slide.js. Events: data/slide-events.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var S = D.slide;
  var H = window.RACINATION_HOUSEHOLD;
  if (!S || !H) return;

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pickFrom(list) { return list[Math.floor(rand() * list.length)]; }
  function fill(text, t) { return String(text || "").replace(/\{(\w+)\}/g, function (m, k) { return t[k] != null ? t[k] : m; }); }
  function adjust(r, fx) {
    if (!r || !fx) return;
    ["racination", "devotion", "doubt"].forEach(function (k) {
      if (!fx[k]) return;
      r.meters[k] = clamp(r.meters[k] + fx[k], 0, 100);
      if (r.last) r.last[k] = (r.last[k] || 0) + fx[k];
    });
  }

  function ordinance(id) { for (var i = 0; i < S.ordinances.length; i++) if (S.ordinances[i].id === id) return S.ordinances[i]; return null; }
  function concession(id) { for (var i = 0; i < S.concessions.length; i++) if (S.concessions[i].id === id) return S.concessions[i]; return null; }
  function bandById(id) { for (var i = 0; i < S.bands.length; i++) if (S.bands[i].id === id) return S.bands[i]; return S.bands[0]; }

  function ensure(state) {
    if (!state.slide) state.slide = {};
    var s = state.slide;
    if (!s.ordinances) s.ordinances = {};      // id -> { since: week }
    if (!s.concessions) s.concessions = {};    // id -> { since: week }
    if (!Array.isArray(s.endedBonds)) s.endedBonds = [];
    ["granted", "refused", "badWeeks"].forEach(function (k) { if (typeof s[k] !== "number") s[k] = 0; });
    if (s.lovePendingSince === undefined) s.lovePendingSince = null;
    if (typeof s.loveEnded !== "boolean") s.loveEnded = false;
    if (typeof s.dancingReturned !== "boolean") s.dancingReturned = false;
  }

  /* ============================================================
     The Pit: tide and bands
     ============================================================ */

  function yearOf(state) {
    var start = Date.UTC(1983, 0, 3);
    return new Date(start + state.week * 7 * 86400000).getUTCFullYear();
  }
  function tide(state) { return S.tide[clamp(yearOf(state), 1983, 1989)] || 1; }

  // Everything that brings the Pit in, this week: the tide, less what the Concessions have taken the sting out of.
  function inflowFactor(state) {
    ensure(state);
    var n = Object.keys(state.slide.concessions).length;
    return tide(state) * Math.max(0.5, 1 - (S.concessionInflowCut || 0) * n);
  }

  function band(state) {
    var p = state.house ? state.house.pit : 0;
    for (var i = 0; i < S.bands.length; i++) if (p < S.bands[i].below) return S.bands[i];
    return S.bands[S.bands.length - 1];
  }
  function bandIndex(id) { for (var i = 0; i < S.bands.length; i++) if (S.bands[i].id === id) return i; return 0; }
  function bandAtLeast(state, id) { return bandIndex(band(state).id) >= bandIndex(id); }

  /* ============================================================
     Ordinances and Severity
     ============================================================ */

  function inForce(state) {
    ensure(state);
    return S.ordinances.filter(function (o) { return state.slide.ordinances[o.id]; });
  }
  function has(state, id) { ensure(state); return !!state.slide.ordinances[id]; }
  function hasConcession(state, id) { ensure(state); return !!state.slide.concessions[id]; }

  function severity(state) {
    var s = 0;
    inForce(state).forEach(function (o) { s += o.severity; });
    return s;
  }

  function voice(state) {
    var sv = severity(state), v = S.voices[0];
    S.voices.forEach(function (x) { if (sv >= x.from) v = x; });
    return v;
  }

  // An Ordinance's relief this week, worn down by tolerance.
  function reliefOf(state, o) {
    var rec = state.slide.ordinances[o.id];
    if (!rec) return 0;
    var seasons = Math.floor((state.week - rec.since) / 13);
    var f = Math.max(S.toleranceFloor, 1 - S.tolerancePerSeason * seasons);
    return o.relief * f;
  }

  function repealCost(state, id) {
    var rec = state.slide.ordinances[id];
    if (!rec) return 0;
    return S.repealBase + S.repealPerMonth * Math.floor((state.week - rec.since) / 4);
  }

  function adopt(state, id) {
    ensure(state);
    var o = ordinance(id);
    if (!o || state.slide.ordinances[id]) return "";
    state.slide.ordinances[id] = { since: state.week };
    state.slide.granted++;
    if (o.once && state.house) state.house.pit = clamp(state.house.pit - o.once, 0, 100);
    if (id === "clearing") {
      state.residents.forEach(function (r) { adjust(r, r.meters.devotion > S.devoutAbove ? { devotion: 2 } : { doubt: 2 }); });
      if (state.events) state.events.records.propertyDestroyed = (state.events.records.propertyDestroyed || 0) + 1;
    }
    if (o.rule) Object.keys(o.rule).forEach(function (k) { state.rules[k] = o.rule[k]; });
    if (state.house && state.house.news) state.house.news.push(o.adopted);
    checkLove(state);
    return o.adopted;
  }

  function repeal(state, id) {
    ensure(state);
    var o = ordinance(id);
    if (!o || !state.slide.ordinances[id]) return { ok: false, why: "That Ordinance is not in force." };
    var cost = repealCost(state, id);
    var m = state.mistress;
    if (!m || m.meters.authority < cost) return { ok: false, why: "Repealing it needs " + cost + " Authority." };
    m.meters.authority = clamp(m.meters.authority - cost, 0, 100);
    var back = reliefOf(state, o) * S.backslideWeeks + (o.once ? o.once / 2 : 0);
    if (state.house) state.house.pit = clamp(state.house.pit + back, 0, 100);
    state.residents.forEach(function (r) {
      if (r.meters.devotion > S.devoutAbove) adjust(r, { devotion: -S.backslideDevotion, doubt: S.backslideDoubt });
    });
    if (o.rule && o.rule.familyContact) state.rules.familyContact = "letters";
    delete state.slide.ordinances[id];
    // If love has ended and the house softens again, the dancing comes back, but not the courting.
    var returns = false;
    if (state.slide.loveEnded && !state.slide.dancingReturned && severity(state) < S.loveEndsAt) { state.slide.dancingReturned = true; returns = true; }
    // Severity has fallen back before love ended: it is spared.
    if (!state.slide.loveEnded && severity(state) < S.loveEndsAt) state.slide.lovePendingSince = null;
    return { ok: true, text: fill(S.repealLine, { name: o.name }) + (returns ? " " + S.loveEnded.dancingReturns : "") };
  }

  // Rules the Ordinances hold in place (rules.js asks before changing one).
  function ruleLocked(state, ruleId, optId) {
    ensure(state);
    if (ruleId === "familyContact" && has(state, "severance") && optId !== "none") return "The Ordinance of Severance holds this rule. Repeal it first.";
    if (ruleId === "dressCode" && hasConcession(state, "clothes") && (optId === "strict" || optId === "exacting")) return "Withdraw the concession of modern clothes first.";
    return "";
  }

  // Dress: concessions dilute what period dress does.
  function periodFactor(state) {
    var f = 1;
    S.concessions.forEach(function (c) { if (c.period && hasConcession(state, c.id)) f *= c.period; });
    return f;
  }

  /* ============================================================
     Concessions
     ============================================================ */

  function grant(state, id) {
    ensure(state);
    var c = concession(id);
    if (!c || state.slide.concessions[id]) return { ok: false, why: "" };
    if (id === "clothes" && state.rules && (state.rules.dressCode === "strict" || state.rules.dressCode === "exacting")) {
      return { ok: false, why: "Not with a strict or exacting dress code." };
    }
    var m = state.mistress;
    if (!m || m.meters.authority < S.concessionAuthority) return { ok: false, why: "That needs " + S.concessionAuthority + " Authority." };
    m.meters.authority = clamp(m.meters.authority - S.concessionAuthority, 0, 100);
    state.slide.concessions[id] = { since: state.week };
    state.residents.forEach(function (r) { if (r.meters.devotion > S.devoutAbove) adjust(r, { devotion: -c.devout }); });
    return { ok: true, text: c.name + ": granted." };
  }

  function withdraw(state, id) {
    ensure(state);
    if (!state.slide.concessions[id]) return { ok: false, why: "" };
    delete state.slide.concessions[id];
    state.residents.forEach(function (r) { if (r.meters.devotion <= S.devoutAbove) adjust(r, { doubt: 1 }); });
    return { ok: true, text: concession(id).name + ": withdrawn." };
  }

  /* ============================================================
     The end of love
     ============================================================ */

  function checkLove(state) {
    var s = state.slide;
    if (!s.loveEnded && s.lovePendingSince == null && severity(state) >= S.loveEndsAt) s.lovePendingSince = state.week;
  }
  function lovePending(state) { ensure(state); return !state.slide.loveEnded && state.slide.lovePendingSince != null; }
  function loveDue(state) { return lovePending(state) && state.week - state.slide.lovePendingSince >= S.loveEndsAfterWeeks; }
  function loveEnded(state) { return !!(state.slide && state.slide.loveEnded); }

  // It ends. ctx: { kind: "evening"|"rite"|"working"|"guest"|"plain", a, b } (names). Returns the page's text.
  function endLove(state, ctx) {
    ensure(state);
    var s = state.slide;
    s.loveEnded = true;
    s.lovePendingSince = null;
    s.loveEndedWeek = state.week;
    var IN = window.RACINATION_INTIMACY;
    if (state.romance) {
      state.romance.courtships.forEach(function (c) {
        if (c.courting || c.bonded) s.endedBonds.push({ a: c.a, b: c.b, bonded: !!c.bonded, week: state.week });
      });
      state.romance.courtships = [];
      state.romance.petitions = [];
      if (state.romance.rite && state.romance.rite.stage !== "done") state.romance.rite = null;
      Object.keys(state.romance.evenings || {}).forEach(function (k) {
        var e = state.romance.evenings[k];
        if (["courtship", "dancing", "reading", "talk"].indexOf(e.reg) >= 0) e.reg = "devotions";
      });
    }
    var L = S.loveEnded;
    var k = ctx && L[ctx.kind] ? ctx.kind : "plain";
    var text = fill(L[k], { a: (ctx && ctx.a) || "", b: (ctx && ctx.b) || "" });
    if (state.events) state.events.notes.push({ week: state.week, title: L.title, result: L.plain });
    return text;
  }

  // Which evenings remain once love has ended.
  function registerAllowed(state, reg) {
    if (!loveEnded(state)) return true;
    if (reg === "courtship" || reg === "talk") return false;
    if (reg === "dancing" || reg === "reading") return state.slide.dancingReturned;
    return true;
  }

  /* ============================================================
     The week
     ============================================================ */

  function weekly(state) {
    ensure(state);
    var s = state.slide;
    var hs = state.house;
    var lines = [];
    var ords = inForce(state);
    var sev = severity(state);

    // The Ordinances work, at first.
    var relief = 0;
    ords.forEach(function (o) { relief += reliefOf(state, o); });
    if (hs && relief) { hs.pit = clamp(hs.pit - relief, 0, 100); hs.pitLast = (hs.pitLast || 0) - relief; }

    // The Concessions let a little in.
    S.concessions.forEach(function (c) {
      if (!hasConcession(state, c.id)) return;
      if (hs) { hs.pit = clamp(hs.pit + c.pit, 0, 100); hs.pitLast = (hs.pitLast || 0) + c.pit; }
      state.residents.forEach(function (r) {
        var who = c.ease.who;
        var fits = who === "all" || (who === "family" && r.ties.some(function (t) { return t.kind === "family"; })) || (who === "pit" && r.meters.racination < 50);
        if (fits) adjust(r, { doubt: -c.ease.by });
      });
    });

    // The devout are glad; everyone else pays.
    state.residents.forEach(function (r) {
      if (!ords.length) return;
      if (r.meters.devotion > S.devoutAbove) adjust(r, { devotion: S.devoutDevotion * ords.length });
      else adjust(r, { doubt: S.othersDoubtPerSeverity * sev });
      if (has(state, "vigils")) adjust(r, { racination: S.vigilsRacination });
      if (has(state, "faults")) adjust(r, { doubt: S.faultsDoubt });
      if (has(state, "confession") && r.meters.doubt > S.doubterAbove) adjust(r, { doubt: S.confessionDoubterDoubt });
      if (has(state, "shunning") && r.meters.doubt > S.shunnedAbove) adjust(r, { doubt: S.shunningDoubt });
    });
    if (has(state, "post") && state.events) state.events.records.withheldLetters = (state.events.records.withheldLetters || 0) + S.postWithheldPerWeek;
    if (has(state, "fold") && state.events) state.events.belief = clamp(state.events.belief + S.foldBelief, -100, 100);

    // Shunning breaks women.
    if (has(state, "shunning")) {
      state.residents.slice().forEach(function (r) {
        if (r.meters.doubt > S.shunnedAbove && rand() < S.shunningBreakChance) {
          lines.push(fill(S.shunningLine, { name: H.displayName(r) }));
          leave(state, r);
        }
      });
    }
    // The Gate: those who would leave are kept, or go over the wall.
    if (has(state, "gate")) {
      state.residents.slice().forEach(function (r) {
        if ((r.highDoubtWeeks || 0) < 3) return;
        if (rand() < S.gate.escapeChance) {
          lines.push(fill(S.gate.escapeLine, { name: H.displayName(r) }));
          leave(state, r);
        } else if ((r.highDoubtWeeks || 0) % S.gate.refusalEvery === 3) {
          if (state.events) state.events.records.preventedLeaving = (state.events.records.preventedLeaving || 0) + 1;
          r.refusals = (r.refusals || 0) + 1;
        }
      });
    }
    // Breach: women walk out.
    if (band(state).id === "breach" && !has(state, "gate") && rand() < S.breachDeparture.chance && state.residents.length) {
      var weakest = state.residents.slice().sort(function (a, b) { return a.meters.racination - b.meters.racination; })
        .slice(0, 1 + Math.floor(rand() * S.breachDeparture.most));
      lines.push(fill(S.breachDeparture.line, { names: weakest.map(function (r) { return H.displayName(r); }).join(", ").replace(/, ([^,]*)$/, " and $1") }));
      weakest.forEach(function (r) { leave(state, r); });
    }

    // How long the Pit has stood in a bad band (for the Mistress's proposals).
    s.badWeeks = bandAtLeast(state, "seepage") ? s.badWeeks + 1 : 0;

    // Old departures keep the words they were written in.
    var v = voice(state);
    state.departed.forEach(function (d) { if (!d.voice) d.voice = v.id; });

    checkLove(state);
    if (loveDue(state)) {
      // Nobody reached for it. It comes at Matins.
      s.loveDueAtMatins = true;
    }
    return lines;
  }

  function leave(state, r) {
    state.departed.push({ id: r.id, name: H.displayName(r), first: r.first, week: state.week, reason: "left", line: "", voice: voice(state).id });
    state.residents = state.residents.filter(function (x) { return x.id !== r.id; });
    if (state.housekeeper === r.id) state.housekeeper = null;
  }

  /* ============================================================
     Events: conditions and effects (data/slide-events.js)
     ============================================================ */

  function slideEventIds() {
    return (D.slideEvents || []).filter(function (e) { return e.when && e.when.slide && (e.when.slide.petition || e.when.slide.proposal || e.when.slide.removal); })
      .map(function (e) { return e.id; });
  }

  function avgDevotion(state) {
    if (!state.residents.length) return 0;
    return state.residents.reduce(function (a, r) { return a + r.meters.devotion; }, 0) / state.residents.length;
  }

  function conditionOK(state, c) {
    ensure(state);
    var ev = state.events;
    var asks = slideEventIds();
    var askPending = ev && ev.pending.some(function (p) { return asks.indexOf(p.id) >= 0; });
    var pit = state.house ? state.house.pit : 0;
    var belief = ev ? ev.belief : 0;
    if (c.petition || c.proposal) {
      var o = ordinance(c.petition || c.proposal);
      if (!o || has(state, o.id) || askPending) return false;
      if (!bandAtLeast(state, o.band)) return false;
      if (c.petition) {
        var ch = S.petition.base * (1 + Math.max(0, pit - 40) / 30) * (avgDevotion(state) / 50) * (1 + belief / 100);
        return rand() < ch;
      }
      // The Mistress never proposes more than one band beyond what already stands.
      var maxTier = 0;
      inForce(state).forEach(function (x) { maxTier = Math.max(maxTier, bandById(x.band).tier); });
      if (bandById(o.band).tier > maxTier + 1) return false;
      var m = state.mistress;
      var ch2 = S.proposal.base * (1 + state.slide.granted * 0.3) * ((m ? m.meters.conviction : 50) / 50) * (1 + state.slide.badWeeks / 26);
      return rand() < ch2;
    }
    if (c.removal) {
      if (!hasConcession(state, c.removal) || askPending) return false;
      return rand() < 0.08 * (avgDevotion(state) / 50);
    }
    if (c.incursion) {
      if (c.band && !bandAtLeast(state, c.band)) return false;
      var ends = false;
      S.concessions.forEach(function (x) { if (hasConcession(state, x.id) && x.ends.indexOf("incursion-" + c.incursion) >= 0) ends = true; });
      if (ends) return false;
      return rand() < 0.08 + Math.max(0, pit - 40) / 300;
    }
    return true;
  }

  function applyEffects(state, p, fx) {
    ensure(state);
    if (fx.adopt) adopt(state, fx.adopt);
    if (fx.refuse || fx.keep) {
      state.slide.refused++;
      var m = state.mistress;
      if (m) m.meters.authority = clamp(m.meters.authority - S.petition.refuseAuthority, 0, 100);
      state.residents.forEach(function (r) { if (r.meters.devotion > S.devoutAbove) adjust(r, { devotion: -S.petition.refuseDevotion }); });
    }
    if (fx.withdraw) withdraw(state, fx.withdraw);
  }

  /* ============================================================
     The voice of the house
     ============================================================ */

  function nameFor(state, r) {
    var v = voice(state);
    if (v.names === "sister") return "Sister " + r.surname;
    if (v.names === "surname") return r.surname;
    return H.displayName(r);
  }

  function reportTitle(state, hkName) {
    var v = voice(state);
    return fill(v.report, { name: hkName || "The Housekeeper" });
  }

  function matinsLine(state, fallback) {
    var v = voice(state);
    if (v.matins && v.matins.length) return pickFrom(v.matins);
    var b = band(state);
    if (b.matins && b.matins.length && rand() < 0.6) return pickFrom(b.matins);
    return fallback;
  }

  function reckoningLine(state, fallback) {
    var v = voice(state);
    return v.reckoning && v.reckoning.length ? pickFrom(v.reckoning) : fallback;
  }

  function crisisLine(state) {
    var b = band(state);
    return b.crisis && b.crisis.length ? pickFrom(b.crisis) : "";
  }

  function departedWord(d) {
    var v = null;
    S.voices.forEach(function (x) { if (x.id === (d.voice || "idyll")) v = x; });
    v = v || S.voices[0];
    return d.reason === "racinated" ? v.racinated : v.left;
  }

  window.RACINATION_SLIDE = {
    data: S,
    setRandom: setRandom,
    ensure: ensure,
    tide: tide,
    inflowFactor: inflowFactor,
    band: band,
    bandAtLeast: bandAtLeast,
    inForce: inForce,
    has: has,
    hasConcession: hasConcession,
    severity: severity,
    voice: voice,
    reliefOf: reliefOf,
    repealCost: repealCost,
    adopt: adopt,
    repeal: repeal,
    ruleLocked: ruleLocked,
    periodFactor: periodFactor,
    grant: grant,
    withdraw: withdraw,
    lovePending: lovePending,
    loveDue: loveDue,
    loveEnded: loveEnded,
    endLove: endLove,
    registerAllowed: registerAllowed,
    weekly: weekly,
    conditionOK: conditionOK,
    applyEffects: applyEffects,
    nameFor: nameFor,
    reportTitle: reportTitle,
    matinsLine: matinsLine,
    reckoningLine: reckoningLine,
    crisisLine: crisisLine,
    departedWord: departedWord
  };

})();
