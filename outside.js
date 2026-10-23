/*
  RACINATION — outside.js
  Milestone 10a: the outside world. The village, the press and
  officialdom, each a meter spoken of in words; the families, whose
  concern rises and falls unseen and escalates by stages; and the
  Ladies' stored nudges, which finally reach the village and the
  council (never confirmed).

  Figures and words: data/outside.js. Events: data/outside-events.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var O = D.outside;
  var H = window.RACINATION_HOUSEHOLD;
  if (!O || !H) return;

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function ensure(state) {
    if (!state.outside) state.outside = { village: O.start.village, press: O.start.press, official: O.start.official };
    var o = state.outside;
    ["village", "press", "official"].forEach(function (k) { if (typeof o[k] !== "number") o[k] = O.start[k]; });
    if (!o.counted) o.counted = {};     // records already turned into press interest
    if (typeof o.laterUsed !== "number") o.laterUsed = 0;
    state.residents.forEach(function (r) { ensureFamily(r); });
  }

  function ensureFamily(r) {
    if (r.family) return;
    var has = r.ties.some(function (t) { return t.kind === "family"; });
    r.family = has ? { concern: 10 + Math.floor(rand() * 15), stage: 0 } : null;
  }

  function word(kind, v) {
    var list = O.words[kind];
    for (var i = 0; i < list.length; i++) if (v < list[i].below) return list[i];
    return list[list.length - 1];
  }

  function adjust(r, fx) {
    if (!r || !fx) return;
    ["racination", "devotion", "doubt"].forEach(function (k) {
      if (!fx[k]) return;
      r.meters[k] = clamp(r.meters[k] + fx[k], 0, 100);
      if (r.last) r.last[k] = (r.last[k] || 0) + fx[k];
    });
  }

  /* ============================================================
     Families
     ============================================================ */

  // The game's own judgement that a family is right to worry. Never shown.
  function goodReason(state, r) {
    var SL = window.RACINATION_SLIDE;
    if (r.extractedAreas && Object.keys(r.extractedAreas).length) return true;
    if (SL && SL.has(state, "gate") && r.meters.doubt > 50) return true;
    if (SL && SL.has(state, "shunning") && r.meters.doubt > 60) return true;
    if ((r.refusals || 0) > 0) return true;
    return false;
  }

  function familyWeek(state) {
    var F = O.family;
    var SL = window.RACINATION_SLIDE;
    var rule = (state.rules && state.rules.familyContact) || "open";
    state.residents.forEach(function (r) {
      ensureFamily(r);
      if (!r.family) return;
      var d = F.base + (F.contact[rule] || 0);
      if (r.meters.doubt > F.doubtAbove) d += F.doubt;
      if (rule === "open" && r.meters.racination > 60 && r.meters.devotion > 50) d += F.content;
      if (r.extractedAreas && Object.keys(r.extractedAreas).length) d += F.reasons.extracted;
      if (SL) {
        d += (F.perSeverity || 0) * SL.severity(state);
        if (SL.has(state, "gate")) d += F.reasons.gate;
        if (SL.has(state, "severance")) d += F.reasons.severance;
        if (SL.has(state, "shunning") && r.meters.doubt > 60) d += F.reasons.shunned;
        if (SL.loveEnded(state)) d += F.reasons.loveEnded;
        if (SL.hasConcession(state, "telephone")) d -= 0.3;
      }
      r.family.concern = clamp(r.family.concern + d, 0, 100);
      // Escalation, one stage at a time.
      var st = F.stages[r.family.stage];
      if (st && r.family.concern >= st.at && state.events) {
        var already = state.events.followUps.some(function (f) { return f.resident === r.id && /^family-/.test(f.id); })
          || state.events.pending.some(function (p) { return p.resident === r.id && /^family-/.test(p.id) && p.chosen == null; });
        if (!already) {
          var id = st.event + (goodReason(state, r) ? "-reason" : "");
          state.events.followUps.push({ id: id, week: state.week + 1, resident: r.id });
          r.family.stage += 1;
          if (r.family.stage >= 3) state.outside.official = clamp(state.outside.official + O.official.perEscalation, 0, 100);
        }
      }
      // A family set at ease steps back down.
      if (r.family.stage > 0 && r.family.concern < F.stages[r.family.stage - 1].at - 20) r.family.stage -= 1;
    });
  }

  /* ============================================================
     The week
     ============================================================ */

  function once(state, key, n) {
    var o = state.outside;
    var seen = o.counted[key] || 0;
    var now = n || 0;
    o.counted[key] = Math.max(seen, now);
    return Math.max(0, now - seen);
  }

  function weekly(state) {
    ensure(state);
    var o = state.outside;
    var hs = state.house || {};
    var SL = window.RACINATION_SLIDE;
    var IN = window.RACINATION_INTIMACY;
    var sev = SL ? SL.severity(state) : 0;
    var rec = (state.events && state.events.records) || {};
    var lines = [];

    // The village.
    var V = O.village;
    var dv = (V.rest - o.village) * V.pull + V.perGuest * (hs.guests || 0) + V.perSeverity * sev;
    if (!hs.guests && hs.pit < 40) dv += V.quietWeek;
    o.village = clamp(o.village + dv, 0, 100);
    var vw = word("village", o.village).word;
    if (vw === "hostile") hs.pit = clamp(hs.pit + V.hostilePit, 0, 100);
    if (vw === "charmed") hs.pit = clamp(hs.pit + V.charmedPit, 0, 100);

    // The press.
    var P = O.press;
    var appalled = (hs.guestList || []).filter(function (g) { return g.outcome === "appalled"; }).length;
    var dp = -P.decay + P.perSeverity * sev + P.perAppalledGuest * appalled
      + P.perHit * once(state, "cassetteHit", rec.cassetteHit)
      + P.perExposed * once(state, "workingExposed", rec.workingExposed)
      + P.perJournalist * once(state, "journalistKnown", rec.journalistKnown);
    if (dp > 0) dp *= vw === "charmed" ? P.villageCharmed : (vw === "hostile" ? P.villageHostile : 1);
    o.press = clamp(o.press + dp, 0, 100);

    // Officialdom.
    var F = O.official;
    var rung = IN ? IN.effectiveRung(state) : 0;
    var df = -F.decay + F.perRung * rung + (vw === "hostile" ? F.villageHostile : 0);
    o.official = clamp(o.official + df, 0, 100);

    // The Golden Lady and the Lady of the Spur reach the world at last (never confirmed).
    var w = state.working;
    if (w && w.later && w.later.length > o.laterUsed) {
      w.later.slice(o.laterUsed).forEach(function (n) {
        var sign = n.mode === "banish" ? 0.5 : 1;
        if (n.target === "village") o.village = clamp(o.village + O.ladies.villagePerStrength * n.strength * sign, 0, 100);
        if (n.target === "press") {
          o.press = clamp(o.press + O.ladies.pressPerStrength * n.strength, 0, 100);
          o.official = clamp(o.official + O.ladies.officialPerStrength * n.strength, 0, 100);
        }
      });
      o.laterUsed = w.later.length;
    }

    familyWeek(state);
    return lines;
  }

  /* ============================================================
     Events
     ============================================================ */

  function conditionOK(state, c) {
    ensure(state);
    var o = state.outside;
    if (c.villageAbove != null && !(o.village > c.villageAbove)) return false;
    if (c.villageBelow != null && !(o.village < c.villageBelow)) return false;
    if (c.pressAbove != null && !(o.press > c.pressAbove)) return false;
    if (c.pressBelow != null && !(o.press < c.pressBelow)) return false;
    if (c.officialAbove != null && !(o.official > c.officialAbove)) return false;
    if (c.officialBelow != null && !(o.official < c.officialBelow)) return false;
    return true;
  }

  function applyEffects(state, p, fx) {
    ensure(state);
    var o = state.outside;
    if (fx.outside) {
      ["village", "press", "official"].forEach(function (k) { if (fx.outside[k]) o[k] = clamp(o[k] + fx.outside[k], 0, 100); });
    }
    if (fx.familyConcern && p.resident != null) {
      var r = null;
      state.residents.forEach(function (x) { if (x.id === p.resident) r = x; });
      if (r && r.family) r.family.concern = clamp(r.family.concern + fx.familyConcern, 0, 100);
    }
    if (fx.setRule && state.rules) Object.keys(fx.setRule).forEach(function (k) { state.rules[k] = fx.setRule[k]; });
  }

  function familyWord(r) {
    if (!r.family) return "";
    var list = O.family.words;
    for (var i = 0; i < list.length; i++) if (r.family.concern < list[i].below) return list[i].word;
    return list[list.length - 1].word;
  }

  window.RACINATION_OUTSIDE = {
    data: O,
    setRandom: setRandom,
    ensure: ensure,
    word: word,
    weekly: weekly,
    conditionOK: conditionOK,
    applyEffects: applyEffects,
    familyWord: familyWord,
    goodReason: goodReason
  };

})();
