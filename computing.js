/*
  RACINATION — computing.js
  Milestone 9: the Computing Room (GDD §5.6).

  Pitch, team, develop, duplicate, advertise, review and sell. One
  screen, a small part of the game. It earns money and makes trouble.

  Figures and words: data/computing.js. Events: data/computing-events.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var C = D.computing;
  var H = window.RACINATION_HOUSEHOLD;
  if (!C || !H) return;

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pickFrom(list) { return list[Math.floor(rand() * list.length)]; }
  function pence(p) { return Math.round(Number(p || 0) * 100); }
  function fill(text, t) { return String(text || "").replace(/\{(\w+)\}/g, function (m, k) { return t[k] != null ? t[k] : m; }); }

  function type(id) { for (var i = 0; i < C.types.length; i++) if (C.types[i].id === id) return C.types[i]; return C.types[0]; }
  function scope(id) { for (var i = 0; i < C.scopes.length; i++) if (C.scopes[i].id === id) return C.scopes[i]; return C.scopes[0]; }
  function byYear(table, year) { return table[clamp(year, 1983, 1989)]; }
  function findResident(state, id) {
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }

  function ensure(state) {
    if (!state.computing) state.computing = {};
    var c = state.computing;
    if (c.project === undefined) c.project = null;
    if (!Array.isArray(c.games)) c.games = [];
    if (typeof c.nextId !== "number") c.nextId = 1;
    if (typeof c.salesMod !== "number") c.salesMod = 0;
  }

  // The team: whoever is on Computing Room duty, up to three.
  function team(state) {
    return state.residents.filter(function (r) { return r.duty === "computing"; }).slice(0, C.maxTeam);
  }

  function spend(state, label, pounds) {
    state.money -= pence(pounds);
    if (state.house && state.house.spent) state.house.spent.push({ label: label, amount: -pence(pounds) });
  }

  /* ============================================================
     Pitch
     ============================================================ */

  function pitch(state, title, typeId, scopeId) {
    ensure(state);
    var c = state.computing;
    if (c.project) return { ok: false, why: "A game is already being written." };
    var t = String(title || "").replace(/[<>`{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!t) return { ok: false, why: "Give the game a title." };
    var tm = team(state);
    var lead = tm.slice().sort(function (a, b) { return (b.skills.programming || 0) - (a.skills.programming || 0); })[0];
    c.project = { id: c.nextId++, title: t, type: type(typeId).id, scope: scope(scopeId).id, progress: 0, work: scope(scopeId).work,
      qualitySum: 0, womanWeeks: 0, lead: lead ? lead.id : null, started: state.week, finished: false };
    return { ok: true, text: fill(C.lines.started, { title: t }) };
  }

  function abandon(state) {
    ensure(state);
    state.computing.project = null;
  }

  /* ============================================================
     Duplicate, advertise
     ============================================================ */

  function runCost(year, n) { return C.pressingSetup + n * byYear(C.unitCost, year); }

  // Order a run: the first run releases a finished game; later runs restock one on sale.
  function order(state, gameId, n, year) {
    ensure(state);
    var c = state.computing;
    if (C.runs.indexOf(n) < 0) return { ok: false, why: "Choose a run." };
    var cost = runCost(year, n);
    if (state.money < pence(cost)) return { ok: false, why: "The house cannot afford that run." };
    if (gameId === "project") {
      var p = c.project;
      if (!p || !p.finished) return { ok: false, why: "There is no finished game." };
      var g = release(state, p, year);
      g.stock = n;
      g.pressed = n;
      c.project = null;
      spend(state, "Cassette duplication", cost);
      return { ok: true, text: "A run of " + n + " cassettes of ‘" + g.title + "’ has been ordered. Review copies have gone out." };
    }
    var game = gameById(state, gameId);
    if (!game || game.status !== "selling") return { ok: false, why: "That game is not on sale." };
    game.stock += n;
    game.pressed += n;
    spend(state, "Cassette duplication", cost);
    return { ok: true, text: "A further " + n + " cassettes of ‘" + game.title + "’ have been ordered." };
  }

  function release(state, p, year) {
    var q = p.womanWeeks ? p.qualitySum / p.womanWeeks : 3;
    var sc = scope(p.scope);
    var score = Math.round(clamp(q + sc.quality + (rand() * 2 - 1) * C.reviewLuck, 1, 10));
    var priceKind = year >= 1986 && sc.price === "full" ? "budget" : sc.price;
    var prices = byYear(C.prices, year);
    var price = priceKind === "premium" ? prices.premium : prices.full;
    var rv = null;
    for (var i = 0; i < C.reviews.length; i++) if (score >= C.reviews[i].atLeast) { rv = C.reviews[i]; break; }
    var g = {
      id: p.id, title: p.title, type: p.type, scope: p.scope, lead: p.lead, score: score,
      magazine: pickFrom(C.magazines), review: pickFrom(rv.lines), price: price, priceKind: priceKind,
      year: year, status: "pressing", released: state.week, weeksOnSale: 0, stock: 0, pressed: 0, sold: 0, revenue: 0,
      lastSold: 0, advertWeek: -1
    };
    state.computing.games.push(g);
    return g;
  }

  function gameById(state, id) {
    var gs = state.computing.games;
    for (var i = 0; i < gs.length; i++) if (String(gs[i].id) === String(id)) return gs[i];
    return null;
  }

  function advertise(state, gameId) {
    ensure(state);
    var g = gameById(state, gameId);
    if (!g || g.status !== "selling") return { ok: false, why: "That game is not on sale." };
    if (g.advertWeek === state.week) return { ok: false, why: "It is advertised this week already." };
    if (state.money < pence(C.advert.cost)) return { ok: false, why: "The house cannot afford an advertisement." };
    g.advertWeek = state.week;
    spend(state, "Advertising: ‘" + g.title + "’", C.advert.cost);
    if (state.house) state.house.pit = clamp(state.house.pit + C.advert.pit, 0, 100);
    return { ok: true, text: "A small advertisement for ‘" + g.title + "’ will run in this week's computing papers." };
  }

  /* ============================================================
     The week
     ============================================================ */

  function mercury(state) {
    var w = state.working;
    if (!w || !w.influences) return 0;
    var s = 0;
    w.influences.forEach(function (i) { if (i.lady === "mercury" && i.mode === "build") s = Math.max(s, i.strength); });
    return s;
  }

  function weekly(state, year) {
    ensure(state);
    var c = state.computing;
    var lines = [];
    var hs = state.house;

    // Development.
    var p = c.project;
    if (p && !p.finished) {
      var tm = team(state);
      if (!tm.length) lines.push(fill(C.lines.nobody, { title: p.title }));
      var room = window.RACINATION_ECONOMY ? window.RACINATION_ECONOMY.room(state, "computing") : null;
      var roomAdj = room ? C.quality.roomAtWorst * (1 - room.condition / 100) : 0;
      var ty = type(p.type);
      tm.forEach(function (r) {
        p.progress += C.progressBase + C.progressPerProgramming * (r.skills.programming || 0);
        var q = C.quality.base + C.quality.perProgramming * (r.skills.programming || 0) + ty.letters * (r.skills.letters || 0)
          + C.quality.perRacination * r.meters.racination + C.quality.perPit * (hs ? hs.pit : 0) + roomAdj;
        p.qualitySum += q;
        p.womanWeeks += 1;
        if (p.lead == null || !findResident(state, p.lead)) p.lead = r.id;
      });
      if (p.progress >= p.work) {
        p.finished = true;
        lines.push(fill(C.lines.finished, { title: p.title }));
      }
    }

    // Releases and sales.
    var m = byYear(C.market, year);
    var merc = mercury(state);
    c.games.forEach(function (g) {
      if (g.status === "pressing") {
        g.status = "selling";
        lines.push(fill(C.lines.review, { magazine: g.magazine, title: g.title, score: g.score, line: g.review }));
        if (g.score >= C.hitAt) {
          if (state.events) state.events.records.cassetteHit = (state.events.records.cassetteHit || 0) + 1;
          if (g.lead != null && state.events && findResident(state, g.lead)) {
            state.events.followUps.push({ id: "programmer-fair", week: state.week + 3, resident: g.lead });
          }
        }
        return;
      }
      if (g.status !== "selling") return;
      var wk = g.weeksOnSale;
      g.weeksOnSale += 1;
      if (wk >= C.remainderAfter || wk >= C.curve.length) {
        if (g.stock > 0) {
          var rem = g.stock * C.remainderPrice;
          state.money += pence(rem);
          if (hs && hs.spent) hs.spent.push({ label: "Remaindered cassettes", amount: pence(rem) });
          lines.push(fill(C.lines.remaindered, { n: g.stock, title: g.title, price: Math.round(C.remainderPrice * 100) + "p" }));
          g.stock = 0;
        }
        g.status = "done";
        return;
      }
      var vol = g.priceKind === "budget" ? C.budgetVolume : (g.priceKind === "premium" ? C.premiumVolume : 1);
      var review = Math.pow(g.score / C.reviewPivot, 2);
      var mk = (m.types[g.type] || 1) * m.peak;
      var demand = mk * vol * review * C.curve[wk] * (g.advertWeek === state.week ? C.advert.sales : 1)
        * (1 + C.mercurySales * merc) * (1 + c.salesMod) * (0.8 + rand() * 0.4);
      var want = Math.max(0, Math.round(demand));
      var sold = Math.min(g.stock, want);
      g.stock -= sold;
      g.sold += sold;
      g.lastSold = sold;
      var income = sold * g.price * C.houseShare;
      g.revenue += income;
      if (income > 0) {
        state.money += pence(income);
        if (hs && hs.spent) hs.spent.push({ label: "Cassette sales: ‘" + g.title + "’", amount: pence(income) });
      }
      if (sold) lines.push(fill(C.lines.sales, { title: g.title, n: sold }));
      if (g.stock === 0 && want > sold) lines.push(fill(C.lines.soldOut, { title: g.title }));
      if (hs) hs.pit = clamp(hs.pit + C.pitPerGameOnSale, 0, 100);
      // A hit turns its writer's head.
      if (g.score >= C.hitAt && g.lead != null) {
        var lead = findResident(state, g.lead);
        if (lead) {
          lead.meters.racination = clamp(lead.meters.racination - C.hitRacinationDrain, 0, 100);
          if (lead.last) lead.last.racination -= C.hitRacinationDrain;
          if (wk === 2) lines.push(fill(C.lines.hitDrain, { name: H.displayName(lead) }));
        }
      }
    });
    // Sales effects from events wear off slowly.
    c.salesMod *= 0.9;
    return lines;
  }

  /* ============================================================
     Events
     ============================================================ */

  function conditionOK(state, w) {
    ensure(state);
    var gs = state.computing.games;
    if (w.selling != null && gs.some(function (g) { return g.status === "selling"; }) !== w.selling) return false;
    if (w.released != null && gs.filter(function (g) { return g.status !== "pressing"; }).length < w.released) return false;
    if (w.hit != null && gs.some(function (g) { return g.score >= C.hitAt && g.status !== "pressing"; }) !== w.hit) return false;
    return true;
  }

  function applyEffects(state, fx) {
    ensure(state);
    var c = state.computing;
    if (fx.sales) c.salesMod = clamp(c.salesMod + fx.sales, -0.8, 1);
    if (fx.stockLost) c.games.forEach(function (g) { if (g.status === "selling") g.stock = Math.round(g.stock * (1 - fx.stockLost)); });
  }

  window.RACINATION_COMPUTING = {
    data: C,
    setRandom: setRandom,
    ensure: ensure,
    team: team,
    type: type,
    scope: scope,
    pitch: pitch,
    abandon: abandon,
    runCost: runCost,
    order: order,
    advertise: advertise,
    weekly: weekly,
    conditionOK: conditionOK,
    applyEffects: applyEffects
  };

})();
