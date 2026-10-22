/*
  RACINATION — events.js
  Milestone 5a: the event system. Choosing the week's letters,
  visitors and incidents from the data files, filling in their
  tokens, offering their choices, applying their effects, scheduling
  follow-ups, the Belief–Play axis, and unlocking the glossary.

  The events themselves live in data/letters.js and data/events.js;
  the settings in data/events.js (under eventSettings).
  How to write one: WRITING-EVENTS.md.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var H = window.RACINATION_HOUSEHOLD;
  if (!H) return;
  var h = H.helpers;

  var S = D.eventSettings || {};
  function settings() {
    return {
      weekly: S.weekly || [1, 1, 2, 2, 2, 3],
      letterShare: S.letterShare != null ? S.letterShare : 0.5,
      cooldown: S.defaultCooldown || 26,
      rhetoric: S.rhetoricShift || 3,
      beliefDevotion: S.beliefDevotion != null ? S.beliefDevotion : 0.003,
      playDoubtRelief: S.playDoubtRelief != null ? S.playDoubtRelief : 0.002
    };
  }

  function all() {
    return (D.letters || []).map(function (e) { if (!e.kind) e.kind = "letter"; return e; })
      .concat(D.events || [])
      .concat((D.stories || []).map(function (e) { if (!e.kind) e.kind = "incident"; return e; }))
      .concat((D.romanceEvents || []).map(function (e) { if (!e.kind) e.kind = "incident"; return e; }))
      .concat((D.workingEvents || []).map(function (e) { if (!e.kind) e.kind = "incident"; return e; }));
  }

  function byId(id) {
    var list = all();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pence(p) { return Math.round(Number(p || 0) * 100); }
  function asList(v) { return v == null ? null : (Array.isArray(v) ? v : [v]); }
  function parseISO(s) { var p = String(s).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2] || 1); }

  function ensureEvents(state) {
    if (!state.events) {
      state.events = { pending: [], done: {}, followUps: [], belief: 0, glossary: [], notes: [], records: {}, weekOf: -1, nextKey: 1 };
    }
    var ev = state.events;
    ["pending", "followUps", "glossary", "notes"].forEach(function (k) { if (!Array.isArray(ev[k])) ev[k] = []; });
    if (!ev.done) ev.done = {};
    if (!Array.isArray(ev.arrivals)) ev.arrivals = [];
    if (!ev.records) ev.records = {};
    if (typeof ev.belief !== "number") ev.belief = 0;
    if (typeof ev.nextKey !== "number") ev.nextKey = 1;
  }

  /* ============================================================
     Who an event is about
     ============================================================ */

  function residentMatches(r, c) {
    if (!c || c === true) return true;
    if (c.polarity && r.polarity !== c.polarity) return false;
    if (c.background && asList(c.background).indexOf(r.background) < 0) return false;
    if (c.duty && asList(c.duty).indexOf(r.duty) < 0) return false;
    if (c.desire && asList(c.desire).indexOf(r.desire) < 0) return false;
    if (c.tie && !r.ties.some(function (t) { return asList(c.tie).indexOf(t.kind) >= 0; })) return false;
    if (c.racinationBelow != null && !(r.meters.racination < c.racinationBelow)) return false;
    if (c.racinationAbove != null && !(r.meters.racination > c.racinationAbove)) return false;
    if (c.doubtAbove != null && !(r.meters.doubt > c.doubtAbove)) return false;
    if (c.doubtBelow != null && !(r.meters.doubt < c.doubtBelow)) return false;
    if (c.devotionAbove != null && !(r.meters.devotion > c.devotionAbove)) return false;
    if (c.skill) {
      for (var k in c.skill) if ((r.skills[k] || 0) < c.skill[k]) return false;
    }
    if (c.secret) {
      if (r.secretOut) return false;
      if (secretId(r.secret) !== c.secret) return false;
    }
    if (c.highDoubtWeeks != null && !((r.highDoubtWeeks || 0) >= c.highDoubtWeeks)) return false;
    return true;
  }

  // Which secret a resident carries, by its id in data/residents.js.
  function secretId(text) {
    var list = (D.residents && D.residents.secrets) || [];
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if (typeof x === "object" && x.text === text) return x.id;
    }
    return null;
  }

  // Can this event happen now? Returns who it is about, or null.
  function eligible(state, e, monday, season, rand, ignoreChance) {
    var w = e.when || {};
    var ev = state.events;
    if (e.once && ev.done[e.id] != null) return null;
    var cd = e.every != null ? e.every : settings().cooldown;
    if (ev.done[e.id] != null && state.week - ev.done[e.id] < cd) return null;
    if (w.season && asList(w.season).indexOf(season) < 0) return null;
    var t = monday.getTime();
    if (w.after && t < parseISO(w.after)) return null;
    if (w.before && t > parseISO(w.before)) return null;
    var hs = state.house || {};
    if (w.pitAbove != null && !(hs.pit > w.pitAbove)) return null;
    if (w.pitBelow != null && !(hs.pit < w.pitBelow)) return null;
    if (w.moneyBelow != null && !(state.money < pence(w.moneyBelow))) return null;
    if (w.moneyAbove != null && !(state.money > pence(w.moneyAbove))) return null;
    if (w.guestsAtLeast != null && !((hs.guests || 0) >= w.guestsAtLeast)) return null;
    if (w.residentsAtLeast != null && state.residents.length < w.residentsAtLeast) return null;
    if (w.residentsBelow != null && state.residents.length + (ev.arrivals || []).length >= w.residentsBelow) return null;
    if (w.mistressInCrisis === true) {
      var MI2 = window.RACINATION_MISTRESS;
      if (!MI2 || !MI2.inCrisis(state.mistress)) return null;
    }
    if (w.housekeeperRebels === true) {
      var RR2 = window.RACINATION_RULES;
      if (!RR2 || !RR2.housekeeperWarning(state)) return null;
    }
    if (w.departedAtLeast != null && state.departed.length < w.departedAtLeast) return null;
    if (w.housekeeper === true && state.housekeeper == null) return null;
    if (w.housekeeper === false && state.housekeeper != null) return null;
    if (w.rule) {
      for (var k in w.rule) {
        var cur = state.rules && state.rules[k];
        if (asList(w.rule[k]).indexOf(cur) < 0) return null;
      }
    }
    if (w.authorityBelow != null && !(state.mistress && state.mistress.meters.authority < w.authorityBelow)) return null;
    if (w.beliefAbove != null && !(ev.belief > w.beliefAbove)) return null;
    if (w.beliefBelow != null && !(ev.belief < w.beliefBelow)) return null;
    if (w.record && !(ev.records[w.record] > 0)) return null;
    var IN = window.RACINATION_INTIMACY;
    if ((w.coercionAbove != null || w.rungBelow != null || w.rungAtLeast != null) && !(IN && IN.conditionOK(state, w))) return null;
    if (w.working) {
      var WK = window.RACINATION_WORKING;
      if (!WK || !WK.conditionOK(state, w.working)) return null;
    }
    var onlyIds = null;
    if (w.sameCourtship) {
      onlyIds = IN ? IN.sameCourtshipResidents(state) : [];
      if (!onlyIds.length) return null;
    }

    var ctx = {};
    if (w.resident) {
      var pool = state.residents.filter(function (r) { return residentMatches(r, w.resident) && (!onlyIds || onlyIds.indexOf(r.id) >= 0); });
      if (!pool.length) return null;
      ctx.resident = pool[Math.floor(rand() * pool.length)].id;
    }
    if (w.other) {
      var others = state.residents.filter(function (r) { return r.id !== ctx.resident && residentMatches(r, w.other); });
      if (!others.length) return null;
      ctx.other = others[Math.floor(rand() * others.length)].id;
    }
    if (w.departedAtLeast != null && state.departed.length) {
      ctx.departed = state.departed[Math.floor(rand() * state.departed.length)].id;
    }
    if (w.guest) {
      var gl = (hs.guestList || []);
      if (!gl.length) return null;
      ctx.guest = Math.floor(rand() * gl.length);
    }
    if (w.contact) {
      var cs = (state.mistress && state.mistress.contacts) || [];
      if (!cs.length) return null;
      ctx.contact = Math.floor(rand() * cs.length);
    }
    if (!ignoreChance && w.chance != null && rand() >= w.chance) return null;
    return ctx;
  }

  /* ============================================================
     Choosing the week's events
     ============================================================ */

  function queue(state, e, ctx) {
    state.events.pending.push({
      key: state.events.nextKey++,
      id: e.id,
      kind: e.kind || "incident",
      week: state.week,
      resident: ctx.resident != null ? ctx.resident : null,
      other: ctx.other != null ? ctx.other : null,
      departed: ctx.departed != null ? ctx.departed : null,
      guest: ctx.guest != null ? ctx.guest : null,
      contact: ctx.contact != null ? ctx.contact : null,
      chosen: null,
      result: null
    });
  }

  function startWeek(state, monday, season, rand) {
    ensureEvents(state);
    var ev = state.events;
    if (ev.weekOf === state.week) return;
    ev.weekOf = state.week;
    // Anything left unanswered from an earlier week lapses.
    ev.pending = ev.pending.filter(function (p) { return p.chosen == null && p.week === state.week; });

    var taken = {};
    // Follow-ups that are due.
    var later = [];
    ev.followUps.forEach(function (f) {
      if (f.week <= state.week) {
        var e = byId(f.id);
        if (e) {
          var strict = eligible(state, e, monday, season, rand, true);
          if (e.onlyIfStillTrue && !strict) return;   // circumstances have changed; the follow-up lapses
          var ctx = strict || {};
          if (f.resident != null && state.residents.some(function (r) { return r.id === f.resident; })) ctx.resident = f.resident;
          if (f.other != null && state.residents.some(function (r) { return r.id === f.other; })) ctx.other = f.other;
          // A follow-up about a woman who has since left the house lapses.
          if (f.resident != null && e.when && e.when.resident && ctx.resident !== f.resident) return;
          if (f.other != null && e.when && e.when.other && ctx.other !== f.other) return;
          queue(state, e, ctx);
          taken[e.id] = true;
        }
      } else later.push(f);
    });
    ev.followUps = later;

    // New arrivals whose day has come.
    var stillComing = [];
    (ev.arrivals || []).forEach(function (a) {
      if (a.week <= state.week) {
        var usedS = state.residents.map(function (r) { return r.surname; }).concat(state.departed.map(function (d) { return (d.name || "").split(" ").pop(); }));
        var usedF = state.residents.map(function (r) { return r.first; });
        var r = H.makeResident(state.nextId++, a.polarity || null, usedS, usedF, { tenure: 0, background: a.background });
        r.duty = "rest";
        state.residents.push(r);
        var line = (S.arrivalLine || "{name} arrived on the afternoon train with one suitcase and the twentieth century still on her. She has been given a room and a duty-free week to settle.")
          .replace("{name}", r.title + " " + r.surname);
        if (state.house && state.house.news) state.house.news.push(line);
      } else stillComing.push(a);
    });
    ev.arrivals = stillComing;

    // A resident whose Doubt has been very high for some weeks asks to leave.
    var leaveEvent = byId(S.leaveEventId || "wants-to-leave");
    if (leaveEvent) {
      state.residents.forEach(function (r) {
        if ((r.highDoubtWeeks || 0) >= (S.leaveAfterWeeks || 3)) {
          var already = ev.pending.some(function (p) { return p.id === leaveEvent.id && p.resident === r.id; });
          var recently = r.askedToLeave != null && state.week - r.askedToLeave < (S.leaveAskEvery || 8);
          if (!already && !recently) {
            queue(state, leaveEvent, { resident: r.id });
            r.askedToLeave = state.week;
            taken[leaveEvent.id] = true;
          }
        }
      });
    }

    if (state.week === 0) return;   // the first week is for settling in
    var st = settings();
    var n = st.weekly[Math.floor(rand() * st.weekly.length)] - ev.pending.length;
    var tries = 0;
    while (n > 0 && tries < 12) {
      tries++;
      var wantLetter = rand() < st.letterShare;
      var pool = all().filter(function (e) {
        if (e.followUpOnly || taken[e.id]) return false;
        return wantLetter ? e.kind === "letter" : e.kind !== "letter";
      });
      var candidates = [];
      pool.forEach(function (e) {
        var ctx = eligible(state, e, monday, season, rand, false);
        if (ctx) candidates.push({ e: e, ctx: ctx });
      });
      if (!candidates.length) continue;
      var total = 0;
      candidates.forEach(function (c) { total += c.e.weight || 1; });
      var roll = rand() * total, pick = candidates[0];
      for (var i = 0; i < candidates.length; i++) {
        roll -= candidates[i].e.weight || 1;
        if (roll < 0) { pick = candidates[i]; break; }
      }
      queue(state, pick.e, pick.ctx);
      taken[pick.e.id] = true;
      n--;
    }
  }

  // Fire one event now (the testing tool).
  function fire(state, id, monday, season, rand) {
    ensureEvents(state);
    var e = byId(id);
    if (!e) return "No such event.";
    var ctx = eligible(state, e, monday, season, rand, true);
    if (!ctx) {
      // Fire it anyway with whoever will do.
      ctx = {};
      if (e.when && e.when.resident && state.residents.length) ctx.resident = state.residents[0].id;
      if (e.when && e.when.other && state.residents.length > 1) ctx.other = state.residents[1].id;
      if (state.departed.length) ctx.departed = state.departed[0].id;
      if (e.when && e.when.contact && state.mistress && state.mistress.contacts && state.mistress.contacts.length) ctx.contact = 0;
      if (e.when && e.when.guest && state.house && state.house.guestList && state.house.guestList.length) ctx.guest = 0;
    }
    queue(state, e, ctx);
    return "";
  }

  /* ============================================================
     Tokens
     ============================================================ */

  function personTokens(prefix, p, t) {
    if (!p) return;
    t[prefix + ".name"] = p.title + " " + p.surname;
    t[prefix + ".first"] = p.first || p.surname;
    t[prefix + ".surname"] = p.surname;
    t[prefix + ".title"] = p.title;
    if (p.polarity) t[prefix + ".polarityPlural"] = p.polarity + "s";
  }

  function findResident(state, id) {
    if (id == null) return null;
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }
  function findDeparted(state, id) {
    if (id == null) return null;
    for (var i = 0; i < state.departed.length; i++) if (state.departed[i].id === id) return state.departed[i];
    return null;
  }

  function fillText(state, text, p) {
    var t = {};
    personTokens("resident", findResident(state, p.resident), t);
    personTokens("other", findResident(state, p.other), t);
    var d = findDeparted(state, p.departed);
    if (d) { t["departed.name"] = d.name; t["departed.first"] = d.first || d.name; }
    var hk = state.housekeeper != null ? findResident(state, state.housekeeper) : null;
    personTokens("housekeeper", hk, t);
    var g = p.guest != null && state.house && state.house.guestList ? state.house.guestList[p.guest] : null;
    if (g) { t["guest.name"] = g.name; t["guest.first"] = g.first; t["guest.job"] = g.job; t["guest.town"] = g.town; }
    if (p.contact != null && state.mistress && state.mistress.contacts) t["contact"] = state.mistress.contacts[p.contact] || "an old acquaintance";
    t["house"] = (D.house && D.house.name) || "the house";
    var out = String(text || "").replace(/\{(resident|other|departed|housekeeper|guest)\.(\w+)\}|\{house\}|\{contact\}/g, function (all) {
      var k = all.slice(1, -1);
      return t[k] != null ? t[k] : all;
    });
    var MI = window.RACINATION_MISTRESS;
    if (MI && state.mistress) out = MI.fillTokens(out, state.mistress);
    // A sentence that begins with a token ("a college librarian writes...") still begins with a capital.
    out = out.replace(/(^|[.!?]\s+)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    return out;
  }

  /* ============================================================
     Choices and their effects
     ============================================================ */

  function needsMet(state, p, c) {
    var n = c.needs;
    if (!n) return "";
    if (n.money != null && state.money < pence(n.money)) return "Needs " + "£" + n.money + ".";
    if (n.authority != null && (!state.mistress || state.mistress.meters.authority < n.authority)) return "Needs " + n.authority + " Authority.";
    if (n.housekeeper && state.housekeeper == null) return "Needs a Housekeeper.";
    if (n.skill) {
      for (var k in n.skill) {
        var ok = state.residents.some(function (r) { return (r.skills[k] || 0) >= n.skill[k]; });
        if (!ok) return "Needs someone with " + k + " " + n.skill[k] + ".";
      }
    }
    return "";
  }

  function adjustMeters(target, fx) {
    if (!target || !fx) return;
    ["racination", "devotion", "doubt"].forEach(function (k) {
      if (fx[k]) {
        target.meters[k] = clamp(target.meters[k] + fx[k], 0, 100);
        if (target.last) target.last[k] = (target.last[k] || 0) + fx[k];
      }
    });
  }

  function apply(state, p, fx) {
    if (!fx) return [];
    var notes = [];
    var m = state.mistress;
    if (fx.money) {
      state.money += pence(fx.money);
      if (state.house && state.house.spent) {
        var e = byId(p.id);
        state.house.spent.push({ label: (e && e.title) || "The week’s business", amount: pence(fx.money) });
      }
    }
    if (fx.pit && state.house) state.house.pit = clamp(state.house.pit + fx.pit, 0, 100);
    if (fx.reputation && state.house) state.house.reputation = clamp(state.house.reputation + fx.reputation, 0, 100);
    if (m) {
      if (fx.authority) m.meters.authority = clamp(m.meters.authority + fx.authority, 0, 100);
      if (fx.conviction) m.meters.conviction = clamp(m.meters.conviction + fx.conviction, 0, 100);
      if (fx.mistressDoubt) m.meters.doubt = clamp(m.meters.doubt + fx.mistressDoubt, 0, 100);
    }
    if (fx.belief) state.events.belief = clamp(state.events.belief + fx.belief, -100, 100);
    if (fx.household) state.residents.forEach(function (r) { adjustMeters(r, fx.household); });
    var res = findResident(state, p.resident);
    if (fx.resident) adjustMeters(res, fx.resident);
    if (fx.other) adjustMeters(findResident(state, p.other), fx.other);
    if (fx.housekeeper && state.housekeeper != null) adjustMeters(findResident(state, state.housekeeper), fx.housekeeper);
    if (fx.removeTie && res) {
      var kinds = asList(fx.removeTie);
      res.ties = res.ties.filter(function (t) { return kinds.indexOf(t.kind) < 0; });
    }
    if (fx.room && state.house) {
      state.house.rooms.forEach(function (r) {
        if (r.id === fx.room.id) {
          if (fx.room.condition) r.condition = clamp(r.condition + fx.room.condition, 0, 100);
          if (fx.room.period) r.period = clamp(r.period + fx.room.period, 0, 100);
        }
      });
    }
    if (fx.arrival) {
      asList(fx.arrival).forEach(function (a) {
        state.events.arrivals.push({ week: state.week + (a.weeks || 3), background: a.background || null, polarity: a.polarity || null });
      });
    }
    if (fx.revealSecret && res) res.secretOut = true;
    if (fx.restDuty && res) res.duty = "rest";
    if (fx.depart && res) {
      var reason = typeof fx.depart === "string" ? fx.depart : "left";
      state.departed.push({ id: res.id, name: res.title + " " + res.surname, first: res.first, week: state.week, reason: reason, line: "" });
      state.residents = state.residents.filter(function (x) { return x.id !== res.id; });
    }
    if (fx.departOther) {
      var ot = findResident(state, p.other);
      if (ot) {
        state.departed.push({ id: ot.id, name: ot.title + " " + ot.surname, first: ot.first, week: state.week, reason: "left", line: "" });
        state.residents = state.residents.filter(function (x) { return x.id !== ot.id; });
      }
    }
    if (fx.end) state.endReason = fx.end;
    if (fx.dismissHousekeeper) state.housekeeper = null;
    if (fx.record) {
      asList(fx.record).forEach(function (k) { state.events.records[k] = (state.events.records[k] || 0) + 1; });
    }
    if (fx.bond || fx.bondMistress || fx.breakBond || fx.amends || fx.truth || fx.record) {
      var IN2 = window.RACINATION_INTIMACY;
      if (IN2) IN2.applyEffects(state, p, fx);
    }
    if (fx.working) {
      var WK2 = window.RACINATION_WORKING;
      if (WK2) WK2.applyEffects(state, fx.working);
    }
    if (fx.followUp) {
      asList(fx.followUp).forEach(function (f) {
        state.events.followUps.push({ id: f.id, week: state.week + (f.weeks || 1), resident: p.resident });
      });
    }
    return notes;
  }

  function choose(state, key, index, rand) {
    var p = null;
    state.events.pending.forEach(function (x) { if (x.key === key) p = x; });
    if (!p || p.chosen != null) return { ok: false, why: "That has already been answered." };
    var e = byId(p.id);
    if (!e) return { ok: false, why: "That event no longer exists." };
    var c = e.choices[index];
    if (!c) return { ok: false, why: "No such choice." };
    var why = needsMet(state, p, c);
    if (why) return { ok: false, why: why };

    // Fill in the names now, before the effects (which may send someone away).
    p.snap = {
      title: fillText(state, e.title, p),
      from: e.from ? fillText(state, e.from, p) : "",
      text: fillText(state, e.text, p),
      label: fillText(state, c.label, p)
    };
    var resultText = c.result || "";
    var fx = c.effects || null;
    if (c.outcomes && c.outcomes.length) {
      var roll = rand(), acc = 0, chosen = c.outcomes[c.outcomes.length - 1];
      for (var i = 0; i < c.outcomes.length; i++) {
        acc += c.outcomes[i].chance || 0;
        if (roll < acc) { chosen = c.outcomes[i]; break; }
      }
      resultText = chosen.result || resultText;
      fx = chosen.effects || fx;
      if (c.effects && chosen.effects) apply(state, p, c.effects);
    }
    var filledResult = fillText(state, resultText, p);
    apply(state, p, fx);
    var st = settings();
    if (c.rhetoric === "belief") state.events.belief = clamp(state.events.belief + st.rhetoric, -100, 100);
    if (c.rhetoric === "play") state.events.belief = clamp(state.events.belief - st.rhetoric, -100, 100);

    p.chosen = index;
    p.result = filledResult;
    state.events.done[e.id] = state.week;
    state.events.notes.push({ week: state.week, title: p.snap.title, result: p.result });
    return { ok: true, result: p.result };
  }

  function pendingFor(state, kind) {
    ensureEvents(state);
    return state.events.pending.filter(function (p) {
      if (kind === "letter") return p.kind === "letter";
      if (kind === "business") return p.kind !== "letter";
      return true;
    });
  }

  function unanswered(state, kind) {
    return pendingFor(state, kind).filter(function (p) { return p.chosen == null; });
  }

  // Notes for this week's reckoning; cleared once read.
  function takeNotes(state) {
    var n = state.events.notes.filter(function (x) { return x.week === state.week; });
    state.events.notes = state.events.notes.filter(function (x) { return x.week > state.week; });
    return n;
  }

  /* ============================================================
     The Belief–Play axis, each week
     ============================================================ */

  function weekly(state) {
    var b = state.events.belief;
    var st = settings();
    state.residents.forEach(function (r) {
      r.highDoubtWeeks = r.meters.doubt >= (S.leaveDoubt || 85) ? (r.highDoubtWeeks || 0) + 1 : 0;
      if (b > 0) {
        var dv = b * st.beliefDevotion;
        r.meters.devotion = clamp(r.meters.devotion + dv, 0, 100);
        r.last.devotion += dv;
      } else if (b < 0) {
        var dd = b * st.playDoubtRelief;   // negative: Doubt eases
        r.meters.doubt = clamp(r.meters.doubt + dd, 0, 100);
        r.last.doubt += dd;
      }
    });
  }

  function beliefWord(b) {
    if (b >= 60) return "Belief: the house takes itself entirely seriously";
    if (b >= 20) return "Leaning to Belief";
    if (b > -20) return "Between Belief and Play";
    if (b > -60) return "Leaning to Play";
    return "Play: the house treats itself as a beautiful game";
  }

  /* ============================================================
     The glossary
     ============================================================ */

  var glossaryRegex = null;
  function hear(state, text) {
    var G = D.glossary || [];
    if (!G.length || !text || !state || !state.events) return;
    var lower = " " + String(text).toLowerCase().replace(/[^a-zÀ-ɏ]+/g, " ") + " ";
    G.forEach(function (g) {
      if (state.events.glossary.indexOf(g.term) >= 0) return;
      for (var i = 0; i < g.words.length; i++) {
        if (lower.indexOf(" " + g.words[i] + " ") >= 0) { state.events.glossary.push(g.term); break; }
      }
    });
  }

  function glossary(state) {
    var G = D.glossary || [];
    return G.filter(function (g) { return state.events.glossary.indexOf(g.term) >= 0; });
  }

  /* ============================================================
     A check of the event files (for the testing tools and for Edmund)
     ============================================================ */

  function check() {
    var problems = [];
    var ids = {};
    var known = {};
    all().forEach(function (e) { known[e.id] = true; });
    all().forEach(function (e, i) {
      var where = (e.id || "event number " + (i + 1));
      if (!e.id) problems.push(where + ": it has no id.");
      else if (ids[e.id]) problems.push(where + ": two events share this id.");
      ids[e.id] = true;
      if (!e.title) problems.push(where + ": it has no title.");
      if (!e.text) problems.push(where + ": it has no text.");
      if (!e.choices || !e.choices.length) problems.push(where + ": it has no choices.");
      (e.choices || []).forEach(function (c, j) {
        if (!c.label) problems.push(where + ", choice " + (j + 1) + ": it has no label.");
        if (!c.result && !(c.outcomes && c.outcomes.length)) problems.push(where + ", choice " + (j + 1) + ": it has no result text.");
        if (c.outcomes) {
          var sum = c.outcomes.reduce(function (a, o) { return a + (o.chance || 0); }, 0);
          if (Math.abs(sum - 1) > 0.01) problems.push(where + ", choice " + (j + 1) + ": the outcome chances add up to " + sum + ", not 1.");
        }
        var fxs = [c.effects].concat((c.outcomes || []).map(function (o) { return o.effects; }));
        fxs.forEach(function (fx) {
          if (fx && fx.followUp) asList(fx.followUp).forEach(function (f) {
            if (!known[f.id]) problems.push(where + ", choice " + (j + 1) + ": its follow-up “" + f.id + "” does not exist.");
          });
        });
      });
      var txt = JSON.stringify(e);
      if (/\{resident\./.test(txt) && !(e.when && e.when.resident)) problems.push(where + ": it mentions {resident...} but its “when” has no resident.");
      if (/\{other\./.test(txt) && !(e.when && e.when.other)) problems.push(where + ": it mentions {other...} but its “when” has no other.");
      if (/\{departed\./.test(txt) && !(e.when && e.when.departedAtLeast)) problems.push(where + ": it mentions {departed...} but its “when” has no departedAtLeast.");
      if (/\{guest\./.test(txt) && !(e.when && e.when.guest)) problems.push(where + ": it mentions {guest...} but its “when” has no guest.");
      if (/\{contact\}/.test(txt) && !(e.when && e.when.contact)) problems.push(where + ": it mentions {contact} but its “when” has no contact.");
    });
    return problems;
  }

  window.RACINATION_EVENTS = {
    ensureEvents: ensureEvents,
    startWeek: startWeek,
    fire: fire,
    all: all,
    byId: byId,
    fillText: fillText,
    needsMet: needsMet,
    choose: choose,
    pendingFor: pendingFor,
    unanswered: unanswered,
    takeNotes: takeNotes,
    weekly: weekly,
    queueEvent: function (state, id, ctx) { var e = byId(id); if (e) queue(state, e, ctx || {}); },
    beliefWord: beliefWord,
    hear: hear,
    glossary: glossary,
    check: check
  };

})();
