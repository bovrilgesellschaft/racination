/*
  RACINATION — rules.js
  Milestone 4b: the house rules and their effects, the cost in
  Authority of changing them, residents' objections, the
  Housekeeper, and asking for contributions.

  The figures and words live in data/rules.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var RU = D.rules;
  var H = window.RACINATION_HOUSEHOLD;
  if (!RU || !H) return;
  var h = H.helpers;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function rule(id) {
    for (var i = 0; i < RU.rules.length; i++) if (RU.rules[i].id === id) return RU.rules[i];
    return null;
  }

  function optionIndex(r, optId) {
    for (var i = 0; i < r.options.length; i++) if (r.options[i].id === optId) return i;
    return 0;
  }

  // The option currently in force for a rule.
  function current(state, id) {
    var r = rule(id);
    var v = (state.rules && state.rules[id]) || RU.defaults[id];
    return r.options[optionIndex(r, v)];
  }

  function ensureRules(state) {
    state.rules = state.rules || {};
    Object.keys(RU.defaults).forEach(function (k) {
      if (!state.rules[k]) state.rules[k] = RU.defaults[k];
    });
    if (typeof state.rules.isolationWeeks !== "number") state.rules.isolationWeeks = 0;
    if (state.housekeeper === undefined) state.housekeeper = null;
    if (typeof state.lastContribution !== "number") state.lastContribution = -999;
  }

  /* ============================================================
     Changing a rule
     ============================================================ */

  // What a change would cost, and who would object or welcome it.
  function previewChange(state, id, optId) {
    var r = rule(id);
    var from = optionIndex(r, state.rules[id]);
    var to = optionIndex(r, optId);
    var steps = Math.abs(to - from);
    if (!steps) return { steps: 0, cost: 0, objectors: [], supporters: [] };
    var cost = r.quiet ? RU.quietCost : RU.changeCost + RU.perExtraStep * (steps - 1);
    var objectors = [], supporters = [];
    if (r.redFlag) {
      // Nobody welcomes being told not to stop a rite; everybody welcomes the word restored.
      state.residents.forEach(function (res) { (to > from ? objectors : supporters).push(res); });
    } else if (!r.quiet) {
      var tightening = to > from;
      state.residents.forEach(function (res) {
        var likesRule = RU.welcomedBy.indexOf(res.desire) >= 0;
        var nearPit = res.meters.racination < RU.objectsBelowRacination;
        if (tightening) {
          if (likesRule) supporters.push(res);
          else if (nearPit) objectors.push(res);
        } else {
          if (likesRule) objectors.push(res);
          else if (nearPit) supporters.push(res);
        }
      });
    }
    return { steps: steps, cost: cost, objectors: objectors, supporters: supporters };
  }

  function canChange(state, id, optId) {
    var p = previewChange(state, id, optId);
    if (!p.steps) return "";
    var m = state.mistress;
    if (!m) return "There is no Mistress to make rules.";
    if (m.meters.authority < RU.minimumAuthority) return "The Mistress has too little Authority to change the rules.";
    if (m.meters.authority < p.cost) return "That change needs " + p.cost + " Authority; she has " + Math.floor(m.meters.authority) + ".";
    return "";
  }

  function change(state, id, optId) {
    var why = canChange(state, id, optId);
    if (why) return { ok: false, why: why };
    var p = previewChange(state, id, optId);
    if (!p.steps) return { ok: false, why: "" };
    state.mistress.meters.authority = clamp(state.mistress.meters.authority - p.cost, 0, 100);
    p.objectors.forEach(function (r) { r.meters.doubt = clamp(r.meters.doubt + RU.objectorDoubt, 0, 100); });
    p.supporters.forEach(function (r) { r.meters.devotion = clamp(r.meters.devotion + RU.supporterDevotion, 0, 100); });
    state.rules[id] = optId;
    return { ok: true, cost: p.cost, objectors: p.objectors.length, supporters: p.supporters.length };
  }

  /* ============================================================
     The rules' effects
     ============================================================ */

  // Numbers the economy needs.
  function costs(state) {
    var el = current(state, "electricity");
    var fam = current(state, "familyContact");
    var hk = housekeeper(state);
    var saving = 0;
    if (hk) saving = Math.min(RU.housekeeper.maxSaving, (hk.skills.accounts || 0) * RU.housekeeper.savingPerAccounts);
    return {
      electricity: el.cost,
      paraffin: el.paraffin || 0,
      electricityPit: el.pit || 0,
      remittances: fam.remittances,
      tiePit: fam.tiePit,
      housekeeperSaving: saving
    };
  }

  // Multipliers on how much a woman's dress counts this week.
  function dressMultipliers(state) {
    var dc = current(state, "dressCode");
    return { periodMult: dc.periodMult, pitMult: dc.pitMult };
  }

  // The rules' weekly effect on each resident and the Mistress.
  function weekly(state, season) {
    var dc = current(state, "dressCode");
    var el = current(state, "electricity");
    var fam = current(state, "familyContact");
    var events = [];
    state.residents.forEach(function (r) {
      var dDbt = 0, dDev = 0;
      // Resistance to the dress code, fading as she racinates.
      if (dc.pitDoubt) {
        var worn = H.outfit(r, season);
        var pitShare = 1 - H.periodShare(worn);
        dDbt += dc.pitDoubt * pitShare * 3 * (1 - r.meters.racination / 100);
      }
      // Paraffin lamps and no electric fire: those still close to the Pit grumble.
      if (el.pitMindedDoubt && r.meters.racination < RU.objectsBelowRacination) dDbt += el.pitMindedDoubt;
      // Family contact.
      var famTies = r.ties.filter(function (t) { return t.kind === "family"; }).length;
      dDbt += famTies * (fam.doubtPerFamilyTie || 0);
      dDev += fam.devotion || 0;
      r.meters.doubt = clamp(r.meters.doubt + dDbt, 0, 100);
      r.meters.devotion = clamp(r.meters.devotion + dDev, 0, 100);
      r.last.doubt += dDbt;
      r.last.devotion += dDev;
    });
    if (fam.records) state.rules.isolationWeeks = (state.rules.isolationWeeks || 0) + 1;
    if (dc.authorityDrain && state.mistress) {
      state.mistress.meters.authority = clamp(state.mistress.meters.authority - dc.authorityDrain, 0, 100);
    }
    // The Housekeeper may leave the house; the post falls vacant.
    if (state.housekeeper != null && !housekeeper(state)) {
      state.housekeeper = null;
      events.push("The house has lost its Housekeeper. The keys hang on their hook in the scullery passage until another is appointed.");
    }
    return events;
  }

  /* ============================================================
     The Housekeeper
     ============================================================ */

  function housekeeper(state) {
    if (state.housekeeper == null) return null;
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === state.housekeeper) return state.residents[i];
    return null;
  }

  function canAppoint(state, r) {
    if (!r) return "Choose a resident.";
    if (r.polarity !== "brunette") return "The Housekeeper must be a brunette.";
    if (!state.mistress || state.mistress.meters.authority < RU.housekeeper.appointCost) return "The Mistress needs " + RU.housekeeper.appointCost + " Authority to appoint her.";
    if (state.housekeeper === r.id) return "She is already the Housekeeper.";
    return "";
  }

  function appoint(state, r) {
    var why = canAppoint(state, r);
    if (why) return why;
    state.mistress.meters.authority = clamp(state.mistress.meters.authority - RU.housekeeper.appointCost, 0, 100);
    state.housekeeper = r.id;
    return "";
  }

  // Her loyalty: how far her Devotion outweighs her Doubt.
  function loyalty(r) { return Math.round(r.meters.devotion - r.meters.doubt); }

  function housekeeperWarning(state) {
    var hk = housekeeper(state);
    if (!hk || !state.mistress) return "";
    if (hk.meters.doubt > state.mistress.meters.authority) return RU.housekeeper.warning.replace("{name}", H.displayName(hk));
    return "";
  }

  /* ============================================================
     Asking for contributions
     ============================================================ */

  function contributionsReady(state) {
    var C = RU.contributions;
    if (!state.mistress) return "There is no Mistress to ask.";
    if (state.week - state.lastContribution < C.everyWeeks) {
      return "The household was asked " + (state.week - state.lastContribution === 0 ? "this week" : "only " + (state.week - state.lastContribution) + " weeks ago") + ". Ask again from week " + (state.lastContribution + C.everyWeeks + 1) + ".";
    }
    if (state.mistress.meters.authority < C.authorityCost) return "The Mistress needs " + C.authorityCost + " Authority to ask.";
    if (!state.residents.length) return "There is no one to ask.";
    return "";
  }

  function askContributions(state) {
    var why = contributionsReady(state);
    if (why) return { ok: false, why: why };
    var C = RU.contributions;
    var pounds = C.perResident * state.residents.length;
    state.mistress.meters.authority = clamp(state.mistress.meters.authority - C.authorityCost, 0, 100);
    state.residents.forEach(function (r) {
      var extra = r.ties.some(function (t) { return t.kind === "debts"; }) ? C.extraDoubtWithDebts : 0;
      r.meters.doubt = clamp(r.meters.doubt + C.doubtEach + extra, 0, 100);
    });
    state.lastContribution = state.week;
    return { ok: true, pounds: pounds, line: C.line };
  }

  window.RACINATION_RULES = {
    data: RU,
    rule: rule,
    current: current,
    ensureRules: ensureRules,
    previewChange: previewChange,
    canChange: canChange,
    change: change,
    costs: costs,
    dressMultipliers: dressMultipliers,
    weekly: weekly,
    housekeeper: housekeeper,
    canAppoint: canAppoint,
    appoint: appoint,
    loyalty: loyalty,
    housekeeperWarning: housekeeperWarning,
    contributionsReady: contributionsReady,
    askContributions: askContributions
  };

})();
