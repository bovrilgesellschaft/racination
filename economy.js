/*
  RACINATION — economy.js
  Milestone 4a: the household economy. The weekly accounts, paying
  guests, the rooms of the house, the Pit, the outside world's
  yearly events, and the two ways money and the Pit can end a run.

  The figures live in data/economy.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var E = D.economy;
  var H = window.RACINATION_HOUSEHOLD;
  if (!E || !H) return;
  var h = H.helpers;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // What the house rules and the Housekeeper do to the accounts (Milestone 4b).
  function ruleCosts(state) {
    var RR = window.RACINATION_RULES;
    if (RR && state.rules) return RR.costs(state);
    return { electricity: E.electricity, paraffin: 0, electricityPit: 0, remittances: 1, tiePit: 1, housekeeperSaving: 0 };
  }
  function r2(x) { return Math.round(x * 100) / 100; }
  function pence(pounds) { return Math.round(Number(pounds || 0) * 100); }

  function roomDef(id) {
    for (var i = 0; i < E.rooms.length; i++) if (E.rooms[i].id === id) return E.rooms[i];
    return null;
  }

  /* ============================================================
     Setting up
     ============================================================ */

  function initHouse(state) {
    state.house = {
      rooms: E.rooms.map(function (d) {
        return {
          id: d.id,
          period: h.randInt(d.period[0], d.period[1]),
          condition: h.randInt(d.condition[0], d.condition[1]),
          restoring: 0
        };
      }),
      pit: E.pit.start,
      pitLast: 0,
      reputation: E.guests.startingReputation,
      satisfaction: E.guests.startingReputation,
      debtWeeks: 0,
      beatsDone: [],
      weekOf: -1,
      guests: 0,
      post: 0,
      news: [],
      spent: []
    };
    return state.house;
  }

  function room(state, id) {
    var rs = state.house.rooms;
    for (var i = 0; i < rs.length; i++) if (rs[i].id === id) return rs[i];
    return null;
  }

  function roomForDuty(state, dutyId) {
    for (var i = 0; i < E.rooms.length; i++) {
      if (E.rooms[i].duty === dutyId && !E.rooms[i].guest) return room(state, E.rooms[i].id);
    }
    return null;
  }

  function averagePeriod(state) {
    var rs = state.house.rooms.filter(function (r) { return r.id !== "computing"; });
    if (!rs.length) return 50;
    return rs.reduce(function (a, r) { return a + r.period; }, 0) / rs.length;
  }

  function shabbyRooms(state) {
    return state.house.rooms.filter(function (r) { return r.condition < E.shabbyBelow; }).length;
  }

  function guestCapacity(state) {
    return E.rooms.filter(function (d) {
      if (!d.guest) return false;
      var r = room(state, d.id);
      return r && r.condition >= E.guestRoomUsableAt;
    }).length;
  }

  function onDuty(state, dutyId) {
    return state.residents.filter(function (r) { return r.duty === dutyId; });
  }

  function owned(state) {
    return !!(state.mistress && E.ownedBy.indexOf(state.mistress.background) >= 0);
  }

  // Income from a duty is scaled by the Condition of its room.
  function roomFactor(state, dutyId) {
    var r = roomForDuty(state, dutyId);
    return r ? 0.6 + 0.4 * r.condition / 100 : 1;
  }

  /* ============================================================
     The start of a week: guests arrive, the post comes, the news
     ============================================================ */

  // This week's paying guests, by name (Milestone 5b).
  function makeGuests(n, rand) {
    var G = D.guests;
    var list = [];
    if (!G) return list;
    function p(arr) { return arr[Math.floor(rand() * arr.length)]; }
    for (var i = 0; i < n; i++) {
      var first = p(G.firstNames);
      var title = rand() < 0.5 ? "Mrs" : "Miss";
      list.push({
        first: first,
        name: title + " " + p(G.surnames),
        job: p(G.jobs),
        town: p(G.towns),
        age: G.ages[0] + Math.floor(rand() * (G.ages[1] - G.ages[0] + 1))
      });
    }
    return list;
  }

  function startWeek(state, monday, season, rand) {
    var hs = state.house;
    if (hs.weekOf === state.week) return;
    hs.weekOf = state.week;
    hs.news = [];

    var intake = E.guests.intake[(state.rules && state.rules.guestIntake) || E.guests.defaultIntake];
    if (intake == null) intake = E.guests.intake[E.guests.defaultIntake];
    var cap = guestCapacity(state);
    var demand = cap * (E.guests.demandBase + hs.reputation / 150) * (E.guests.season[season] || 1) * intake;
    var g = Math.floor(demand) + (rand() < demand - Math.floor(demand) ? 1 : 0);
    hs.guests = clamp(g, 0, cap);
    hs.guestList = makeGuests(hs.guests, rand);

    var ties = 0;
    state.residents.forEach(function (r) { ties += r.ties.length; });
    hs.post = onDuty(state, "correspondence").length * 3 + ties + Math.floor(rand() * 4);

    // The outside world's fixed dates.
    var mon = monday.getTime(), sun = mon + 6 * 86400000;
    E.beats.forEach(function (b, i) {
      var p = b.date.split("-");
      var t = Date.UTC(+p[0], +p[1] - 1, +p[2]);
      if (t >= mon && t <= sun && hs.beatsDone.indexOf(i) < 0) {
        hs.beatsDone.push(i);
        hs.pit = clamp(hs.pit + (b.pit || 0), 0, 100);
        if (b.damage) {
          var rm = room(state, b.damage.room);
          if (rm) rm.condition = clamp(rm.condition + b.damage.condition, 0, 100);
        }
        hs.news.push(b.line);
      }
    });
  }

  /* ============================================================
     Spending during the week: repairs and restorations
     ============================================================ */

  function repairCost() { return Math.round(E.repair.points * E.repair.costPerPoint); }

  function repair(state, id) {
    var r = room(state, id);
    if (!r || r.condition >= 100) return false;
    var cost = repairCost();
    r.condition = clamp(r.condition + E.repair.points, 0, 100);
    state.money -= pence(cost);
    state.house.spent.push({ label: "Repairs: " + roomDef(id).name, amount: -pence(cost) });
    return true;
  }

  function restore(state, id) {
    var r = room(state, id);
    if (!r || r.restoring > 0 || r.period >= 100 || id === "computing") return false;
    r.restoring = E.restore.weeks;
    state.money -= pence(E.restore.cost);
    state.house.spent.push({ label: "Restoration: " + roomDef(id).name, amount: -pence(E.restore.cost) });
    return true;
  }

  /* ============================================================
     The week's accounts
     ============================================================ */

  function weekAccounts(state, season) {
    var hs = state.house;
    var rc = ruleCosts(state);
    var lines = [];
    function income(label, pounds) { var p = pence(pounds); if (p) lines.push({ label: label, amount: p }); }
    function expense(label, pounds) { var p = pence(pounds); if (p) lines.push({ label: label, amount: -p }); }

    // Guests
    income("Paying guests (" + hs.guests + ")", hs.guests * E.guests.fee);

    // Publications
    var corr = onDuty(state, "correspondence");
    var bestType = 0;
    state.residents.forEach(function (r) { bestType = Math.max(bestType, r.skills.typesetting || 0); });
    var pub = 0;
    corr.forEach(function (r) { pub += E.publications.base + E.publications.perLetters * (r.skills.letters || 0); });
    pub *= (1 + bestType / 10) * roomFactor(state, "correspondence");
    income("Mail-order publications", pub);

    // Needlework
    var sew = 0;
    onDuty(state, "sewing").forEach(function (r) { sew += E.needlework.base + E.needlework.perNeedlework * (r.skills.needlework || 0); });
    sew *= roomFactor(state, "sewing");
    // Sewing time spent on the house's own clothes is not sold.
    if (state.sewing && typeof state.sewing.saleShare === "number") sew *= state.sewing.saleShare;
    income("Needlework and dressmaking", sew);

    // Remittances
    var fam = 0;
    state.residents.forEach(function (r) { r.ties.forEach(function (t) { if (t.kind === "family") fam++; }); });
    income("Residents' contributions and remittances", state.residents.length * (E.remittances.perResident || 0) + fam * E.remittances.perFamilyTie * rc.remittances);

    // Rent or rates
    if (owned(state)) expense("Rates", E.ownerRates);
    else expense("Rent", E.rent);

    // Provisions
    var mouths = state.residents.length + 1 + hs.guests;
    var prov = mouths * E.provisionsPerMouth;
    var garden = 0;
    onDuty(state, "garden").forEach(function (r) { garden += (E.gardenSaves[season] || 0) * (1 + (r.skills.gardening || 0)); });
    garden *= roomFactor(state, "garden");
    var bestCook = 0;
    onDuty(state, "kitchen").forEach(function (r) { bestCook = Math.max(bestCook, r.skills.cookery || 0); });
    prov = prov * (1 - Math.min(0.25, bestCook * E.kitchenSavingPerCookery)) - garden;
    prov = Math.max(prov, mouths * E.provisionsPerMouth * 0.4) * (1 - rc.housekeeperSaving);
    expense("Provisions", prov);

    expense("Coal and paraffin", ((E.heating[season] || 0) + rc.paraffin) * (1 - rc.housekeeperSaving));
    expense("Electricity", rc.electricity);
    expense("Postage", E.postageBase + E.postagePerCorrespondent * corr.length);
    expense("Printing", pub * E.publications.printingShare);

    return lines;
  }

  /* ============================================================
     The house's week: rooms, the Pit, reputation, debt
     ============================================================ */

  function houseWeek(state, season) {
    var hs = state.house;
    var events = [];

    // Rooms decay; restorations progress.
    hs.rooms.forEach(function (r) {
      var d = roomDef(r.id) || { decay: 0.3 };
      var decay = d.decay * (d.cold && season === "winter" ? E.winterDecay : 1);
      r.condition = clamp(r.condition - decay, 0, 100);
      if (r.restoring > 0) {
        r.restoring -= 1;
        if (r.restoring === 0) {
          r.period = clamp(r.period + E.restore.points, 0, 100);
          events.push("The restoration of the " + d.name + " is finished, and it looks a little more like 1934.");
        }
      }
    });

    // The Pit.
    var P = E.pit;
    var rc = ruleCosts(state);
    var ties = 0;
    state.residents.forEach(function (r) { r.ties.forEach(function (t) { if (t.kind === "family") ties++; }); });
    var add = P.deliveries + P.villageShop
      + hs.guests * E.guests.pitEach
      + onDuty(state, "correspondence").length * E.publications.pitEach
      + ties * E.remittances.pitEach * rc.tiePit
      + rc.electricityPit
      + onDuty(state, "computing").length * P.perComputing
      + shabbyRooms(state) * P.perShabbyRoom
      + (state.money < 0 ? P.debt : (state.money < pence(E.worryBelow) ? P.moneyWorry : 0));
    var sub = P.periodCleanses * averagePeriod(state) / 100
      + onDuty(state, "devotions").length * P.perDevotions
      + hs.pit * P.settles;
    var before = hs.pit;
    hs.pit = clamp(hs.pit + add - sub, 0, 100);
    hs.pitLast = hs.pit - before;

    // Guests' satisfaction and the house's reputation.
    if (hs.guests > 0) {
      var G = E.guests;
      var charm = 0, cook = 0;
      onDuty(state, "guestcare").forEach(function (r) { charm += r.skills.charm || 0; });
      onDuty(state, "kitchen").forEach(function (r) { cook += r.skills.cookery || 0; });
      var rooms = ["guest1", "guest2", "guest3", "drawing"].map(function (id) { var r = room(state, id); return r ? r.period : 50; });
      var per = rooms.reduce(function (a, b) { return a + b; }, 0) / rooms.length;
      hs.satisfaction = clamp(G.satisfactionBase + charm * G.perGuestCareCharm + cook * G.perKitchenCookery
        + per * G.roomPeriodWeight - hs.pit * G.pitPenalty, 0, 100);
      hs.reputation = clamp(hs.reputation + (hs.satisfaction - hs.reputation) * G.reputationPull, 0, 100);

      // Each named guest leaves racinated or appalled, and says so (Milestone 5b).
      var GD = D.guests;
      if (GD && hs.guestList && hs.guestList.length) {
        hs.guestList.forEach(function (gst, i) {
          var luck = (Math.sin((state.week + 1) * 12.9898 + i * 78.233) + 1) / 2;   // steady per guest and week
          // A rite she enjoyed (or did not, or was pressed into) colours her whole visit (Milestone 6).
          var happy = luck * 100 < hs.satisfaction + (gst.riteBonus || 0);
          gst.outcome = happy ? "racinated" : "appalled";
          hs.reputation = clamp(hs.reputation + (happy ? GD.racinatedReputation : GD.appalledReputation), 0, 100);
          var lines = happy ? GD.racinatedLines : GD.appalledLines;
          var line = lines[(state.week + i) % lines.length];
          events.push(line.replace("{name}", gst.name).replace("{job}", gst.job).split("{town}").join(gst.town));
        });
      }
    }

    // Debt.
    hs.debtWeeks = state.money < 0 ? hs.debtWeeks + 1 : 0;

    return events;
  }

  // How the house touches each resident this week (after her own drift).
  function residentEffects(state) {
    var hs = state.house;
    var P = E.pit;
    var avg = averagePeriod(state);
    var shabby = shabbyRooms(state);
    state.residents.forEach(function (r) {
      var dRac = -(hs.pit - (P.neutral || 20)) * P.racinationPerPit + (avg - 50) * E.periodRacination;
      var rm = roomForDuty(state, r.duty);
      if (rm) dRac += (rm.period - 50) * E.roomPeriodDuty;
      var dDbt = shabby * P.doubtPerShabbyRoom;
      r.meters.racination = clamp(r.meters.racination + dRac, 0, 100);
      r.meters.doubt = clamp(r.meters.doubt + dDbt, 0, 100);
      r.last.racination += dRac;
      r.last.doubt += dDbt;
    });
  }

  function endReason(state) {
    if (state.house.pit >= 100) return "pit";
    if (state.house.debtWeeks >= E.bankruptWeeks) return "bankrupt";
    return null;
  }

  function pitWord(p) {
    for (var i = 0; i < E.pitWords.length; i++) if (p < E.pitWords[i].below) return E.pitWords[i];
    return E.pitWords[E.pitWords.length - 1];
  }

  window.RACINATION_ECONOMY = {
    data: E,
    initHouse: initHouse,
    startWeek: startWeek,
    weekAccounts: weekAccounts,
    houseWeek: houseWeek,
    residentEffects: residentEffects,
    endReason: endReason,
    repair: repair,
    restore: restore,
    repairCost: repairCost,
    room: room,
    roomDef: roomDef,
    averagePeriod: averagePeriod,
    guestCapacity: guestCapacity,
    shabbyRooms: shabbyRooms,
    owned: owned,
    pitWord: pitWord
  };

})();
