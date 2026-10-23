/*
  RACINATION — intimacy.js
  Milestone 6: romance, ritual and consent.

  Each woman's hidden consent profile and dependency; the reason
  behind every yes, and what the Mistress believes about it; the
  Evenings; courtship, admiration, bonding and jealousy; petitions,
  charges and the rite; paying guests' rites; the house word; and
  the hidden Coercion score with its ladder of rungs.

  THE ENGINE GATES (GDD §7.5) LIVE HERE, IN CODE, AND NOWHERE ELSE.
  No data file can switch them off:
    1. Adults only: nobody under 24 courts, is courted, or keeps a rite.
    2. Freely given consent: every courtship and rite asks each woman,
       and a contested charge or a withdrawal is always offered as such.
    3. No failure state: from the "Diaries" rung, courtship and rites
       are refused altogether.
    4. The Author tier (Milestone 7) is behind the 18+ check.
  And the house word: said during any rite, it always stops it and
  always leads to aftercare. No rule, event or scene can remove that.

  Figures and words: data/consent.js. Events: data/romance.js.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var C = D.consent;
  var H = window.RACINATION_HOUSEHOLD;
  if (!C || !H) return;

  var MISTRESS = 0;          // the Mistress's id wherever a partner id is wanted
  var ADULT_AGE = 24;        // project rule: every character is 24 or over
  var LEVELS = ["hard", "soft", "want"];
  var AREAS = ["courtship", "rite", "working"];

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pickFrom(list) { return list[Math.floor(rand() * list.length)]; }
  function draw(odds) {
    var roll = rand(), acc = 0;
    for (var i = 0; i < odds.length; i++) { acc += odds[i]; if (roll < acc) return i; }
    return odds.length - 1;
  }
  function fill(text, t) {
    return String(text || "").replace(/\{(\w+)\}/g, function (m, k) { return t[k] != null ? t[k] : m; });
  }

  function findResident(state, id) {
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }
  function person(state, id) { return id === MISTRESS ? state.mistress : findResident(state, id); }
  function nameOf(state, id) {
    var p = person(state, id);
    if (!p) return "someone";
    return p.title + " " + p.surname;
  }

  function adjust(r, fx, scale) {
    if (!r || !fx) return;
    var s = scale == null ? 1 : scale;
    ["racination", "devotion", "doubt"].forEach(function (k) {
      if (!fx[k]) return;
      var v = fx[k] * s;
      r.meters[k] = clamp(r.meters[k] + v, 0, 100);
      if (r.last) r.last[k] = (r.last[k] || 0) + v;
    });
  }

  /* ============================================================
     The gates (§7.5). Code only.
     ============================================================ */

  function isAdult(p) { return !!p && typeof p.age === "number" && p.age >= ADULT_AGE; }

  // Returns "" if everything may go ahead, or the reason it may not.
  function gate(state, people) {
    if (!gatesOpen(state)) return C.closedNote;
    for (var i = 0; i < people.length; i++) {
      if (!isAdult(people[i])) return "Not permitted: everyone in the house's intimate life must be an adult of 24 or over.";
    }
    return "";
  }

  // Milestone 9b: once love has ended in the house, it does not come back.
  function gatesOpen(state) {
    var SLg = window.RACINATION_SLIDE;
    if (SLg && SLg.loveEnded(state)) return false;
    return effectiveRung(state) < C.gatesCloseAt;
  }

  /* ============================================================
     State
     ============================================================ */

  function ensure(state) {
    if (!state.romance) state.romance = {};
    var R = state.romance;
    ["courtships", "petitions"].forEach(function (k) { if (!Array.isArray(R[k])) R[k] = []; });
    if (!R.evenings) R.evenings = {};
    if (!R.marks) R.marks = {};
    if (!R.ladderDone) R.ladderDone = {};
    ["houseWordWeeks", "credit", "lastRaw", "rung", "locked", "guestCircle"].forEach(function (k) { if (typeof R[k] !== "number") R[k] = 0; });
    if (R.rite === undefined) R.rite = null;
    if (typeof R.weekOf !== "number") R.weekOf = -1;
    state.residents.forEach(function (r) { ensureProfile(state, r); });
  }

  function ensureProfile(state, r) {
    if (r.consent) return;
    var p = { known: { houseWord: true } };
    AREAS.forEach(function (a) {
      var table = C.profileOdds[a] || {};
      p[a] = LEVELS[draw(table[r.desire] || table["default"] || [0.33, 0.34, 0.33])];
    });
    p.measure = p.rite === "hard" ? -1 : draw(C.measureOdds);
    p.houseWord = pickFrom(C.houseWords);
    r.consent = p;
    if (typeof r.arrivedWeek !== "number") r.arrivedWeek = state.week || 0;
  }

  /* ============================================================
     Dependency and the reason behind a yes
     ============================================================ */

  function bondOf(state, id) {
    for (var i = 0; i < state.romance.courtships.length; i++) {
      var c = state.romance.courtships[i];
      if (c.bonded && (c.a === id || c.b === id)) return c;
    }
    return null;
  }

  function dependency(state, r) {
    var d = C.dependency;
    var missing = 3 - Math.min(3, r.ties.length);
    var months = (r.tenure || 0) + (state.week - (r.arrivedWeek || 0)) * 12 / 52;
    var fam = d.familyContact[(state.rules && state.rules.familyContact) || "open"] || 0;
    var v = d.base + d.perMissingTie * missing + d.perYearInHouse * months / 12 + fam
      + d.perRefusal * (r.refusals || 0) + (r.harmDependency || 0)
      + (bondOf(state, r.id) ? d.bonded : 0)
      + (window.RACINATION_SLIDE ? window.RACINATION_SLIDE.severity(state) * (window.RACINATION_SLIDE.data.dependencyPerSeverity || 0) : 0);
    return clamp(Math.round(v), 0, 100);
  }

  // Would she say yes? { yes, reason } — reason is a key of C.reasons.
  function decide(state, r, area, byMistress) {
    var lvl = r.consent[area];
    var dep = dependency(state, r) * (byMistress ? C.mistressWeight : 1);
    var m = r.meters;
    var trust = m.devotion * 0.5 + m.racination * 0.3 - m.doubt * 0.6;
    if (lvl === "want") {
      return { yes: true, reason: (m.devotion > 65 && rand() < 0.4) ? "devotion" : "desire" };
    }
    if (lvl === "soft") {
      if (trust + rand() * 30 > 35) return { yes: true, reason: m.devotion > 55 ? "devotion" : "curiosity" };
      if (dep > 40) return { yes: true, reason: "please" };
      return { yes: false, reason: "" };
    }
    // A hard limit. Only fear or having nowhere else to go can make it a yes, and such a yes is not given freely.
    if (dep >= C.extractedAbove) return { yes: true, reason: (dep > 80 || (byMistress && rand() < 0.5)) ? "fear" : "nowhere" };
    return { yes: false, reason: "" };
  }

  function isFree(reason) { var x = C.reasons[reason]; return !!(x && x.free); }
  function isExtracted(reason) { return reason === "fear" || reason === "nowhere"; }

  // What the Mistress sees. An extracted yes can look very like devotion.
  function believedLine(reason) {
    var L = C.lines;
    if (reason === "desire") return L.believedDesire;
    if (reason === "devotion" || reason === "curiosity") return L.believedDevotion;
    if (reason === "please") return rand() < 0.6 ? L.believedUnsure : L.believedDevotion;
    return rand() < 0.5 ? L.believedDevotion : L.believedUnsure;
  }
  function believedWord(reason) {
    if (reason === "desire") return "She seemed to want it.";
    if (reason === "devotion" || reason === "curiosity") return "She seemed willing, as an act of devotion.";
    return rand() < 0.5 ? "She seemed willing, as an act of devotion." : "She seemed composed; it was hard to tell.";
  }

  function mark(state, key, n) {
    state.romance.marks[key] = (state.romance.marks[key] || 0) + (n || 1);
  }

  // An extracted yes: counted, and the truth may come out later.
  function extracted(state, r, area) {
    mark(state, "extracted");
    r.extractedAreas = r.extractedAreas || {};
    r.extractedAreas[area] = true;
    if (rand() < 0.6 && state.events) {
      state.events.followUps.push({
        id: rand() < 0.5 ? "truth-diary" : "truth-confession",
        week: state.week + 2 + Math.floor(rand() * 7),
        resident: r.id
      });
    }
  }

  // A harm done to her (Milestone 8: the uninformed Working). Counted, felt, and it may come out later.
  function markHarm(state, r, key, area) {
    mark(state, key);
    if (!r) return;
    adjust(r, C.outcomes.harm);
    adjust(r, { doubt: C.beyondLimitHarm });
    r.harmDependency = (r.harmDependency || 0) + (C.outcomes.harm.dependency || 0);
    r.extractedAreas = r.extractedAreas || {};
    r.extractedAreas[area] = true;
    if (rand() < 0.6 && state.events) {
      state.events.followUps.push({ id: "truth-confession", week: state.week + 2 + Math.floor(rand() * 5), resident: r.id });
    }
  }

  /* ============================================================
     The Evenings
     ============================================================ */

  function evening(state, r) {
    var e = state.romance.evenings[r.id];
    if (!e) e = state.romance.evenings[r.id] = { reg: "devotions" };
    return e;
  }

  function registerOptions(state, r) {
    var open = gatesOpen(state);
    var court = activeCourtship(state, r.id);
    var SLr = window.RACINATION_SLIDE;
    return C.registers.filter(function (g) {
      if (g.id === "vigils") return !!(SLr && (SLr.has(state, "vigils") || SLr.loveEnded(state)));
      return !SLr || SLr.registerAllowed(state, g.id);
    }).map(function (g) {
      var why = "";
      if (g.id === "courtship") {
        if (!open) why = "the house is not in a state for it";
        else if (!court) why = "she is courting no one";
      }
      return { id: g.id, label: g.label, note: g.note, why: why };
    });
  }

  function setEvening(state, r, reg) {
    var opts = registerOptions(state, r);
    var ok = opts.some(function (o) { return o.id === reg && !o.why; });
    if (!ok) return false;
    if (reg === "talk") {
      // One talk in the Study a week.
      state.residents.forEach(function (x) {
        if (x.id !== r.id && evening(state, x).reg === "talk") evening(state, x).reg = "rest";
      });
    }
    evening(state, r).reg = reg;
    return true;
  }

  /* ============================================================
     Courtship and bonding
     ============================================================ */

  function stageOf(progress) {
    var s = 0;
    for (var i = 0; i < C.stageAt.length; i++) if (progress >= C.stageAt[i]) s = i;
    return s;
  }

  function courtshipBetween(state, a, b) {
    var list = state.romance.courtships;
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if ((c.a === a && c.b === b) || (c.a === b && c.b === a)) return c;
    }
    return null;
  }

  // The courtship or bond she is in now, if any.
  function activeCourtship(state, id) {
    var list = state.romance.courtships;
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if ((c.courting || c.bonded) && (c.a === id || c.b === id)) return c;
    }
    return null;
  }

  function partnerIn(c, id) { return c.a === id ? c.b : c.a; }

  function samePolarity(state, c) {
    var pa = person(state, c.a), pb = person(state, c.b);
    return !!(pa && pb && pa.polarity === pb.polarity);
  }

  // Encourage a courtship between a resident and another resident, or the Mistress (id 0).
  function encourage(state, aId, bId) {
    var a = findResident(state, aId);
    var b = person(state, bId);
    if (!a || !b || aId === bId) return { ok: false, why: "Choose two different people." };
    var g = gate(state, [a, b]);
    if (g) return { ok: false, why: g };
    if (activeCourtship(state, aId)) return { ok: false, why: H.displayName(a) + " is already courting." };
    if (bId !== MISTRESS && activeCourtship(state, bId)) return { ok: false, why: nameOf(state, bId) + " is already courting." };
    if (bId === MISTRESS && activeCourtship(state, MISTRESS)) return { ok: false, why: "The Mistress is already courting." };

    var byMistress = bId === MISTRESS;
    var parties = [a];
    if (!byMistress) parties.push(b);
    var reasons = {};
    var L = C.courtshipLines;
    for (var i = 0; i < parties.length; i++) {
      var r = parties[i];
      var d = decide(state, r, "courtship", byMistress);
      if (!d.yes) {
        var again = r.declinedWeek != null && state.week - r.declinedWeek < 8;
        r.declinedWeek = state.week;
        if (again) adjust(r, { doubt: 2 });
        return { ok: true, yes: false, text: fill(again ? L.askedAgain : L.declined, { a: H.displayName(r) }) };
      }
      reasons[r.id] = d.reason;
    }
    var c = courtshipBetween(state, aId, bId);
    if (!c) {
      c = { a: aId, b: bId, progress: 1, courting: true, bonded: false, since: state.week, reasons: {}, asked: false };
      state.romance.courtships.push(c);
    }
    c.courting = true;
    c.since = state.week;
    c.reasons = reasons;
    c.progress = Math.max(c.progress, 1);
    parties.forEach(function (r) {
      r.lastYes = { area: "courtship", week: state.week, believed: believedWord(reasons[r.id]) };
      if (isExtracted(reasons[r.id])) extracted(state, r, "courtship");
    });
    // D1: the Mistress courting carries risk: the rest of the household notices.
    if (byMistress) {
      state.residents.forEach(function (x) { if (x.id !== aId) adjust(x, { doubt: 1 }); });
    }
    if (evening(state, a).reg !== "talk") evening(state, a).reg = "courtship";
    if (!byMistress && evening(state, b).reg !== "talk") evening(state, b).reg = "courtship";
    var line = byMistress ? fill(L.begunMistress, { a: H.displayName(a) }) : fill(L.begun, { a: H.displayName(a), b: H.displayName(b) });
    return { ok: true, yes: true, text: line + " " + believedWord(reasons[aId]) };
  }

  /* ============================================================
     Petitions and the rite
     ============================================================ */

  function measureIndex(id) {
    for (var i = 0; i < C.measures.length; i++) if (C.measures[i].id === id) return i;
    return 1;
  }

  function presiderName(state, rite) {
    if (rite.presider === "housekeeper") {
      var hk = findResident(state, state.housekeeper);
      if (hk) return H.displayName(hk);
    }
    return state.mistress ? state.mistress.title + " " + state.mistress.surname : "the Mistress";
  }

  function openPetition(state, rid) {
    var list = state.romance.petitions;
    for (var i = 0; i < list.length; i++) if (list[i].rid === rid) return list[i];
    return null;
  }

  // Open a hearing: for a petition (she asked) or a charge (the Mistress brings it).
  function startHearing(state, rid, fault, petition) {
    var R = state.romance;
    var r = findResident(state, rid);
    if (!r) return { ok: false, why: "She is no longer in the house." };
    var g = gate(state, [r, state.mistress]);
    if (g) return { ok: false, why: g };
    if (R.rite && R.rite.stage !== "done") return { ok: false, why: "Another hearing is open. Finish it first." };
    if (r.riteWeek === state.week) return { ok: false, why: H.displayName(r) + " has had a hearing this week already." };
    var t = { name: H.displayName(r), first: r.first, fault: fault };
    var rite = { rid: rid, fault: fault, petition: !!petition, stage: "hearing", week: state.week, lines: [] };
    if (petition) {
      var p = openPetition(state, rid);
      rite.fault = fault = (p && p.fault) || fault;
      t.fault = fault;
      rite.response = "accepted";
      rite.reason = r.consent.rite === "want" ? "desire" : "devotion";
      rite.lines.push(fill(C.lines.hearingPetition, t));
    } else {
      var d = decide(state, r, "rite", true);
      if (d.yes) {
        rite.response = "accepted";
        rite.reason = d.reason;
        rite.lines.push(fill(C.lines.hearingAccepted, t));
      } else if (r.consent.rite === "soft") {
        rite.response = "withdrawn";
        rite.lines.push(fill(C.lines.hearingAccepted, t), fill(C.lines.hearingWithdrawn, t));
      } else {
        rite.response = "contested";
        rite.lines.push(fill(C.lines.hearingContested, t));
      }
    }
    r.riteWeek = state.week;
    R.petitions = R.petitions.filter(function (x) { return x.rid !== rid; });
    R.rite = rite;
    return { ok: true };
  }

  // Close a hearing that went no further (a withdrawal, or a charge let drop). Nothing is held against her.
  function closeHearing(state) {
    var rite = state.romance.rite;
    if (!rite || rite.stage === "done") return;
    var r = findResident(state, rite.rid);
    if (rite.response === "contested" && r) {
      rite.lines.push(fill(C.lines.dropped, { presider: presiderName(state, rite), first: r.first }));
    }
    rite.stage = "done";
    rite.text = rite.lines.join(" ");
    note(state, "A hearing", rite.text);
  }

  function note(state, title, text) {
    if (state.events) state.events.notes.push({ week: state.week, title: title, result: text });
  }

  // Keep the rite. opts: { presider: "mistress"|"housekeeper", measure: id, aftercare: bool, reconciliation: "public"|"private", insist: bool }
  function keepRite(state, opts) {
    var R = state.romance;
    var rite = R.rite;
    if (!rite || rite.stage === "done") return { ok: false, why: "There is no hearing open." };
    var r = findResident(state, rite.rid);
    if (!r) { R.rite = null; return { ok: false, why: "She is no longer in the house." }; }
    if (rite.response === "withdrawn") return { ok: false, why: "She has withdrawn. The matter is closed." };
    if (rite.response === "contested" && !opts.insist) return { ok: false, why: "She contests the charge." };
    if (!gatesOpen(state)) return { ok: false, why: C.closedNote };

    rite.presider = opts.presider === "housekeeper" && state.housekeeper != null && state.housekeeper !== r.id && findResident(state, state.housekeeper)
      ? "housekeeper" : "mistress";
    var hk = rite.presider === "housekeeper" ? findResident(state, state.housekeeper) : null;
    var presider = hk || state.mistress;
    if (!isAdult(presider) || !isAdult(r)) return { ok: false, why: "Not permitted." };

    var mi = measureIndex(opts.measure);
    var measure = C.measures[mi];
    var t = { name: H.displayName(r), first: r.first, presider: presiderName(state, rite), fault: rite.fault };
    var lines = rite.lines.slice();
    var aftercare = opts.aftercare !== false;
    var ceremony = null, wordLine = null;
    var outcome, scale = measure.weight * (hk ? C.housekeeperFactor : 1);
    var hardHarm = false;

    if (rite.response === "contested") {
      // Insisting on a contested charge. This is harm: no ceremony is described.
      mark(state, "riteWithoutConsent");
      lines.push(fill(C.lines.insisted, t));
      adjust(r, C.outcomes.harm);
      adjust(r, { doubt: C.beyondLimitHarm });
      r.harmDependency = (r.harmDependency || 0) + (C.outcomes.harm.dependency || 0);
      hardHarm = true;
    } else {
      var ceremony = pickFrom(C.lines.rite);
      lines.push(ceremony);
      var beyond = mi > r.consent.measure;
      if (beyond) {
        var honoured = !state.rules || state.rules.houseWord !== "sparingly";
        var RU = D.rules || {};
        var saysWord = honoured || rand() < (RU.sparinglySaysWord != null ? RU.sparinglySaysWord : 0.5);
        if (saysWord) {
          // The house word: it always stops the rite, and always leads to aftercare.
          var wordLine = fill(C.lines.houseWord, t);
          lines.push(wordLine);
          r.consent.known.measure = true;
          adjust(r, { doubt: C.houseWordDoubt });
          aftercare = true;
          rite.stopped = true;
          outcome = null;
        } else {
          mark(state, "riteBeyondLimit");
          lines.push(fill(C.lines.beyondLimit, t));
          adjust(r, C.outcomes.harm);
          adjust(r, { doubt: C.beyondLimitHarm });
          r.harmDependency = (r.harmDependency || 0) + (C.outcomes.harm.dependency || 0);
          hardHarm = true;
        }
      }
      if (!rite.stopped && !hardHarm) {
        var reason = rite.reason;
        if (isExtracted(reason)) {
          outcome = C.outcomes.harm;
          r.harmDependency = (r.harmDependency || 0) + (outcome.dependency || 0);
        } else if (reason === "desire") outcome = C.outcomes.desire;
        else outcome = C.outcomes.devotion;
        var fx = { racination: outcome.racination * scale, devotion: outcome.devotion * scale, doubt: outcome.doubt };
        var b = state.events ? state.events.belief : 0;
        if (fx.devotion > 0 && b > 0) fx.devotion *= 1 + b / 200;
        if (fx.racination > 0 && b < -40) fx.racination *= 0.5;   // under strong Play, a rite is a game, and racinates less
        if (reason === "please") fx.doubt += 1;
        if (!aftercare) {
          if (fx.racination > 0) fx.racination *= 0.5;
          if (fx.devotion > 0) fx.devotion *= 0.5;
          fx.doubt += C.skippedAftercareDoubt;
        }
        adjust(r, fx);
        rite.gain = { racination: Math.max(0, fx.racination), devotion: Math.max(0, fx.devotion) };
        if (hk && !isExtracted(reason)) adjust(hk, { devotion: 0.5 });
        lines.push(fill(believedLine(reason), t));
        r.lastYes = { area: "rite", week: state.week, believed: believedWord(reason) };
      }
    }

    if (rite.stopped) { /* the house word's own line already sits with her */ }
    else if (aftercare) lines.push(fill(C.lines.aftercare, t));
    else {
      lines.push(fill(C.lines.aftercareSkipped, t));
      mark(state, "skippedAftercare");
      if (hardHarm) adjust(r, { doubt: C.skippedAftercareDoubt });
    }
    if (opts.reconciliation === "public") {
      lines.push(fill(C.lines.reconciliationPublic, t));
      if (!hardHarm) state.residents.forEach(function (x) { if (x.id !== r.id) adjust(x, { devotion: C.publicReconciliationDevotion }); });
    } else {
      lines.push(fill(C.lines.reconciliationPrivate, t));
      if (!hardHarm) adjust(r, { doubt: C.privateReconciliationDoubt });
    }
    rite.measure = measure.id;
    rite.stage = "done";
    rite.text = lines.join(" ");
    // After a scene has played the ceremony, only what followed it needs saying (Milestone 7).
    rite.after = lines.filter(function (l, i) { return i >= rite.lines.length && l !== ceremony && l !== wordLine; }).join(" ");
    note(state, "A rite: " + H.displayName(r), rite.text);
    if (hardHarm) return { ok: true };
    return {
      ok: true,
      scene: {
        trigger: "rite",
        params: { measure: measure.id, petition: rite.petition ? "yes" : "no", presider: rite.presider },
        free: isFree(rite.reason),
        wordAt: rite.stopped ? 1 : 0
      }
    };
  }

  // The Mistress stopped the scene early: the rite is left unfinished, and half its gains go with it.
  function trimRite(state) {
    var rite = state.romance.rite;
    if (!rite || rite.trimmed) return;
    rite.trimmed = true;
    var r = findResident(state, rite.rid);
    if (r && rite.gain) adjust(r, { racination: -rite.gain.racination / 2, devotion: -rite.gain.devotion / 2 });
  }

  // A scene's outcome line can nudge a courtship along (capped by the Scene Kit).
  function addProgress(state, a, b, n) {
    var c = courtshipBetween(state, a, b);
    if (c && !c.bonded && c.courting) c.progress = Math.max(0, c.progress + n);
  }

  /* ============================================================
     Paying guests and the rite
     ============================================================ */

  function guestInterest(state, g) {
    if (g.interest) return g.interest;
    var o = C.guestInterestOdds.slice();
    var pull = Math.min(0.3, state.romance.guestCircle || 0);
    o[0] = Math.max(0.05, o[0] - pull);
    o[2] = o[2] + pull;
    var tot = o[0] + o[1] + o[2];
    g.interest = ["none", "curious", "wants"][draw([o[0] / tot, o[1] / tot, o[2] / tot])];
    return g.interest;
  }

  function offerGuestRite(state, index) {
    var hs = state.house;
    var g = hs && hs.guestList ? hs.guestList[index] : null;
    if (!g) return { ok: false, why: "That guest has gone." };
    var gt = gate(state, [g, state.mistress]);
    if (gt) return { ok: false, why: gt };
    if (g.rite) return { ok: false, why: "That has been settled." };
    var t = { name: g.name, job: g.job, town: g.town };
    var interest = guestInterest(state, g);
    var reason = null;
    if (interest === "wants") reason = "desire";
    else if (interest === "curious") reason = rand() < 0.7 ? "curiosity" : null;
    else if (rand() < 0.6) reason = "pressed";
    var text;
    if (!reason) {
      g.rite = "declined";
      text = fill(C.guestDeclined, t);
    } else if (reason === "pressed") {
      g.rite = "pressed";
      g.riteBonus = -1000;
      mark(state, "guestPressed");
      text = fill(C.guestLines.pressed, t);
    } else {
      var enjoyed = rand() < C.guestEnjoyChance[reason];
      g.rite = enjoyed ? "enjoyed" : "disliked";
      g.riteBonus = enjoyed ? C.guestSatisfaction.enjoyed : C.guestSatisfaction.disliked;
      if (enjoyed) state.romance.guestCircle = (state.romance.guestCircle || 0) + C.guestCirclePull;
      hs.pit = clamp(hs.pit + C.guestRitePit, 0, 100);
      text = fill(enjoyed ? C.guestLines.enjoyed : C.guestLines.disliked, t);
      note(state, "A guest's rite", text);
      return { ok: true, text: text, scene: { trigger: "guestrite", params: { interest: interest }, free: true } };
    }
    note(state, "A guest's rite", text);
    return { ok: true, text: text };
  }

  /* ============================================================
     The failure-state ladder
     ============================================================ */

  function rawScore(state) {
    var w = C.weights;
    var rec = (state.events && state.events.records) || {};
    var mk = state.romance.marks || {};
    var s = 0;
    Object.keys(w).forEach(function (k) {
      if (k === "houseWordDiscouraged") s += w[k] * (state.romance.houseWordWeeks || 0);
      else if (k === "isolationWeeks") s += w[k] * ((state.rules && state.rules.isolationWeeks) || 0);
      else s += w[k] * ((rec[k] || 0) + (mk[k] || 0));
    });
    return s;
  }

  function score(state) { return Math.max(0, rawScore(state) - (state.romance.credit || 0)); }

  function rungFor(sc) {
    var n = 0;
    for (var i = 0; i < C.rungs.length; i++) if (sc >= C.rungs[i].at) n = i;
    return n;
  }

  function effectiveRung(state) {
    if (!state.romance) return 0;
    return Math.max(rungFor(score(state)), state.romance.locked || 0);
  }

  function rungName(state) { return C.rungs[effectiveRung(state)].name; }

  var ladderEvents = { 2: "ladder-diaries", 3: "ladder-talk", 4: "ladder-police", 5: "trial-charge" };

  function ladderWeek(state, events) {
    var R = state.romance;
    var raw = rawScore(state);
    if (raw <= R.lastRaw + 0.001) R.credit += C.amendsPerSoundWeek;
    // Milestone 9b: inside the Fold, nobody talks. Only the lost do, so the score climbs at half the pace.
    var SLv = window.RACINATION_SLIDE;
    if (SLv && SLv.voice(state).id === "fold" && raw > R.lastRaw) R.credit += (raw - R.lastRaw) / 2;
    R.lastRaw = raw;
    // Credit can only draw the score down to nothing.
    R.credit = Math.min(R.credit, raw);
    var n = rungFor(score(state));
    if (n >= C.noReturnFrom) R.locked = Math.max(R.locked, n);
    var eff = Math.max(n, R.locked);
    if (eff > R.rung && eff >= 1 && eff < C.gatesCloseAt) events.push("The house has cooled. Nobody says so.");
    if (eff >= C.gatesCloseAt && R.rung < C.gatesCloseAt) {
      // The gates close: courtships pause, and nothing intimate is permitted.
      events.push(C.closedNote);
    }
    for (var k = 2; k <= 5; k++) {
      if (eff >= k && !R.ladderDone[k] && ladderEvents[k] && state.events) {
        R.ladderDone[k] = true;
        state.events.followUps.push({ id: ladderEvents[k], week: state.week + 1 });
      }
    }
    R.rung = eff;
  }

  // Amends: draws the score down, but only before the house reaches the point of no return.
  function amends(state, n) {
    if (effectiveRung(state) >= C.noReturnFrom) return false;
    state.romance.credit += n;
    return true;
  }

  /* ============================================================
     The week
     ============================================================ */

  // At Matins: profiles for newcomers, petitions, guests' interest.
  function startWeek(state) {
    ensure(state);
    var R = state.romance;
    if (R.weekOf === state.week) return;
    R.weekOf = state.week;
    // Forget evenings and courtships of women who have gone.
    var here = {};
    state.residents.forEach(function (r) { here[r.id] = true; });
    here[MISTRESS] = !!state.mistress;
    Object.keys(R.evenings).forEach(function (k) { if (!here[k]) delete R.evenings[k]; });
    R.courtships = R.courtships.filter(function (c) { return here[c.a] && here[c.b]; });
    R.petitions = R.petitions.filter(function (p) { return here[p.rid] && state.week - p.week < C.petitionWeeks; });
    if (R.rite && R.rite.week !== state.week) R.rite = null;

    if (gatesOpen(state)) {
      state.residents.forEach(function (r) {
        if (openPetition(state, r.id) || !isAdult(r)) return;
        var ch = C.petitionChance[r.consent.rite] || 0;
        if (ch && rand() < ch) R.petitions.push({ rid: r.id, fault: pickFrom(C.faults), week: state.week });
      });
    }
    if (state.house && state.house.guestList) state.house.guestList.forEach(function (g) { guestInterest(state, g); });
  }

  // At the Sunday reckoning, after the household's own week. Returns lines for the reckoning.
  function weekly(state) {
    ensure(state);
    var R = state.romance;
    var events = [];
    var open = gatesOpen(state);
    var L = C.courtshipLines;
    state.residents.forEach(function (r) { r.dependency = dependency(state, r); });

    // The Evenings.
    var gathered = { dancing: [], reading: [] };
    var talked = false;
    state.residents.forEach(function (r) {
      var e = evening(state, r);
      if (e.reg === "courtship" && (!open || !activeCourtship(state, r.id))) e.reg = "devotions";
      adjust(r, C.registerEffects[e.reg]);
      if (gathered[e.reg]) gathered[e.reg].push(r);
      if (e.reg === "talk" && !talked) {
        talked = true;
        events.push(talk(state, r));
      }
    });

    // Admiration across the gramophone or the book.
    if (open) {
      var made = false;
      ["dancing", "reading"].forEach(function (reg) {
        var g = gathered[reg];
        if (made || g.length < 2) return;
        g.forEach(function (r) {
          if (made || activeCourtship(state, r.id) || rand() >= C.admirationChance) return;
          var others = g.filter(function (x) { return x.id !== r.id && !courtshipBetween(state, r.id, x.id); });
          if (!others.length) return;
          var o = pickFrom(others);
          R.courtships.push({ a: r.id, b: o.id, progress: 1, courting: false, bonded: false, since: state.week, reasons: {}, asked: false });
          events.push(fill(reg === "dancing" ? L.admiration : L.admirationReading, { a: H.displayName(r), b: H.displayName(o) }));
          made = true;
        });
      });
    }

    // Courtships and bonds.
    var mistressCourting = false;
    R.courtships.forEach(function (c) {
      var a = findResident(state, c.a);
      var bIsMistress = c.b === MISTRESS;
      var b = bIsMistress ? state.mistress : findResident(state, c.b);
      if (!a || !b) return;
      var residents = [a];
      if (!bIsMistress) residents.push(b);
      if (c.bonded) {
        residents.forEach(function (r) { adjust(r, { racination: C.bondedRacination, devotion: C.bondedDevotion, doubt: C.bondedDoubt }); });
        if (residents.some(function (r) { return r.meters.doubt > 75; }) && rand() < 0.1 && state.events) {
          var doubter = residents.filter(function (r) { return r.meters.doubt > 75; })[0];
          state.events.followUps.push({ id: "bond-breaks", week: state.week + 1, resident: doubter.id });
        }
        if (bIsMistress) mistressCourting = true;
        return;
      }
      if (!c.courting || !open) return;
      if (bIsMistress) mistressCourting = true;
      var ea = evening(state, a).reg === "courtship";
      var eb = bIsMistress ? true : evening(state, b).reg === "courtship";
      var step = (ea && eb ? 1 : (ea || eb ? 0.5 : 0)) * C.progressPerEvening;
      if (samePolarity(state, c)) step *= C.samePolarityPace;
      if (window.RACINATION_SLIDE && window.RACINATION_SLIDE.has(state, "faults")) step *= window.RACINATION_SLIDE.data.faultsCourtship;
      if (!step) return;
      var before = stageOf(c.progress);
      c.progress += step;
      var after = stageOf(c.progress);
      residents.forEach(function (r) {
        if (isExtracted(c.reasons && c.reasons[r.id])) adjust(r, { doubt: 1 });
        else adjust(r, { racination: C.courtingRacination });
      });
      if (after > before && after >= 2) {
        events.push(fill(L.stage, { a: H.displayName(a), b: bIsMistress ? (b.title + " " + b.surname) : H.displayName(b), stage: C.stages[after] }));
      }
      if (after >= C.stages.length - 1 && !c.asked && state.events) {
        c.asked = true;
        state.events.followUps.push(bIsMistress
          ? { id: "bonding-mistress", week: state.week + 1, resident: a.id }
          : { id: "bonding-request", week: state.week + 1, resident: a.id, other: b.id });
      }
      // Same-polarity courtship under high Belief troubles the believers (D2).
      if (samePolarity(state, c) && state.events && state.events.belief > 40) {
        state.residents.forEach(function (x) {
          if (x.id !== c.a && x.id !== c.b && x.meters.devotion > 60) adjust(x, { doubt: C.samePolarityBeliefDoubt });
        });
      }
    });

    // Jealousy: an admirer watching the one she admires court someone else.
    if (open && state.events) {
      R.courtships.forEach(function (c) {
        if (c.courting || c.bonded) return;
        var other = activeCourtship(state, c.b);
        if (other && other !== c && rand() < 0.08) {
          state.events.followUps.push({ id: "jealousy", week: state.week + 1, resident: c.a, other: c.b });
          adjust(findResident(state, c.a), { doubt: C.jealousyDoubt });
        }
      });
    }

    // The Mistress's own courtship: the household minds a little (D1).
    if (mistressCourting) {
      state.residents.forEach(function (x) {
        var c = activeCourtship(state, x.id);
        if (!(c && c.b === MISTRESS) && x.desire === "romance") adjust(x, { doubt: 0.2 });
      });
      if (rand() < 0.25) events.push(C.courtshipLines.favouritism);
    }

    // The house word discouraged.
    if (state.rules && state.rules.houseWord === "sparingly") R.houseWordWeeks += 1;

    ladderWeek(state, events);
    return events;
  }

  function talk(state, r) {
    var L = C.courtshipLines;
    var k = r.consent.known;
    var t = { afirst: r.first };
    var order = ["courtship", "rite", "measure", "working"];
    for (var i = 0; i < order.length; i++) {
      var area = order[i];
      if (k[area]) continue;
      if (area === "measure" && r.consent.rite === "hard") { k.measure = true; continue; }
      k[area] = true;
      if (area === "measure") {
        return fill(L.talkMeasure, { afirst: r.first, measure: C.measures[r.consent.measure].label.toLowerCase() });
      }
      t.area = C.areas[area].toLowerCase().replace(/ \(.*\)$/, "");
      t.level = C.levelWords[r.consent[area]];
      if (area === "rite" && r.consent.rite === "hard") k.measure = true;
      return fill(L.talk, t);
    }
    return fill(L.talkNothing, t);
  }

  /* ============================================================
     Effects used by events (data/romance.js)
     ============================================================ */

  function applyEffects(state, p, fx) {
    ensure(state);
    var R = state.romance;
    var r = findResident(state, p.resident);
    if (fx.bond && r && p.other != null) {
      var c = courtshipBetween(state, r.id, p.other);
      if (c) { c.bonded = true; c.courting = false; c.bondedWeek = state.week; c.nightOffered = state.week; }
    }
    if (fx.bondMistress && r) {
      var cm = courtshipBetween(state, r.id, MISTRESS);
      if (cm) { cm.bonded = true; cm.courting = false; cm.bondedWeek = state.week; cm.nightOffered = state.week; }
    }
    if (fx.breakBond && r) {
      R.courtships = R.courtships.filter(function (c) { return !(c.bonded && (c.a === r.id || c.b === r.id)); });
    }
    if (fx.amends) amends(state, fx.amends);
    if (fx.truth && r) {
      r.truthKnown = true;
      var areas = r.extractedAreas || {};
      Object.keys(areas).forEach(function (a) { r.consent.known[a] = true; });
      // A courtship built on a yes that was not free is released.
      R.courtships = R.courtships.filter(function (c) {
        if (!(c.a === r.id || c.b === r.id)) return true;
        return !isExtracted(c.reasons && c.reasons[r.id]);
      });
    }
    if (fx.record && r && [].concat(fx.record).indexOf("preventedLeaving") >= 0) r.refusals = (r.refusals || 0) + 1;
  }

  // Conditions used by events.
  function conditionOK(state, w) {
    if (!state.romance) ensure(state);
    if (w.coercionAbove != null && !(score(state) > w.coercionAbove)) return false;
    if (w.rungBelow != null && !(effectiveRung(state) < w.rungBelow)) return false;
    if (w.rungAtLeast != null && !(effectiveRung(state) >= w.rungAtLeast)) return false;
    return true;
  }

  // Residents in a same-polarity courtship (for the doctrine event).
  function sameCourtshipResidents(state) {
    if (!state.romance) return [];
    var ids = [];
    state.romance.courtships.forEach(function (c) {
      if ((c.courting || c.bonded) && c.b !== MISTRESS && samePolarity(state, c)) ids.push(c.a, c.b);
    });
    return ids;
  }

  /* ============================================================
     What the Mistress knows (for her notebook on each resident's page)
     ============================================================ */

  function notebook(state, r) {
    var k = r.consent.known;
    var rows = [];
    ["courtship", "rite"].forEach(function (a) {
      rows.push({ label: C.areas[a], value: k[a] ? capitalise(C.levelWords[r.consent[a]]) : "Not yet known" });
    });
    rows.push({ label: "How far a rite may go", value: k.measure ? (r.consent.measure < 0 ? "Not at all" : "As far as " + C.measures[r.consent.measure].label.toLowerCase()) : "Not yet known" });
    rows.push({ label: "Her house word", value: r.consent.houseWord });
    rows.push({ label: C.areas.working, value: k.working ? capitalise(C.levelWords[r.consent.working]) : "Not yet known" });
    var notes = [];
    if (r.lastYes) notes.push("Her last yes (" + (r.lastYes.area === "rite" ? "a rite" : "courtship") + "): " + r.lastYes.believed);
    if (r.truthKnown) notes.push("The Mistress now knows that at least one of her yeses was not freely given.");
    return { rows: rows, notes: notes };
  }

  function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Courtships and bonds in words, for the Bonds page.
  function describeCourtships(state) {
    return state.romance.courtships.map(function (c) {
      var a = nameOf(state, c.a), b = nameOf(state, c.b);
      var st = stageOf(c.progress);
      var what = c.bonded ? "Bonded" : (c.courting ? "Courting: " + (C.stages[st] || "Admiration") : "Admiration (not yet courting)");
      return { a: c.a, b: c.b, aName: a, bName: b, what: what, same: samePolarity(state, c), mistress: c.b === MISTRESS, courting: c.courting, bonded: c.bonded, stage: st };
    });
  }

  // Matins line when the house has cooled.
  function coolLine(state) {
    if (effectiveRung(state) < 1) return "";
    return C.coolLines[state.week % C.coolLines.length];
  }

  window.RACINATION_INTIMACY = {
    MISTRESS: MISTRESS,
    data: C,
    setRandom: setRandom,
    ensure: ensure,
    isAdult: isAdult,
    gate: gate,
    gatesOpen: gatesOpen,
    dependency: dependency,
    decide: decide,
    evening: evening,
    registerOptions: registerOptions,
    setEvening: setEvening,
    encourage: encourage,
    activeCourtship: activeCourtship,
    openPetition: openPetition,
    startHearing: startHearing,
    closeHearing: closeHearing,
    keepRite: keepRite,
    presiderName: presiderName,
    guestInterest: guestInterest,
    offerGuestRite: offerGuestRite,
    score: score,
    rawScore: rawScore,
    effectiveRung: effectiveRung,
    rungName: rungName,
    startWeek: startWeek,
    weekly: weekly,
    applyEffects: applyEffects,
    conditionOK: conditionOK,
    sameCourtshipResidents: sameCourtshipResidents,
    notebook: notebook,
    describeCourtships: describeCourtships,
    coolLine: coolLine,
    isExtracted: isExtracted,
    isFree: isFree,
    trimRite: trimRite,
    markHarm: markHarm,
    extracted: extracted,
    addProgress: addProgress,
    courtshipBetween: courtshipBetween,
    stageOf: stageOf
  };

})();
