/*
  RACINATION — dress.js
  Milestone 4b: clothing the household. Orders in the Sewing Room
  (made to measure, with mending first when it is switched on),
  buying from the jumble sale, mail order and a London dealer,
  mail-order deliveries, and weekly wear.

  The figures live in data/wardrobe.js (under making, shops and wear).
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var W = D.wardrobe;
  var H = window.RACINATION_HOUSEHOLD;
  if (!W || !W.making || !H) return;
  var h = H.helpers;
  var MK = W.making, SH = W.shops, WR = W.wear;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pence(pounds) { return Math.round(Number(pounds || 0) * 100); }

  function ensureDress(state) {
    if (!state.sewing) state.sewing = { orders: [], mendFirst: true, nextOrder: 1, lastCapacity: 0, saleShare: 1 };
    if (!state.shops) state.shops = { week: -1, jumble: [], dealer: [], deliveries: [], visited: {}, nextItem: 1 };
  }

  /* ============================================================
     Owners: 0 is the Mistress, any other number a resident
     ============================================================ */

  function owner(state, id) {
    if (id === 0) return state.mistress;
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }

  function ownerName(state, id) {
    var o = owner(state, id);
    if (!o) return "someone who has left";
    return o.title + " " + o.surname;
  }

  function everyone(state) {
    return (state.mistress ? [state.mistress] : []).concat(state.residents);
  }

  /* ============================================================
     The Sewing Room
     ============================================================ */

  function makeable(forMistress) {
    return W.garments.filter(function (d) {
      return d.era === "period" && MK.work[d.slot] && (!d.mistress || forMistress);
    });
  }

  function clothCost(def, fabric) {
    var base = MK.cloth[def.slot] || 6;
    return Math.round(base * (MK.fineFabrics.indexOf(fabric) >= 0 ? MK.fineMultiplier : 1) * 100) / 100;
  }

  function colourChoices(def) { return def.colours || W.periodColours; }

  function placeOrder(state, ownerId, gId, colour, fabric) {
    var def = h.garmentDef(gId);
    if (!def || !MK.work[def.slot]) return { ok: false, why: "That cannot be made in the Sewing Room." };
    var o = owner(state, ownerId);
    if (!o) return { ok: false, why: "Choose who it is for." };
    var cost = clothCost(def, fabric);
    state.money -= pence(cost);
    state.house.spent.push({ label: "Cloth: " + (def.name || def.id).toLowerCase() + " for " + ownerName(state, ownerId), amount: -pence(cost) });
    state.sewing.orders.push({
      id: state.sewing.nextOrder++,
      owner: ownerId, g: gId, colour: colour, fabric: fabric,
      work: MK.work[def.slot], done: 0
    });
    return { ok: true, cost: cost };
  }

  function cancelOrder(state, orderId) {
    state.sewing.orders = state.sewing.orders.filter(function (o) { return o.id !== orderId; });
  }

  function sewingRoomFactor(state) {
    var rm = null;
    (state.house.rooms || []).forEach(function (r) { if (r.id === "sewing") rm = r; });
    return rm ? 0.6 + 0.4 * rm.condition / 100 : 1;
  }

  function capacity(state) {
    var c = 0;
    state.residents.forEach(function (r) {
      if (r.duty === "sewing") c += MK.perSeamstress + MK.perNeedlework * (r.skills.needlework || 0);
    });
    return c * sewingRoomFactor(state);
  }

  // How many weeks until an order is done, at the present pace.
  function weeksLeft(state, order) {
    var cap = capacity(state);
    if (cap <= 0) return null;
    var ahead = 0;
    for (var i = 0; i < state.sewing.orders.length; i++) {
      var o = state.sewing.orders[i];
      ahead += o.work - o.done;
      if (o.id === order.id) break;
    }
    return Math.max(1, Math.ceil(ahead / cap));
  }

  function sewingWeek(state) {
    var events = [];
    var cap = capacity(state);
    var total = cap;
    state.sewing.lastCapacity = cap;

    // Mending first.
    if (state.sewing.mendFirst && cap > 0) {
      var worn = [];
      everyone(state).forEach(function (p) {
        p.wardrobe.forEach(function (g) { if (g.condition < MK.mendBelow && g.slot !== "legs" && g.slot !== "shoes") worn.push({ p: p, g: g }); });
      });
      worn.sort(function (a, b) { return a.g.condition - b.g.condition; });
      var mended = 0;
      for (var i = 0; i < worn.length && cap >= MK.mendWork; i++) {
        worn[i].g.condition = clamp(worn[i].g.condition + MK.mendGain, 0, 100);
        cap -= MK.mendWork;
        mended++;
      }
      if (mended) events.push("The Sewing Room mended " + mended + (mended === 1 ? " garment" : " garments") + " this week.");
    }

    // Then the orders, in turn.
    while (cap > 0 && state.sewing.orders.length) {
      var o = state.sewing.orders[0];
      var need = o.work - o.done;
      var use = Math.min(need, cap);
      o.done += use;
      cap -= use;
      if (o.done >= o.work) {
        state.sewing.orders.shift();
        var p = owner(state, o.owner);
        var def = h.garmentDef(o.g);
        if (p && def) {
          var g = h.makeGarment(def, "made");
          g.colour = o.colour; g.fabric = o.fabric; g.condition = 100;
          p.wardrobe.push(g);
          events.push(ownerName(state, o.owner) + "’s new " + H.garmentName(g).replace(/^an? /, "") + " is finished, made to her measurements.");
        } else {
          events.push("A garment was finished for someone who has left the house. It hangs in the Sewing Room, waiting for a woman of the same measurements.");
        }
      }
    }

    // Time left over goes on needlework for sale.
    state.sewing.saleShare = total > 0 ? cap / total : 1;
    return events;
  }

  /* ============================================================
     Shops
     ============================================================ */

  function stockItem(state, def, source, priceRange, condRange) {
    var g = h.makeGarment(def, source);
    g.condition = h.randInt(condRange[0], condRange[1]);
    return { key: state.shops.nextItem++, garment: g, price: h.randInt(priceRange[0], priceRange[1]) };
  }

  function periodDefs(includeMistress) {
    return W.garments.filter(function (d) { return d.era === "period" && (!d.mistress || includeMistress); });
  }

  function shopsWeek(state, rand) {
    var S = state.shops;
    if (S.week === state.week) return [];
    S.week = state.week;
    S.visited = {};
    var events = [];

    var pool = periodDefs(false);
    S.jumble = [];
    for (var i = 0; i < SH.jumble.items; i++) S.jumble.push(stockItem(state, h.pick(pool), "jumble", SH.jumble.price, SH.jumble.condition));
    S.dealer = [];
    for (var j = 0; j < SH.dealer.items; j++) {
      var useM = j === 0 && rand() < SH.dealer.mistressPieces;
      var dpool = useM ? W.garments.filter(function (d) { return d.mistress; }) : pool;
      S.dealer.push(stockItem(state, h.pick(dpool), "dealer", SH.dealer.price, SH.dealer.condition));
    }

    // Parcels arriving.
    var still = [];
    S.deliveries.forEach(function (d) {
      if (d.arrives <= state.week) {
        var p = owner(state, d.owner);
        if (p) {
          p.wardrobe.push(d.garment);
          events.push("A parcel came by post for " + ownerName(state, d.owner) + ": " + H.garmentName(d.garment) + ".");
        } else {
          events.push("A parcel came by post for someone who has left the house.");
        }
      } else still.push(d);
    });
    S.deliveries = still;
    return events;
  }

  function visitPit(state, shop) {
    var pit = SH[shop] && SH[shop].pit;
    if (!pit || state.shops.visited[shop]) return 0;
    state.shops.visited[shop] = true;
    state.house.pit = clamp(state.house.pit + pit, 0, 100);
    return pit;
  }

  function buy(state, shop, key, ownerId) {
    var p = owner(state, ownerId);
    if (!p) return { ok: false, why: "Choose who it is for." };
    var S = state.shops;
    var list = shop === "jumble" ? S.jumble : S.dealer;
    var item = null;
    for (var i = 0; i < list.length; i++) if (list[i].key === key) item = list[i];
    if (!item) return { ok: false, why: "That has already gone." };
    var def = h.garmentDef(item.garment.g);
    if (def && def.mistress && ownerId !== 0) return { ok: false, why: "That piece is fit only for the Mistress." };
    state.money -= pence(item.price);
    state.house.spent.push({ label: (shop === "jumble" ? "Jumble sale: " : "Dealer: ") + H.garmentName(item.garment), amount: -pence(item.price) });
    item.garment.source = shop;
    p.wardrobe.push(item.garment);
    var list2 = list.filter(function (x) { return x.key !== key; });
    if (shop === "jumble") S.jumble = list2; else S.dealer = list2;
    var pit = visitPit(state, shop);
    return { ok: true, pit: pit, price: item.price };
  }

  function orderByMail(state, index, ownerId, colour) {
    var p = owner(state, ownerId);
    if (!p) return { ok: false, why: "Choose who it is for." };
    var entry = SH.mail.catalogue[index];
    var def = entry && h.garmentDef(entry.g);
    if (!def) return { ok: false, why: "That is not in the catalogue." };
    var g = h.makeGarment(def, "mail");
    if (colour) g.colour = colour;
    g.condition = h.randInt(SH.mail.condition[0], SH.mail.condition[1]);
    state.money -= pence(entry.price);
    state.house.spent.push({ label: "Mail order: " + H.garmentName(g), amount: -pence(entry.price) });
    state.shops.deliveries.push({ arrives: state.week + SH.mail.weeks, owner: ownerId, garment: g });
    return { ok: true, price: entry.price };
  }

  /* ============================================================
     Wear
     ============================================================ */

  function wearWeek(state, season) {
    var events = [];
    var laundresses = state.residents.filter(function (r) { return r.duty === "laundry"; }).length;
    var saving = Math.min(WR.maxLaundry, laundresses * WR.perLaundress);
    everyone(state).forEach(function (p) {
      var worn = H.outfit(p, season);
      worn.forEach(function (g) {
        var loss = (WR.slots[g.slot] != null ? WR.slots[g.slot] : WR.perWeek) * (1 - saving);
        g.condition = clamp(g.condition - loss, 0, 100);
      });
      var gone = p.wardrobe.filter(function (g) { return g.condition <= 0; });
      gone.forEach(function (g) {
        events.push(WR.lostLine.replace("{name}", p.title + " " + p.surname).replace("{garment}", H.garmentName(g).replace(/^an? /, "")));
      });
      if (gone.length) p.wardrobe = p.wardrobe.filter(function (g) { return g.condition > 0; });
    });
    return events;
  }

  window.RACINATION_DRESS = {
    data: W,
    ensureDress: ensureDress,
    owner: owner,
    ownerName: ownerName,
    makeable: makeable,
    clothCost: clothCost,
    colourChoices: colourChoices,
    placeOrder: placeOrder,
    cancelOrder: cancelOrder,
    capacity: capacity,
    weeksLeft: weeksLeft,
    sewingWeek: sewingWeek,
    shopsWeek: shopsWeek,
    buy: buy,
    orderByMail: orderByMail,
    wearWeek: wearWeek
  };

})();
