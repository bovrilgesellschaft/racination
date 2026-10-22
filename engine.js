/*
  RACINATION — engine.js
  The title screen, the weekly turn, the Matins report, the ledger,
  saving and loading (Milestone 1), the household screens:
  residents, the rota and the weekly reckoning of moods (Milestone 2),
  and the Mistress: her creation screen and her page (Milestone 3).

  Game text lives in the data folder. The household's own rules
  live in household.js. This file holds the turn and the screens.
*/

(function () {
  "use strict";

  var DATA = window.RACINATION_DATA || {};
  var HOUSE = DATA.house;
  var H = window.RACINATION_HOUSEHOLD;
  var MI = window.RACINATION_MISTRESS;
  var EC = window.RACINATION_ECONOMY;
  var RR = window.RACINATION_RULES;
  var DR = window.RACINATION_DRESS;
  var EV = window.RACINATION_EVENTS;
  var IN = window.RACINATION_INTIMACY;
  var SK = window.RACINATION_SCENEKIT;

  var SAVE_KEY = "racination.save.v1";
  var ADULT_KEY = "racination.adult";
  var TESTING_KEY = "racination.testing";
  var SAVE_VERSION = 8;

  var screenEl = document.getElementById("screen");
  var borderEl = document.getElementById("border");
  var fileInput = document.getElementById("import-file");

  if (!HOUSE || !HOUSE.startDate || !H || !MI || !EC || !RR || !DR || !EV || !IN || !SK || !DATA.scenekit || !DATA.consent || !DATA.romanceEvents || !DATA.events || !DATA.letters || !DATA.rules || !DATA.economy || !DATA.appearance || !DATA.wardrobe || !DATA.residents || !DATA.mistress) {
    screenEl.innerHTML = '<p class="warn">One of the game’s files is missing or has a mistake in it, '
      + "so the game cannot start. If you have just edited a file in the data folder, check it for a missing "
      + "comma or quotation mark.</p>";
    return;
  }

  /* ============================================================
     Storage. Every call is guarded: if the browser refuses
     storage, the game still plays and says so.
     ============================================================ */

  var storage = {
    ok: true,
    get: function (key) {
      try { return window.localStorage.getItem(key); }
      catch (e) { storage.ok = false; return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); return true; }
      catch (e) { storage.ok = false; return false; }
    },
    remove: function (key) {
      try { window.localStorage.removeItem(key); return true; }
      catch (e) { storage.ok = false; return false; }
    }
  };

  (function probeStorage() {
    try {
      var k = "racination.probe";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
    } catch (e) {
      storage.ok = false;
    }
  })();

  var testing = storage.get(TESTING_KEY) === "on";

  /* ============================================================
     Dates. All dates are kept in UTC so summer time never
     shifts a week.
     ============================================================ */

  var DAY = 86400000;
  var WEEK = 7 * DAY;
  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function parseISO(s) {
    var p = String(s).split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }

  var START = parseISO(HOUSE.startDate);
  var END = parseISO(HOUSE.endDate);
  var TOTAL_WEEKS = Math.floor((END - START) / WEEK) + 1;

  function mondayOf(week) { return new Date(START + week * WEEK); }
  function sundayOf(week) { return new Date(START + week * WEEK + 6 * DAY); }

  function ordinal(n) {
    var t = n % 100;
    if (t >= 11 && t <= 13) return n + "th";
    switch (n % 10) {
      case 1: return n + "st";
      case 2: return n + "nd";
      case 3: return n + "rd";
      default: return n + "th";
    }
  }

  function longDate(d) {
    return DAYS[d.getUTCDay()] + " the " + ordinal(d.getUTCDate()) + " of "
      + MONTHS[d.getUTCMonth()] + ", " + d.getUTCFullYear();
  }

  function shortDate(d) {
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()].slice(0, 3) + " " + d.getUTCFullYear();
  }

  function isoDate(d) {
    var m = d.getUTCMonth() + 1, day = d.getUTCDate();
    return d.getUTCFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function seasonOf(d) {
    var m = d.getUTCMonth();
    if (m === 11 || m <= 1) return "winter";
    if (m <= 4) return "spring";
    if (m <= 7) return "summer";
    return "autumn";
  }

  function currentSeason() {
    return seasonOf(mondayOf(Math.min(state.week, TOTAL_WEEKS - 1)));
  }

  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ============================================================
     Money. Kept in whole pence so sums never drift.
     ============================================================ */

  function pence(pounds) { return Math.round(Number(pounds || 0) * 100); }

  function money(p) {
    var neg = p < 0;
    var v = Math.abs(p);
    var pounds = Math.floor(v / 100);
    var pp = v % 100;
    var s = String(pounds).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "−" : "") + "£" + s + "." + (pp < 10 ? "0" : "") + pp;
  }

  function moneyHTML(p) {
    return p < 0 ? '<span class="neg">' + money(p) + "</span>" : money(p);
  }

  /* ============================================================
     Chance. A seeded generator, stored in the save, so a run
     plays out the same way after loading.
     ============================================================ */

  function rand() {
    var t = (state.rng = (state.rng + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  H.setRandom(rand);
  IN.setRandom(rand);
  SK.setRandom(rand);

  function pick(list, avoid) {
    if (!list || !list.length) return "";
    if (list.length === 1) return list[0];
    var choice;
    for (var i = 0; i < 6; i++) {
      choice = list[Math.floor(rand() * list.length)];
      if (choice !== avoid) break;
    }
    return choice;
  }

  /* ============================================================
     Game state
     ============================================================ */

  var state = null;       // the current game, or null
  var view = "loading";   // which screen is showing
  var flashMsg = null;    // one-off message under the menu
  var flashBad = false;
  var ledgerYear = null;
  var pendingImport = false;
  var residentId = null;  // which resident's page is open
  var draft = null;       // the Mistress being made on the creation screen

  function newState() {
    var seed = (Math.random() * 4294967296) >>> 0;
    state = {
      game: "Racination",
      version: SAVE_VERSION,
      created: new Date().toISOString(),
      seed: seed,
      rng: seed | 0,
      week: 0,
      phase: "matins",
      money: pence(HOUSE.startingMoney),
      openingMoney: pence(HOUSE.startingMoney),
      ledger: [],
      matinsLine: null,
      reckoningLine: null,
      lastLine: null,
      ended: false,
      residents: [],
      departed: [],
      nextId: 1,
      mistress: null,
      rules: {}
    };
    draft = null;
    addHousehold();
    EC.initHouse(state);
    RR.ensureRules(state);
    DR.ensureDress(state);
    EV.ensureEvents(state);
    IN.ensure(state);
    state.scenes = { current: null };
    return state;
  }

  function addHousehold() {
    state.residents = H.generateHousehold(state.nextId);
    state.nextId += state.residents.length;
  }

  // Bring an older save up to date.
  function upgrade(s) {
    state = s;
    if (s.version < 2) {
      s.residents = [];
      s.departed = [];
      s.nextId = 1;
      addHousehold();
      s.version = 2;
    }
    if (s.version < 3) {
      // Milestone 2 saves have no Mistress yet: the creation screen asks for one.
      s.mistress = null;
      s.rules = {};
      s.version = 3;
    }
    if (s.version < 4 || !s.house) {
      // Before Milestone 4a there were no rooms, Pit or guests.
      EC.initHouse(s);
      s.version = 4;
    }
    if (!s.rules) s.rules = {};
    if (s.version < 5) {
      // Milestone 4b: house rules, the Housekeeper, the Sewing Room and the shops.
      if (s.mistress && !s.rules.dressCode) s.rules.dressCode = s.mistress.dressCode;
      s.version = 5;
    }
    RR.ensureRules(s);
    DR.ensureDress(s);
    EV.ensureEvents(s);
    if (s.version < 6) s.version = 6;
    if (!Array.isArray(s.residents)) s.residents = [];
    // Milestone 6: consent profiles, the Evenings, courtship and the rite.
    IN.ensure(s);
    if (!s.rules.houseWord) s.rules.houseWord = "honoured";
    if (s.version < 7) s.version = 7;
    // Milestone 7: the Scene Kit.
    if (!s.scenes) s.scenes = { current: null };
    if (s.version < 8) s.version = 8;
    if (!Array.isArray(s.departed)) s.departed = [];
    if (typeof s.nextId !== "number") s.nextId = s.residents.length + 1;
    return s;
  }

  function validState(s) {
    return !!s && typeof s === "object"
      && s.game === "Racination"
      && typeof s.version === "number" && s.version >= 1 && s.version <= SAVE_VERSION
      && typeof s.week === "number" && s.week >= 0 && s.week <= TOTAL_WEEKS
      && typeof s.money === "number"
      && typeof s.rng === "number"
      && Array.isArray(s.ledger)
      && typeof s.phase === "string";
  }

  function saveGame() {
    if (!state) return false;
    return storage.set(SAVE_KEY, JSON.stringify(state));
  }

  function loadSaved() {
    var raw = storage.get(SAVE_KEY);
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      return validState(s) ? s : null;
    } catch (e) {
      return null;
    }
  }

  function resident(id) {
    for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === id) return state.residents[i];
    return null;
  }

  /* ============================================================
     The weekly turn
     ============================================================ */

  function ensureMatinsLine() {
    // The week begins: guests arrive, the post comes, the outside world's news.
    if (state.house && state.mistress) {
      var monday = mondayOf(state.week);
      EC.startWeek(state, monday, seasonOf(monday), rand);
      DR.shopsWeek(state, rand).forEach(function (n) { state.house.news.push(n); });
      EV.startWeek(state, monday, seasonOf(monday), rand);
      IN.startWeek(state);
    }
    if (state.matinsLine) return;
    if (state.week === 0 && HOUSE.openingLine) {
      state.matinsLine = HOUSE.openingLine;
    } else {
      var season = seasonOf(mondayOf(state.week));
      var lines = (HOUSE.matinsLines[season] || []).concat(HOUSE.matinsLines.any || []);
      state.matinsLine = pick(lines, state.lastLine);
      // A house that has cooled says so at Matins (Milestone 6).
      var cool = IN.coolLine(state);
      if (cool) state.matinsLine = cool;
    }
    state.lastLine = state.matinsLine;
    saveGame();
  }

  function entryFor(week) {
    for (var i = state.ledger.length - 1; i >= 0; i--) {
      if (state.ledger[i].week === week) return state.ledger[i];
    }
    return null;
  }

  function castUpWeek() {
    if (entryFor(state.week)) return;
    var season = seasonOf(mondayOf(state.week));
    if (state.house.weekOf !== state.week) EC.startWeek(state, mondayOf(state.week), season, rand);

    // The Sewing Room's week comes first: what it does not spend on the house's clothes, it sells.
    var sewingEvents = DR.sewingWeek(state);

    // The week's accounts. Repairs, restorations, cloth and purchases were paid when ordered.
    var lines = EC.weekAccounts(state, season);
    var net = 0;
    lines.forEach(function (l) { net += l.amount; });
    state.money += net;
    lines = lines.concat(state.house.spent || []);
    state.house.spent = [];
    var received = 0, paid = 0;
    lines.forEach(function (l) { if (l.amount > 0) received += l.amount; else paid -= l.amount; });

    // The household's week.
    var events = sewingEvents.slice(), departures = [];
    var dressRule = RR.dressMultipliers(state);
    state.residents.forEach(function (r) {
      var res = H.weekly(r, season, dressRule);
      res.events.forEach(function (e) { events.push(e); });
      if (res.departs) departures.push(r);
    });
    departures.forEach(function (r) {
      var line = H.departureLine(r);
      events.push(line);
      state.departed.push({ id: r.id, name: H.displayName(r), first: r.first, week: state.week, reason: "racinated", line: line });
      state.residents = state.residents.filter(function (x) { return x.id !== r.id; });
    });

    // The house's week: rooms, the Pit, guests' opinion, debt; and how the house touches each woman.
    EC.houseWeek(state, season).forEach(function (e) { events.push(e); });
    EC.residentEffects(state);
    RR.weekly(state, season).forEach(function (e) { events.push(e); });
    DR.wearWeek(state, season).forEach(function (e) { events.push(e); });
    EV.weekly(state);
    IN.weekly(state).forEach(function (e) { events.push(e); });
    EV.takeNotes(state).forEach(function (n) { events.unshift(n.result); });

    var people = state.residents.map(function (r) {
      return {
        id: r.id, name: H.displayName(r),
        racination: Math.round(r.meters.racination), devotion: Math.round(r.meters.devotion), doubt: Math.round(r.meters.doubt),
        dr: r.last.racination, dd: r.last.devotion, db: r.last.doubt
      };
    });

    var mistressWeek = null;
    if (state.mistress) {
      MI.weekly(state.mistress, state.residents, departures.length);
      var mm = state.mistress;
      mistressWeek = {
        name: MI.displayName(mm),
        authority: Math.round(mm.meters.authority), conviction: Math.round(mm.meters.conviction), doubt: Math.round(mm.meters.doubt),
        da: mm.last.authority, dc: mm.last.conviction, dd: mm.last.doubt
      };
    }

    state.ledger.push({
      week: state.week,
      mistress: mistressWeek,
      lines: lines,
      received: received,
      paid: paid,
      balance: state.money,
      people: people,
      events: events,
      departures: departures.map(function (r) { return H.displayName(r); }),
      guests: state.house.guests,
      pit: Math.round(state.house.pit),
      pitChange: state.house.pitLast
    });
    state.reckoningLine = pick(HOUSE.reckoningLines, null);
    state.endReason = state.endReason || EC.endReason(state);
  }

  function goToRota() {
    state.phase = "rota";
    saveGame();
    view = "game";
    render();
  }

  function goToReckoning() {
    castUpWeek();
    state.phase = "reckoning";
    var ok = saveGame();
    if (ok) setFlash("Saved.");
    else setFlash("This browser would not keep the save. Use “Save file” to keep your place.", true);
    view = "game";
    render();
  }

  function nextWeek() {
    if (state.endReason) {
      state.ended = true;
      state.phase = "end";
    } else {
      state.week += 1;
      state.matinsLine = null;
      state.reckoningLine = null;
      if (state.week >= TOTAL_WEEKS) {
        state.ended = true;
        state.endReason = "decade";
        state.phase = "end";
      } else {
        state.phase = "matins";
      }
    }
    saveGame();
    view = "game";
    render();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Save files: export and import
     ============================================================ */

  function exportSave() {
    if (!state) return;
    var week = Math.min(state.week, TOTAL_WEEKS - 1);
    var name = "racination-" + isoDate(mondayOf(week)) + ".json";
    var payload = {
      file: "Racination save",
      exported: new Date().toISOString(),
      state: state
    };
    try {
      var blob = new Blob([JSON.stringify(payload, null, 1)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1500);
      setFlash("Saved to a file: " + name);
    } catch (e) {
      setFlash("The save file could not be made in this browser.", true);
    }
    render();
  }

  function startImport() {
    pendingImport = true;
    fileInput.value = "";
    fileInput.click();
  }

  fileInput.addEventListener("change", function () {
    if (!pendingImport) return;
    pendingImport = false;
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var obj = null;
      try { obj = JSON.parse(String(reader.result)); } catch (e) { obj = null; }
      var s = obj && obj.state ? obj.state : obj;
      if (!validState(s)) {
        setFlash("That file is not a Racination save, or comes from a newer version of the game.", true);
        render();
        return;
      }
      state = upgrade(s);
      var ok = saveGame();
      view = "game";
      setFlash(ok ? "Save file loaded." : "Save file loaded, but this browser will not keep it. Use “Save file” before you close.", !ok);
      render();
      window.scrollTo(0, 0);
    };
    reader.onerror = function () {
      setFlash("That file could not be read.", true);
      render();
    };
    reader.readAsText(file);
  });

  /* ============================================================
     Drawing the screens
     ============================================================ */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Fill the Mistress's tokens, {mistress.name} and the rest, in any text.
  // Anything shown through T also unlocks glossary terms the first time they are met.
  function T(text) {
    var out = state && state.mistress ? MI.fillTokens(text, state.mistress) : text;
    if (state && state.events) EV.hear(state, out);
    return out;
  }

  function setFlash(msg, bad) {
    flashMsg = msg;
    flashBad = !!bad;
  }

  function takeFlash() {
    if (!flashMsg) return "";
    var html = '<p class="flash' + (flashBad ? " bad" : "") + '" role="status">' + esc(flashMsg) + "</p>";
    flashMsg = null;
    flashBad = false;
    return html;
  }

  function storageWarning() {
    if (storage.ok) return "";
    return '<p class="warn">This browser is not letting the game keep saves. You can still play: '
      + 'use “Save file” to keep your place and “Load file” to return to it.</p>';
  }

  function statusBar() {
    var w = Math.min(state.week, TOTAL_WEEKS - 1);
    var d = mondayOf(w);
    var weekText = state.ended ? "The run is over" : "Week " + (state.week + 1) + " of " + TOTAL_WEEKS;
    return '<div class="status"><span class="house">' + esc(HOUSE.name) + "</span>"
      + "<span>" + weekText + "</span>"
      + "<span>" + shortDate(d) + " · " + capital(seasonOf(d)) + "</span>"
      + "<span>" + state.residents.length + " in the house</span>"
      + (state.house ? '<span class="pit-status">Pit ' + Math.round(state.house.pit) + "</span>" : "")
      + "<span>" + moneyHTML(state.money) + "</span></div>"
      + '<nav class="menu" aria-label="Game menu">'
      + (view !== "game" ? '<button data-act="back">The week</button>' : "")
      + (state.mistress ? '<button data-act="mistress">Mistress</button>' : "")
      + '<button data-act="household">Household</button>'
      + (state.romance ? '<button data-act="bonds">Bonds</button>' : "")
      + '<button data-act="settings">Settings</button>'
      + (state.house ? '<button data-act="house">House</button>' : "")
      + (state.house ? '<button data-act="rules">Rules</button>' : "")
      + (state.house ? '<button data-act="wardrobe">Wardrobe</button>' : "")
      + '<button data-act="ledger">Ledger</button>'
      + (state.events ? '<button data-act="glossary">Glossary (' + state.events.glossary.length + ")</button>" : "")
      + '<button data-act="export">Save file</button>'
      + '<button data-act="import">Load file</button>'
      + '<button data-act="title">Title</button>'
      + "</nav>";
  }

  function viewLoading(stage) {
    var art = "";
    if (stage >= 2) art = titleArt();
    return '<div class="loading" data-act="skip-load">'
      + '<p class="prog">Program: RACINATION</p>'
      + (stage >= 2 ? '<p class="prog">Bytes: HESPERIS</p>' : "")
      + art
      + '<p class="hint small">Tap or press any key to skip the tape.</p>'
      + "</div>";
  }

  function titleArt() {
    var word = "RACINATION".split("");
    var inks = ["ink-red", "ink-yellow", "ink-cyan", "ink-magenta", "ink-green",
                "ink-white", "ink-yellow", "ink-cyan", "ink-red", "ink-magenta"];
    var papers = ["paper-black", "paper-blue", "paper-black", "paper-black", "paper-blue",
                  "paper-red", "paper-black", "paper-blue", "paper-black", "paper-black"];
    var letters = word.map(function (ch, i) {
      return '<span class="' + inks[i] + " " + papers[i] + '">' + ch + "</span>";
    }).join("");
    return '<div class="title-art">'
      + '<h1 class="title-word" aria-label="Racination">' + letters + "</h1>"
      + '<p class="title-sub">A household-management game of devotion, discipline and the Pit, 1983–1989</p>'
      + '<p class="title-credit small">© 1983 Hesperis House Software</p>'
      + "</div>";
  }

  function viewAdult() {
    return titleArt()
      + '<div class="body">'
      + '<h2 class="band">For adults only</h2>'
      + '<div class="pane">'
      + "<p>Racination is a game for adults aged 18 and over. It deals with erotic themes, ritual discipline "
      + "and religion, mostly by suggestion and consequence.</p>"
      + "<p>Please confirm your age to continue.</p>"
      + "</div>"
      + '<div class="actions">'
      + '<button class="primary" data-act="adult-yes">I am 18 or over</button>'
      + '<button data-act="adult-no">I am not</button>'
      + "</div></div>";
  }

  function viewLeft() {
    return titleArt()
      + '<div class="body"><div class="pane" style="border-top:3px double var(--blue);margin-top:1em">'
      + "<p>Racination is for adults only. You can close this page.</p>"
      + "</div></div>";
  }

  function viewTitle() {
    var saved = loadSaved();
    var savedNote = "";
    if (saved) {
      var w = Math.min(saved.week, TOTAL_WEEKS - 1);
      savedNote = saved.ended
        ? "A finished run is kept: the house as it stood in December 1989."
        : "A game in progress is kept: week " + (saved.week + 1) + ", " + longDate(mondayOf(w)) + ".";
    }
    return titleArt()
      + takeFlash()
      + '<div class="body">'
      + storageWarning()
      + '<div class="actions stack">'
      + (saved ? '<button class="primary" data-act="continue" data-primary>Continue</button>' : "")
      + '<button ' + (saved ? "" : 'class="primary" data-primary ') + 'data-act="new">New game</button>'
      + '<button data-act="import">Load a save file</button>'
      + "</div>"
      + (saved ? '<p class="note small">' + esc(savedNote) + "</p>" : "")
      + '<p class="small"><button class="tiny" data-act="settings">Settings</button> <button class="tiny" data-act="testing">Testing tools: ' + (testing ? "on" : "off") + "</button></p>"
      + "</div>";
  }

  function viewConfirmNew() {
    var saved = loadSaved();
    var w = saved ? Math.min(saved.week, TOTAL_WEEKS - 1) : 0;
    return titleArt()
      + '<div class="body">'
      + '<h2 class="band">Begin anew?</h2>'
      + '<div class="pane"><p>Starting a new game replaces the one already kept'
      + (saved ? " (week " + (saved.week + 1) + ", " + esc(shortDate(mondayOf(w))) + ")" : "")
      + ". If you want to keep it, save it to a file first.</p></div>"
      + '<div class="actions">'
      + '<button class="danger" data-act="new-confirm">Begin anew</button>'
      + '<button data-act="export-saved">Save it to a file first</button>'
      + '<button data-act="title" data-primary>Back</button>'
      + "</div></div>";
  }

  /* ---------- Small pieces for the household screens ---------- */

  function polarityTag(r) {
    return '<span class="tag ' + r.polarity + '">' + esc(H.polarities[r.polarity].label) + "</span>";
  }

  function delta(v) {
    var n = Math.round(v * 10) / 10;
    if (Math.abs(n) < 0.5) return '<span class="d0">±0</span>';
    var r = Math.round(n);
    return r > 0 ? '<span class="dup">+' + r + "</span>" : '<span class="ddown">−' + Math.abs(r) + "</span>";
  }

  function meter(label, value, change, kind) {
    var v = Math.round(value);
    return '<div class="meter ' + kind + '"><span class="mlabel">' + label + '</span>'
      + '<span class="mbar" aria-hidden="true"><span style="width:' + v + '%"></span></span>'
      + '<span class="mval">' + v + (change != null ? " " + delta(change) : "") + "</span></div>";
  }

  function meters(r, showChange) {
    return meter("Racination", r.meters.racination, showChange ? r.last.racination : null, "rac")
      + meter("Devotion", r.meters.devotion, showChange ? r.last.devotion : null, "dev")
      + meter("Doubt", r.meters.doubt, showChange ? r.last.doubt : null, "dbt");
  }

  function residentLink(r) {
    return '<button class="link" data-act="resident" data-id="' + r.id + '">' + esc(H.displayName(r)) + "</button>";
  }

  /* ---------- The week ---------- */

  function viewMatins() {
    ensureMatinsLine();
    var d = mondayOf(state.week);
    var last = state.week > 0 ? entryFor(state.week - 1) : null;
    var report = matinsLedger(last);

    var moods = "<p>" + esc(T(H.householdMood(state.residents))) + "</p>";
    if (last && last.people && last.people.length) {
      var present = last.people.filter(function (p) { return resident(p.id); });
      var up = present.slice().sort(function (a, b) { return b.dr - a.dr; })[0];
      var down = present.slice().sort(function (a, b) { return a.dr - b.dr; })[0];
      var doubter = present.slice().sort(function (a, b) { return b.db - a.db; })[0];
      var L = H.lines;
      var notes = [];
      if (up && up.dr >= 1) notes.push(L.riseLine.replace("{name}", up.name));
      if (down && down.dr <= -1) notes.push(L.fallLine.replace("{name}", down.name));
      if (doubter && doubter.db >= 1.5) notes.push(L.doubtLine.replace("{name}", doubter.name));
      if (notes.length) moods += "<p>" + esc(notes.join(" ")) + "</p>";
    }
    if (!state.residents.length) moods = "<p>The house is empty. Every woman in it has gone out racinated, and the rooms are very quiet.</p>";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band">Matins</h2>'
      + '<p class="dateline">' + esc(longDate(d)) + "</p>"
      + '<div class="pane"><p>' + esc(T(state.matinsLine)) + "</p>"
      + (state.house && state.house.news && state.house.news.length
        ? state.house.news.map(function (n) { return '<p class="news">' + esc(T(n)) + "</p>"; }).join("") : "")
      + (MI.inCrisis(state.mistress) ? '<p class="note">' + esc(T(H.helpers.fixedPick(MI.data.crisisLines, "c" + state.week))) + "</p>" : "")
      + "</div>"
      + '<h2 class="band blue">' + esc(reportTitle()) + "</h2>"
      + '<div class="pane">' + report + moods + housekeeperNotes() + "</div>"
      + postSection()
      + (EV.unanswered(state, "letter").length
        ? '<div class="actions"><button class="primary" disabled>Answer the post first</button>'
        : '<div class="actions"><button class="primary" data-act="to-rota" data-primary>To the rota board</button>')
      + '<button data-act="household">See the household</button></div>'
      + "</div>";
  }

  function dutySelect(r) {
    var opts = H.duties().map(function (d) {
      var why = H.ineligible(r, d);
      return '<option value="' + d.id + '"' + (r.duty === d.id ? " selected" : "") + (why ? " disabled" : "") + ">"
        + esc(d.name) + (why ? " (" + esc(why) + ")" : "") + "</option>";
    }).join("");
    return '<select class="duty" data-id="' + r.id + '" aria-label="Duty for ' + esc(H.displayName(r)) + '">' + opts + "</select>";
  }

  function viewRota() {
    var d = mondayOf(state.week);
    var rows = state.residents.map(function (r) {
      var du = H.duty(r.duty);
      var skill = du.skill ? H.skillNames[du.skill] + " " + (r.skills[du.skill] || 0) : "";
      var liked = H.desire(r.desire).likes.indexOf(r.duty) >= 0;
      return '<div class="rota-row">'
        + '<div class="rota-who">' + residentLink(r) + " " + polarityTag(r) + "</div>"
        + '<div class="rota-duty">' + dutySelect(r)
        + '<span class="small note">' + esc(skill) + (liked ? " · suits her" : "") + "</span></div>"
        + "</div>";
    }).join("");
    var counts = {};
    state.residents.forEach(function (r) { counts[r.duty] = (counts[r.duty] || 0) + 1; });
    var summary = H.duties().filter(function (du) { return counts[du.id]; })
      .map(function (du) { return esc(du.name) + " " + counts[du.id]; }).join(" · ");
    var notes = H.duties().map(function (du) {
      return "<li><strong>" + esc(du.name) + "</strong>: " + esc(du.note) + "</li>";
    }).join("");

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The Rota</h2>'
      + '<p class="dateline">Week of ' + esc(longDate(d)) + "</p>"
      + '<div class="pane">'
      + (state.residents.length ? rows : "<p>" + esc(HOUSE.rotaPlaceholder) + "</p>")
      + (summary ? '<p class="small note">' + summary + "</p>" : "")
      + "</div>"
      + '<details class="pane notes"><summary>About the duties</summary><ul>' + notes + "</ul></details>"
      + '<div class="actions"><button class="primary" data-act="from-rota" data-primary>On to the evenings</button></div>'
      + "</div>";
  }

  function viewReckoning() {
    var e = entryFor(state.week);
    var d = sundayOf(state.week);
    var last = state.week >= TOTAL_WEEKS - 1;
    var rows = e.lines.map(function (l) {
      return "<tr><td>" + esc(l.label) + '</td><td class="num">' + (l.amount > 0 ? money(l.amount) : "")
        + '</td><td class="num">' + (l.amount < 0 ? money(-l.amount) : "") + "</td></tr>";
    }).join("");
    var net = e.received - e.paid;

    var people = (e.people || []).map(function (p) {
      return "<tr><td>" + esc(p.name) + '</td><td class="num">' + p.racination + " " + delta(p.dr)
        + '</td><td class="num">' + p.devotion + " " + delta(p.dd)
        + '</td><td class="num">' + p.doubt + " " + delta(p.db) + "</td></tr>";
    }).join("");
    var events = (e.events || []).map(function (x) { return "<p>" + esc(T(x)) + "</p>"; }).join("");
    if (e.mistress) {
      var em = e.mistress;
      people = '<tr class="mistress-row"><td>' + esc(em.name) + '<br><span class="small">Authority, Conviction, Doubt</span></td><td class="num">' + em.authority + " " + delta(em.da)
        + '</td><td class="num">' + em.conviction + " " + delta(em.dc)
        + '</td><td class="num">' + em.doubt + " " + delta(em.dd) + "</td></tr>" + people;
    }

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band black">Sunday Reckoning</h2>'
      + '<p class="dateline">' + esc(longDate(d)) + "</p>"
      + '<div class="book"><table>'
      + "<thead><tr><th>Particulars</th><th class=\"num\">Received</th><th class=\"num\">Paid</th></tr></thead>"
      + "<tbody>" + rows
      + '<tr class="total"><td>Totals for the week</td><td class="num">' + money(e.received)
      + '</td><td class="num">' + money(e.paid) + "</td></tr>"
      + "</tbody></table></div>"
      + '<div class="pane" style="border-top:3px double var(--blue)">'
      + "<p>" + (net >= 0 ? "The week ends " + money(net) + " to the good." : "The week ends " + money(-net) + " to the bad.")
      + " Carried forward: <strong>" + moneyHTML(e.balance) + "</strong>.</p>"
      + (e.pit != null ? "<p>The Pit stands at " + e.pit + " " + delta(e.pitChange || 0) + ". "
        + (e.guests ? e.guests + (e.guests === 1 ? " paying guest" : " paying guests") + " left this morning." : "") + "</p>" : "")
      + '<p class="note">' + esc(T(state.reckoningLine || "")) + "</p></div>"
      + (people || events ? '<h2 class="band blue">The household’s week</h2>'
        + (events ? '<div class="pane">' + events + "</div>" : "")
        + (people ? '<div class="book' + (events ? "" : '" style="border-top:3px double var(--blue)') + '"><table>'
          + '<thead><tr><th>Resident</th><th class="num">Racination</th><th class="num">Devotion</th><th class="num">Doubt</th></tr></thead>'
          + "<tbody>" + people + "</tbody></table></div>" : "")
        : "")
      + '<div class="actions"><button class="primary" data-act="next-week" data-primary>'
      + (last ? "Close the decade" : "Ring the bell for Monday") + "</button></div>"
      + "</div>";
  }

  function viewEnd() {
    var reason = state.endReason || "decade";
    var ending = EC.data.endings[reason] || EC.data.endings.decade;
    var racinated = state.departed.filter(function (d) { return d.reason === "racinated"; }).length;
    var others = state.departed.length - racinated;
    var gone = (racinated ? "<p>" + racinated + (racinated === 1 ? " woman" : " women") + " left the house racinated.</p>" : "")
      + (others ? "<p>" + others + (others === 1 ? " woman" : " women") + " left for other reasons.</p>" : "");
    var when = reason === "decade" ? sundayOf(TOTAL_WEEKS - 1) : sundayOf(Math.min(state.week, TOTAL_WEEKS - 1));
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band black">' + esc(ending.title) + "</h2>"
      + '<p class="dateline">' + esc(longDate(when)) + "</p>"
      + '<div class="pane"><p>' + esc(T(ending.text)) + "</p>"
      + "<p>Money in hand at the close: <strong>" + moneyHTML(state.money) + "</strong>, against "
      + moneyHTML(state.openingMoney) + " at the start.</p>" + gone
      + '<p class="note small">The proper endings arrive in Milestone 11.</p></div>'
      + '<div class="actions">'
      + '<button data-act="household">The household</button>'
      + '<button data-act="ledger">Read the ledger</button>'
      + '<button data-act="export">Save file</button>'
      + '<button class="primary" data-act="title" data-primary>Title</button>'
      + "</div></div>";
  }

  /* ---------- The Housekeeper's ledger at Matins ---------- */

  function lineAmount(entry, label) {
    if (!entry) return 0;
    var t = 0;
    entry.lines.forEach(function (l) { if (l.label.indexOf(label) === 0) t += l.amount; });
    return t;
  }

  function matinsLedger(last) {
    var hs = state.house;
    var ED = EC.data;
    var rows = [];
    function row(label, value) { rows.push("<tr><td>" + esc(label) + '</td><td class="num">' + value + "</td></tr>"); }
    row("Money in hand", "<strong>" + moneyHTML(state.money) + "</strong>");
    if (last) {
      row("Received last week", money(last.received));
      row("Paid out last week", money(last.paid));
      row("Provisions", money(-lineAmount(last, "Provisions")));
      row("Coal and paraffin", money(-lineAmount(last, "Coal and paraffin")));
    }
    var pw = EC.pitWord(hs.pit);
    var trend = hs.pitLast > 0.4 ? " (rising)" : hs.pitLast < -0.4 ? " (falling)" : "";
    row("The Pit", Math.round(hs.pit) + " · " + esc(pw.word) + esc(trend));
    row("The post", hs.post + (hs.post === 1 ? " letter" : " letters"));
    row("Paying guests this week", hs.guests + " of " + EC.guestCapacity(state) + " rooms");
    var arriving = (state.events && state.events.arrivals) ? state.events.arrivals.length : 0;
    if (arriving) row("Expected to join the house", String(arriving));
    var table = '<div class="book inline-book"><table><tbody>' + rows.join("") + "</tbody></table></div>";

    var notes = [];
    notes.push(pw.line);
    if (hs.guests === 0) notes.push(ED.guestLines.none);
    else if (hs.guests === 1) notes.push(ED.guestLines.one);
    else notes.push(ED.guestLines.some.replace("{n}", hs.guests));
    if (hs.guestList && hs.guestList.length) {
      notes.push("In the guest rooms: " + hs.guestList.map(function (g) { return g.name + ", " + g.job + " from " + g.town; }).join("; ") + ".");
    }
    var shabby = EC.shabbyRooms(state);
    if (shabby) notes.push((shabby === 1 ? "One room is" : shabby + " rooms are") + " shabby enough to trouble the household.");
    var html = table + "<p>" + esc(notes.join(" ")) + "</p>";
    if (state.money < 0) {
      var left = Math.max(1, ED.bankruptWeeks - hs.debtWeeks);
      html += '<p class="warn">' + esc(ED.debtWarning.replace("{weeks}", left + (left === 1 ? " week" : " weeks"))) + "</p>";
    }
    return html;
  }

  /* ---------- House rules, the Housekeeper, contributions (Milestone 4b) ---------- */

  function reportTitle() {
    var hk = RR.housekeeper(state);
    return hk ? RR.data.housekeeper.reportTitle.replace("{name}", H.displayName(hk)) : "The Housekeeper’s report";
  }

  function housekeeperNotes() {
    var hk = RR.housekeeper(state);
    if (!hk) return '<p class="note small">' + esc(RR.data.housekeeper.vacancy) + "</p>";
    var w = RR.housekeeperWarning(state);
    return w ? '<p class="warn">' + esc(w) + "</p>" : "";
  }

  function viewRules() {
    var m = state.mistress;
    var sections = RR.data.rules.map(function (rule) {
      var cur = RR.current(state, rule.id);
      var opts = rule.options.map(function (o) {
        var isCur = o.id === cur.id;
        var p = RR.previewChange(state, rule.id, o.id);
        var why = RR.canChange(state, rule.id, o.id);
        var detail = isCur ? "In force"
          : "Costs " + p.cost + " Authority"
            + (p.objectors.length ? " · " + p.objectors.length + (p.objectors.length === 1 ? " would object" : " would object") : "")
            + (p.supporters.length ? " · " + p.supporters.length + " would welcome it" : "");
        return '<div class="rule-option' + (isCur ? " current" : "") + '">'
          + '<button data-act="set-rule" data-rule="' + rule.id + '" data-option="' + o.id + '"'
          + (isCur || why ? " disabled" : "") + (why && !isCur ? ' title="' + esc(why) + '"' : "") + ">" + esc(o.label) + "</button>"
          + '<span class="small">' + esc(o.note) + ' <span class="note">' + esc(detail) + "</span></span></div>";
      }).join("");
      return '<fieldset class="create-section"><legend>' + esc(rule.name) + "</legend>"
        + '<p class="small note">' + esc(rule.about) + "</p>" + opts + "</fieldset>";
    }).join("");

    var hk = RR.housekeeper(state);
    var brunettes = state.residents.filter(function (r) { return r.polarity === "brunette"; });
    var hkSection = '<fieldset class="create-section"><legend>The Housekeeper</legend>'
      + (hk ? "<p>" + residentLink(hk) + " keeps the house. Accounts " + (hk.skills.accounts || 0)
        + ", trimming the provisions and coal by " + Math.round(Math.min(RR.data.housekeeper.maxSaving, (hk.skills.accounts || 0) * RR.data.housekeeper.savingPerAccounts) * 100)
        + "%. Her loyalty (Devotion less Doubt): <strong>" + RR.loyalty(hk) + "</strong>.</p>"
        : "<p>The house has no Housekeeper. Appointing one costs " + RR.data.housekeeper.appointCost + " Authority.</p>")
      + (brunettes.length
        ? '<label class="field"><span>Appoint a brunette</span><select id="hk-choice">'
          + brunettes.map(function (r) {
            return '<option value="' + r.id + '"' + (hk && hk.id === r.id ? " selected" : "") + ">" + esc(H.displayName(r))
              + " (Accounts " + (r.skills.accounts || 0) + ", loyalty " + RR.loyalty(r) + ")</option>";
          }).join("") + "</select></label>"
          + '<div class="actions"><button data-act="appoint">Appoint, ' + RR.data.housekeeper.appointCost + " Authority</button></div>"
        : "<p>There is no brunette in the house to appoint.</p>")
      + "</fieldset>";

    var C = RR.data.contributions;
    var ready = RR.contributionsReady(state);
    var contrib = '<fieldset class="create-section"><legend>Contributions</legend>'
      + "<p class=\"small\">Ask the household for " + money(pence(C.perResident)) + " each from their savings: "
      + money(pence(C.perResident * state.residents.length)) + " in all. It costs " + C.authorityCost
      + " Authority and every resident’s goodwill; those with debts resent it most.</p>"
      + '<div class="actions"><button data-act="contributions"' + (ready ? " disabled" : "") + ">Ask for contributions</button></div>"
      + (ready ? '<p class="small note">' + esc(ready) + "</p>" : "")
      + "</fieldset>";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The House Rules</h2>'
      + '<p class="dateline">' + esc(MI.displayName(m)) + " has " + Math.floor(m.meters.authority) + " Authority to spend</p>"
      + '<div class="pane create">' + sections + hkSection + contrib + "</div>"
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  /* ---------- The Wardrobe: Sewing Room and shops (Milestone 4b) ---------- */

  var orderDraft = null;

  function ownersList() {
    var list = [{ id: 0, name: MI.displayName(state.mistress) + " (the Mistress)" }];
    state.residents.forEach(function (r) { list.push({ id: r.id, name: H.displayName(r) }); });
    return list;
  }

  function forSelect(cls, selectedId, mistressOnly) {
    var list = ownersList().filter(function (o) { return !mistressOnly || o.id === 0; });
    return '<select class="' + cls + '" aria-label="For whom">' + list.map(function (o) {
      return '<option value="' + o.id + '"' + (o.id === selectedId ? " selected" : "") + ">" + esc(o.name) + "</option>";
    }).join("") + "</select>";
  }

  function orderDraftNow() {
    var defs;
    if (!orderDraft) orderDraft = { owner: state.residents.length ? state.residents[0].id : 0 };
    if (orderDraft.owner !== 0 && !resident(orderDraft.owner)) orderDraft.owner = 0;
    defs = DR.makeable(orderDraft.owner === 0);
    if (!defs.some(function (d) { return d.id === orderDraft.g; })) orderDraft.g = defs[0].id;
    var def = H.helpers.garmentDef(orderDraft.g);
    var cols = DR.colourChoices(def);
    if (cols.indexOf(orderDraft.colour) < 0) orderDraft.colour = cols[0];
    if ((def.fabrics || []).indexOf(orderDraft.fabric) < 0) orderDraft.fabric = (def.fabrics || [""])[0];
    return orderDraft;
  }

  function garmentLabel(def) {
    return def.name || capital(def.id.replace(/-/g, " "));
  }

  function shopItem(shop, it) {
    var def = H.helpers.garmentDef(it.garment.g);
    var mistressOnly = def && def.mistress;
    return '<div class="shop-item">'
      + "<div>" + esc(capital(H.garmentName(it.garment))) + ' <span class="tag period">' + it.garment.year + "</span> "
      + '<span class="small note">kept ' + Math.round(it.garment.condition) + "%" + (mistressOnly ? ", for the Mistress only" : "") + "</span></div>"
      + '<div class="shop-buy">' + forSelect("for", mistressOnly ? 0 : (state.residents[0] ? state.residents[0].id : 0), mistressOnly)
      + '<button data-act="buy" data-shop="' + shop + '" data-key="' + it.key + '">Buy, ' + money(pence(it.price)) + "</button></div>"
      + "</div>";
  }

  function viewWardrobe() {
    var od = orderDraftNow();
    var def = H.helpers.garmentDef(od.g);
    var cap = DR.capacity(state);
    var seamstresses = state.residents.filter(function (r) { return r.duty === "sewing"; });
    var SH = DR.data.shops;

    var orders = state.sewing.orders.map(function (o) {
      var d = H.helpers.garmentDef(o.g);
      var left = DR.weeksLeft(state, o);
      return '<tr><td>' + esc(capital(o.colour + " " + o.fabric + " " + (d ? (d.name || d.id).toLowerCase() : o.g))) + " for " + esc(DR.ownerName(state, o.owner)) + "</td>"
        + '<td class="num">' + Math.round(o.done / o.work * 100) + "%</td>"
        + '<td class="num">' + (left == null ? "waiting" : left + (left === 1 ? " week" : " weeks")) + "</td>"
        + '<td><button class="tiny" data-act="cancel-order" data-order="' + o.id + '">Cancel</button></td></tr>';
    }).join("");

    var sewing = '<fieldset class="create-section"><legend>The Sewing Room</legend>'
      + "<p class=\"small\">" + (seamstresses.length
        ? seamstresses.map(function (r) { return esc(H.displayName(r)) + " (Needlework " + (r.skills.needlework || 0) + ")"; }).join(", ")
          + (seamstresses.length === 1 ? " works" : " work") + " here, giving " + Math.round(cap * 10) / 10 + " units of work a week."
        : "No one is on the Sewing Room rota, so nothing can be made or mended. Put a resident there on the rota board.") + "</p>"
      + '<p class="small"><button class="tiny" data-act="mend-toggle">Mend first: ' + (state.sewing.mendFirst ? "on" : "off") + "</button> "
      + '<span class="note">When on, the most worn garments in the house are mended before new work.</span></p>'
      + '<div class="grid">'
      + '<label class="field"><span>For</span>' + forSelect("order-field\" data-order-field=\"owner", od.owner, false) + "</label>"
      + '<label class="field"><span>Garment</span><select data-order-field="g">' + DR.makeable(od.owner === 0).map(function (d) {
        return '<option value="' + d.id + '"' + (d.id === od.g ? " selected" : "") + ">" + esc(garmentLabel(d)) + "</option>";
      }).join("") + "</select></label>"
      + '<label class="field"><span>Colour</span><select data-order-field="colour">' + DR.colourChoices(def).map(function (c) {
        return '<option value="' + esc(c) + '"' + (c === od.colour ? " selected" : "") + ">" + esc(capital(c)) + "</option>";
      }).join("") + "</select></label>"
      + '<label class="field"><span>Fabric</span><select data-order-field="fabric">' + (def.fabrics || [""]).map(function (f) {
        return '<option value="' + esc(f) + '"' + (f === od.fabric ? " selected" : "") + ">" + esc(capital(f)) + "</option>";
      }).join("") + "</select></label>"
      + "</div>"
      + '<div class="actions"><button data-act="place-order">Order it: cloth ' + money(pence(DR.clothCost(def, od.fabric))) + ", "
      + DR.data.making.work[def.slot] + " units of work</button></div>"
      + (orders ? '<div class="book inline-book"><table><thead><tr><th>On the cutting table</th><th class="num">Done</th><th class="num">Ready in</th><th></th></tr></thead><tbody>'
        + orders + "</tbody></table></div>" : '<p class="small note">No orders on the cutting table.</p>')
      + "</fieldset>";

    var jumble = state.shops.jumble.map(function (it) { return shopItem("jumble", it); }).join("") || '<p class="small note">Nothing left this week.</p>';
    var dealer = state.shops.dealer.map(function (it) { return shopItem("dealer", it); }).join("") || '<p class="small note">Nothing left this week.</p>';
    var mail = SH.mail.catalogue.map(function (entry, i) {
      var d = H.helpers.garmentDef(entry.g);
      if (!d) return "";
      return '<div class="shop-item"><div>' + esc(garmentLabel(d)) + "</div>"
        + '<div class="shop-buy">' + forSelect("for", state.residents[0] ? state.residents[0].id : 0, false)
        + '<select class="colour" aria-label="Colour">' + DR.colourChoices(d).map(function (c) { return '<option value="' + esc(c) + '">' + esc(capital(c)) + "</option>"; }).join("") + "</select>"
        + '<button data-act="mail" data-index="' + i + '">Order, ' + money(pence(entry.price)) + "</button></div></div>";
    }).join("");
    var parcels = state.shops.deliveries.map(function (dl) {
      return "<li>" + esc(capital(H.garmentName(dl.garment))) + " for " + esc(DR.ownerName(state, dl.owner)) + ", due " + esc(shortDate(mondayOf(Math.min(dl.arrives, TOTAL_WEEKS - 1)))) + "</li>";
    }).join("");

    var shops = '<fieldset class="create-section"><legend>' + esc(SH.jumble.name) + "</legend>"
      + '<p class="small note">' + esc(SH.jumble.about) + "</p>" + jumble + "</fieldset>"
      + '<fieldset class="create-section"><legend>' + esc(SH.mail.name) + "</legend>"
      + '<p class="small note">' + esc(SH.mail.about) + "</p>" + mail
      + (parcels ? '<p class="small"><strong>Parcels on the way:</strong></p><ul class="plain small">' + parcels + "</ul>" : "")
      + "</fieldset>"
      + '<fieldset class="create-section"><legend>' + esc(SH.dealer.name) + "</legend>"
      + '<p class="small note">' + esc(SH.dealer.about) + "</p>" + dealer + "</fieldset>";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The Wardrobe</h2>'
      + '<p class="dateline">The dress code is ' + esc(RR.current(state, "dressCode").label.toLowerCase()) + "</p>"
      + '<div class="pane create">' + sewing + shops + "</div>"
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  /* ---------- Events: the post, the week's business, the glossary (Milestone 5a) ---------- */

  function eventCard(p) {
    var e = EV.byId(p.id);
    if (!e) return "";
    var snap = p.snap || null;
    var text = snap ? snap.text : EV.fillText(state, e.text, p);
    EV.hear(state, text);
    var title = snap ? snap.title : EV.fillText(state, e.title, p);
    var from = snap ? snap.from : (e.from ? EV.fillText(state, e.from, p) : "");
    var body;
    if (p.chosen != null) {
      EV.hear(state, p.result);
      body = '<p class="small note">You chose: ' + esc(snap ? snap.label : EV.fillText(state, e.choices[p.chosen].label, p)) + "</p>"
        + '<p class="event-result">' + esc(p.result) + "</p>";
    } else {
      body = '<div class="event-choices">' + e.choices.map(function (c, i) {
        var why = EV.needsMet(state, p, c);
        return '<button data-act="choose-event" data-key="' + p.key + '" data-index="' + i + '"' + (why ? " disabled" : "") + ">"
          + esc(EV.fillText(state, c.label, p)) + "</button>" + (why ? '<span class="small note">' + esc(why) + "</span>" : "");
      }).join("") + "</div>";
    }
    return '<div class="event-card' + (p.chosen != null ? " answered" : "") + '">'
      + '<h3 class="event-title">' + esc(title) + "</h3>"
      + (from ? '<p class="event-from">From ' + esc(from) + "</p>" : "")
      + "<p>" + esc(text) + "</p>" + body + "</div>";
  }

  function postSection() {
    var letters = EV.pendingFor(state, "letter");
    if (!letters.length) return "";
    return '<h2 class="band magenta">The post</h2>'
      + '<div class="pane">' + letters.map(eventCard).join("") + "</div>";
  }

  function viewBusiness() {
    var items = EV.pendingFor(state, "business").concat(EV.unanswered(state, "letter"));
    var waiting = items.filter(function (p) { return p.chosen == null; }).length;
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The week’s business</h2>'
      + '<p class="dateline">Week of ' + esc(longDate(mondayOf(state.week))) + "</p>"
      + '<div class="pane">' + (items.map(eventCard).join("") || "<p>A quiet week.</p>") + "</div>"
      + '<div class="actions">' + (waiting
        ? '<button class="primary" disabled>Settle the week’s business first</button>'
        : '<button class="primary" data-act="to-reckoning" data-primary>On to Sunday</button>') + "</div>"
      + "</div>";
  }

  function beliefScale() {
    var b = Math.round(state.events.belief);
    var pos = (b + 100) / 2;
    return '<div class="belief"><div class="belief-ends small"><span>Play</span><span>Belief</span></div>'
      + '<div class="belief-bar" aria-hidden="true"><span style="left:' + pos + '%"></span></div>'
      + '<p class="small note">The house: ' + esc(EV.beliefWord(b)) + " (" + (b > 0 ? "+" : "") + b + "). "
      + "Belief lifts Devotion each week; Play eases Doubt.</p></div>";
  }

  function viewGlossary() {
    var terms = EV.glossary(state);
    var rows = terms.map(function (g) {
      return "<dt>" + esc(g.term) + "</dt><dd>" + esc(g.meaning) + "</dd>";
    }).join("");
    var total = (DATA.glossary || []).length;
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band blue">Glossary</h2>'
      + '<p class="dateline">The house’s language: ' + terms.length + " of " + total + " terms heard so far</p>"
      + '<div class="pane">' + (rows ? '<dl class="glossary">' + rows + "</dl>" : "<p>No terms yet. They are added as you meet them.</p>") + "</div>"
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  /* ---------- The Evenings, the rite and the Bonds (Milestone 6) ---------- */

  function eveningSelect(r) {
    var cur = IN.evening(state, r).reg;
    var opts = IN.registerOptions(state, r).map(function (o) {
      return '<option value="' + o.id + '"' + (o.id === cur ? " selected" : "") + (o.why ? " disabled" : "") + ">"
        + esc(o.label) + (o.why ? " (" + esc(o.why) + ")" : "") + "</option>";
    }).join("");
    return '<select class="evening" data-id="' + r.id + '" aria-label="Evening for ' + esc(H.displayName(r)) + '">' + opts + "</select>";
  }

  function personOptions(list, withMistress, selected) {
    var html = list.map(function (r) {
      return '<option value="' + r.id + '"' + (r.id === selected ? " selected" : "") + ">" + esc(H.displayName(r)) + "</option>";
    }).join("");
    if (withMistress && state.mistress) html += '<option value="' + IN.MISTRESS + '">' + esc(MI.displayName(state.mistress)) + " (the Mistress)</option>";
    return html;
  }

  function courtshipList() {
    var list = IN.describeCourtships(state);
    if (!list.length) return "<p>Nobody is courting, and nobody has been seen admiring anyone. Dancing and reading aloud are where it usually begins.</p>";
    return '<ul class="plain">' + list.map(function (c) {
      return "<li><strong>" + esc(c.aName) + "</strong> and <strong>" + esc(c.bName) + "</strong>: " + esc(c.what)
        + (c.same && !c.mistress ? ' <span class="small note">(both ' + esc((resident(c.a) || {}).polarity || "") + "s)</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  function viewEvenings() {
    var C6 = IN.data;
    var open = IN.gatesOpen(state);
    var rows = state.residents.map(function (r) {
      var c = IN.activeCourtship(state, r.id);
      var with_ = c ? (c.a === r.id ? c.b : c.a) : null;
      var who = with_ == null ? "" : (with_ === IN.MISTRESS ? MI.displayName(state.mistress) : (resident(with_) ? H.displayName(resident(with_)) : ""));
      return '<div class="rota-row">'
        + '<div class="rota-who">' + residentLink(r) + " " + polarityTag(r) + "</div>"
        + '<div class="rota-duty">' + eveningSelect(r)
        + (who ? '<span class="small note">' + (c.bonded ? "bonded to " : "courting ") + esc(who) + "</span>" : "") + "</div>"
        + "</div>";
    }).join("");
    var notes = C6.registers.map(function (g) { return "<li><strong>" + esc(g.label) + "</strong>: " + esc(g.note) + "</li>"; }).join("");

    var R = state.romance;
    var rite = R.rite && R.rite.stage !== "done" ? R.rite : null;
    var petitions = R.petitions.map(function (p) {
      var r = resident(p.rid);
      if (!r) return "";
      return '<div class="event-card"><p>' + esc(H.displayName(r)) + " has asked to be put right, for " + esc(p.fault) + ".</p>"
        + '<div class="event-choices"><button data-act="hear-petition" data-id="' + r.id + '"' + (open && !rite ? "" : " disabled") + ">Hear her petition</button></div></div>";
    }).join("");

    var hs = state.house;
    var guests = (hs && hs.guestList || []).map(function (g, i) {
      var interest = IN.guestInterest(state, g);
      var settled = g.rite ? ' <span class="small note">(' + esc({ enjoyed: "kept a rite, and enjoyed it", disliked: "kept a rite, and did not care for it", pressed: "pressed into a rite", declined: "declined" }[g.rite]) + ")</span>" : "";
      return '<div class="rota-row"><div class="rota-who">' + esc(g.name) + ' <span class="small">' + esc(g.job) + ", " + esc(g.town) + "</span>" + settled + "</div>"
        + '<div class="rota-duty"><span class="small note">' + esc(capital(C6.guestInterestWords[interest])) + ".</span>"
        + '<button data-act="guest-rite" data-index="' + i + '"' + (open && !g.rite ? "" : " disabled") + ">Offer the rite</button></div></div>";
    }).join("");

    var eligible = state.residents.filter(function (r) { return IN.isAdult(r); });
    var courtForm = open && eligible.length
      ? '<div class="create"><label class="field"><span>Encourage</span><select id="court-a">' + personOptions(eligible, false) + "</select></label>"
        + '<label class="field"><span>and</span><select id="court-b">' + personOptions(eligible, true, eligible[1] ? eligible[1].id : null) + "</select></label></div>"
        + '<div class="actions"><button data-act="encourage">Encourage a courtship</button></div>'
        + '<p class="small note">Each woman is asked, and may say no; a no is the end of it for now. The Mistress may court a resident herself, but the household will mind, and a woman finds it harder to refuse the Mistress.</p>'
      : "";
    var chargeForm = open && eligible.length
      ? '<div class="create"><label class="field"><span>Bring a charge against</span><select id="charge-who">' + personOptions(eligible, false) + "</select></label>"
        + '<label class="field"><span>for</span><select id="charge-fault">' + C6.faults.map(function (f) { return '<option value="' + esc(f) + '">' + esc(f) + "</option>"; }).join("") + "</select></label></div>"
        + '<div class="actions"><button data-act="bring-charge"' + (rite ? " disabled" : "") + ">Bring the charge</button></div>"
        + '<p class="small note">She may accept the charge, contest it, or withdraw. A withdrawal is always honoured.</p>'
      : "";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The Evenings</h2>'
      + '<p class="dateline">Week of ' + esc(longDate(mondayOf(state.week))) + "</p>"
      + (open ? "" : '<p class="warn">' + esc(C6.closedNote) + "</p>")
      + '<div class="pane">' + (state.residents.length ? rows : "<p>The house is empty.</p>") + "</div>"
      + '<details class="pane notes"><summary>About the evenings</summary><ul>' + notes + "</ul></details>"
      + '<h2 class="band blue">Courtship</h2>'
      + '<div class="pane">' + courtshipList() + courtshipOffers() + courtForm + "</div>"
      + '<h2 class="band black">The rite</h2>'
      + '<div class="pane">'
      + (rite ? '<p>A hearing is open. <button data-act="open-rite">Return to it</button></p>' : "")
      + (petitions || '<p class="small note">No one has petitioned this week.</p>') + chargeForm + "</div>"
      + (guests ? '<h2 class="band magenta">This week’s paying guests</h2><div class="pane">' + guests
        + '<p class="small note">A guest who asked for the rite will usually love it, and say so. A guest who never asked may agree because she cannot think how to refuse.</p></div>' : "")
      + '<div class="actions"><button class="primary" data-act="from-evenings" data-primary>'
      + (EV.pendingFor(state, "business").length ? "On to the week’s business" : "On to Sunday") + "</button></div>"
      + "</div>";
  }

  function viewRite() {
    var R = state.romance;
    var rite = R && R.rite;
    if (!rite) {
      return statusBar() + '<div class="body"><div class="pane"><p>No hearing is open.</p></div>'
        + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div></div>';
    }
    var r = resident(rite.rid);
    var C6 = IN.data;
    var body = "";
    if (rite.stage === "done") {
      body = '<div class="pane"><p>' + esc(T(rite.sceneDone ? (rite.after || "") : rite.text)) + "</p></div>"
        + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the evenings</button></div>';
    } else {
      var lines = rite.lines.map(function (l) { return "<p>" + esc(T(l)) + "</p>"; }).join("");
      if (rite.response === "withdrawn") {
        body = '<div class="pane">' + lines + "</div>"
          + '<div class="actions"><button class="primary" data-act="close-hearing" data-primary>Close the matter</button></div>';
      } else if (rite.response === "contested") {
        body = '<div class="pane">' + lines
          + '<p class="small note">She has not consented. A rite kept against a contested charge is not a rite: it is a harm, and the house will remember it.</p></div>'
          + '<div class="actions"><button class="primary" data-act="close-hearing" data-primary>Let the charge drop</button>'
          + '<button class="danger" data-act="insist-rite">Insist</button></div>';
      } else {
        var hk = state.housekeeper != null && state.housekeeper !== rite.rid ? resident(state.housekeeper) : null;
        var known = r && r.consent.known.measure;
        var measures = C6.measures.map(function (m, i) {
          var over = known && i > r.consent.measure;
          return '<option value="' + m.id + '"' + (m.id === "formal" ? " selected" : "") + ">" + esc(m.label) + ": " + esc(m.note) + (over ? " (beyond her limit)" : "") + "</option>";
        }).join("");
        body = '<div class="pane">' + lines + "</div>"
          + '<div class="pane create">'
          + '<label class="field"><span>Presiding</span><select id="rite-presider"><option value="mistress">' + esc(MI.displayName(state.mistress)) + "</option>"
          + (hk ? '<option value="housekeeper">' + esc(H.displayName(hk)) + " (the Housekeeper)</option>" : "") + "</select></label>"
          + '<label class="field"><span>Measure</span><select id="rite-measure">' + measures + "</select></label>"
          + '<label class="field"><span>Reconciliation</span><select id="rite-reconcile"><option value="private">Private, in the Study</option><option value="public">Public, before Evensong</option></select></label>'
          + '<label class="check"><input type="checkbox" id="rite-aftercare" checked> Sit with her afterwards (aftercare)</label>'
          + '<p class="small note">Her house word is <strong>' + esc(r ? r.consent.houseWord : "") + "</strong>. If she says it, everything stops at once and she is sat with, whatever was chosen above."
          + (known ? (r.consent.measure < 0 ? " She does not want the rite at all." : " She will go as far as " + esc(C6.measures[r.consent.measure].label.toLowerCase()) + ", and no further.")
            : " How far she will go is not yet known; a talk in the Study may tell you.") + "</p>"
          + "</div>"
          + '<div class="actions"><button class="primary" data-act="keep-rite" data-primary>Keep the rite</button>'
          + '<button data-act="close-hearing">Let the matter drop</button></div>';
      }
    }
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band black">' + (rite.petition ? "A petition" : "A hearing") + (r ? ": " + esc(H.displayName(r)) : "") + "</h2>"
      + '<p class="dateline">In the Study, after Evensong</p>'
      + body + "</div>";
  }

  function viewBonds() {
    var R = state.romance;
    var tools = "";
    if (testing) {
      var marks = Object.keys(R.marks).map(function (k) { return k + " " + R.marks[k]; }).join(", ");
      var recs = Object.keys(state.events.records || {}).map(function (k) { return k + " " + state.events.records[k]; }).join(", ");
      tools = '<div class="testing"><p class="small">Testing tools</p>'
        + '<p class="small">Coercion score: ' + Math.round(IN.score(state) * 10) / 10 + " (raw " + Math.round(IN.rawScore(state) * 10) / 10
        + ", credit " + Math.round(R.credit * 10) / 10 + "). Rung: " + esc(IN.rungName(state)) + (R.locked ? " (locked at " + esc(IN.data.rungs[R.locked].name) + ")" : "") + ".</p>"
        + '<p class="small">Marks: ' + esc(marks || "none") + ". Records: " + esc(recs || "none") + ". House-word weeks: " + R.houseWordWeeks
        + ". Isolation weeks: " + ((state.rules && state.rules.isolationWeeks) || 0) + ".</p></div>";
    }
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">Bonds</h2>'
      + '<p class="dateline">Courtships, admirations and bonds in the house</p>'
      + '<div class="pane">' + courtshipList()
      + '<p class="small note">Courtship moves through Admiration, Understanding, Attachment and Devotion. At Devotion a couple may ask to be bonded. '
      + "Two women of the same polarity may court, though more slowly, and a house given to Belief will find it irregular.</p></div>"
      + (IN.gatesOpen(state) ? "" : '<p class="warn">' + esc(IN.data.closedNote) + "</p>")
      + tools
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  function notebookSection(r) {
    if (!r.consent) return "";
    var nb = IN.notebook(state, r);
    var c = IN.activeCourtship(state, r.id);
    var court = "";
    if (c) {
      var other = c.a === r.id ? c.b : c.a;
      var oname = other === IN.MISTRESS ? MI.displayName(state.mistress) : (resident(other) ? H.displayName(resident(other)) : "");
      court = "<p>" + (c.bonded ? "Bonded to " : "Courting ") + esc(oname) + ".</p>";
    }
    var test = testing
      ? '<p class="small">Testing: courtship ' + r.consent.courtship + ", rite " + r.consent.rite + ", measure limit "
        + (r.consent.measure < 0 ? "none" : IN.data.measures[r.consent.measure].id) + ", working " + r.consent.working
        + ", dependency " + IN.dependency(state, r) + ".</p>"
      : "";
    return '<h2 class="band magenta">What the Mistress knows</h2>'
      + '<div class="pane">' + court
      + '<div class="book inline-book"><table><tbody>'
      + nb.rows.map(function (x) { return "<tr><td>" + esc(x.label) + '</td><td>' + esc(x.value) + "</td></tr>"; }).join("")
      + "</tbody></table></div>"
      + nb.notes.map(function (n) { return '<p class="small note">' + esc(n) + "</p>"; }).join("")
      + '<p class="small note">Learned in talks in the Study, and from what she says and does. What she wants is not always what she agrees to.</p>'
      + test + "</div>";
  }

  /* ---------- The Scene Kit: scenes and Settings (Milestone 7) ---------- */

  var settingsFrom = null;

  function courtshipScene(a, b, kind) {
    var c = IN.courtshipBetween(state, a, b);
    if (!c) return false;
    var withM = c.a === IN.MISTRESS || c.b === IN.MISTRESS;
    var partnerId = c.a === IN.MISTRESS ? c.b : c.a;
    var beloved = withM ? { kind: "mistress" } : { kind: "resident", id: partnerId === c.a ? c.b : c.a };
    var reasons = c.reasons || {};
    var free = Object.keys(reasons).every(function (k) { return IN.isFree(reasons[k]); });
    var stage = c.bonded ? "bonded" : String(IN.data.stages[IN.stageOf(c.progress)] || "Admiration").toLowerCase();
    var trigger = kind === "bonding" ? "bonding" : "courtship";
    var ok = SK.start(state, {
      trigger: trigger,
      params: { "with": withM ? "mistress" : "resident", stage: stage, season: currentSeason() },
      cast: { mistress: { kind: "mistress" }, partner: { kind: "resident", id: partnerId }, beloved: beloved },
      free: free, toggle: "romance", after: { kind: trigger, a: c.a, b: c.b }
    });
    if (ok) {
      if (kind === "bonding") c.nightDone = true;
      else c.sceneWeek = state.week;
    }
    return ok;
  }

  function finishScene() {
    var res = SK.finish(state);
    if (!res) { goView("game"); return; }
    SK.applyOutcome(state, res);
    var a = res.after || {};
    if (a.kind === "rite") {
      var rite = state.romance.rite;
      if (rite) {
        rite.sceneDone = true;
        if (res.earlyStop) {
          IN.trimRite(state);
          rite.after = SK.data.stoppedEarly + " " + (rite.after || "");
        }
      }
      saveGame();
      goView("rite");
      return;
    }
    if (a.kind === "guest") setFlash(T(a.text));
    saveGame();
    goView("game");
  }

  function courtshipOffers() {
    if (!IN.gatesOpen(state) || !SK.settings().romance) return "";
    var O = SK.data.offers;
    var rows = state.romance.courtships.filter(function (c) { return c.courting || c.bonded; }).map(function (c) {
      var withM = c.a === IN.MISTRESS || c.b === IN.MISTRESS;
      var aName = c.a === IN.MISTRESS ? MI.displayName(state.mistress) : (resident(c.a) ? H.displayName(resident(c.a)) : "");
      var bName = c.b === IN.MISTRESS ? MI.displayName(state.mistress) : (resident(c.b) ? H.displayName(resident(c.b)) : "");
      var night = c.bonded && c.nightOffered != null && !c.nightDone && state.week - c.nightOffered < (SK.data.offerWeeks || 2);
      var btn;
      if (night) btn = '<button data-act="court-scene" data-kind="bonding" data-a="' + c.a + '" data-b="' + c.b + '">' + esc(O.bonding) + "</button>";
      else btn = '<button data-act="court-scene" data-kind="courtship" data-a="' + c.a + '" data-b="' + c.b + '"'
        + (c.sceneWeek === state.week ? " disabled" : "") + ">" + esc(withM ? O.mistress : O.courtship) + "</button>";
      return '<div class="rota-row"><div class="rota-who">' + esc(aName) + " and " + esc(bName) + "</div>"
        + '<div class="rota-duty">' + btn + "</div></div>";
    }).join("");
    return rows ? '<div class="offers">' + rows + '<p class="small note">One evening a week for each couple.</p></div>' : "";
  }

  function viewScene() {
    var v = SK.view(state);
    if (!v) {
      if (state.scenes) state.scenes.current = null;
      return statusBar() + '<div class="body"><div class="pane"><p>The door is closed.</p></div>'
        + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div></div>';
    }
    var paras = v.paragraphs.map(function (p) { return "<p>" + esc(T(p)) + "</p>"; }).join("");
    var choices = v.choices.map(function (c, i) {
      return '<button data-act="scene-choice" data-index="' + c.index + '"' + (c.stop ? ' class="stop"' : (i === 0 ? ' class="primary" data-primary' : "")) + ">" + esc(c.label) + "</button>";
    }).join("");
    return '<div class="status"><span class="house">' + esc(HOUSE.name) + "</span><span>" + esc(shortDate(mondayOf(Math.min(state.week, TOTAL_WEEKS - 1)))) + "</span></div>"
      + '<div class="body">'
      + '<h2 class="band black">' + esc(T(v.title)) + "</h2>"
      + '<div class="pane scene-pane">' + paras + "</div>"
      + '<div class="actions stack scene-choices">' + choices + "</div>"
      + (testing ? '<p class="small note">Testing: shown at ' + esc(SK.data.tiers[v.tier] ? SK.data.tiers[v.tier].label : v.tier) + (v.fade ? " (fade path)" : "") + ".</p>" : "")
      + "</div>";
  }

  function viewSettings() {
    var st = SK.settings();
    var top = SK.topTier();
    var tiers = SK.TIERS.map(function (t) {
      var d = SK.data.tiers[t];
      var isCur = t === top;
      var locked = t === "author" && !SK.authorAllowed();
      return '<div class="rule-option' + (isCur ? " current" : "") + '">'
        + (locked ? '<button data-act="author-ask">' + esc(d.label) + "</button>"
          : '<button data-act="set-tier" data-tier="' + t + '"' + (isCur ? " disabled" : "") + ">" + esc(d.label) + "</button>")
        + '<span class="small">' + esc(d.note) + (isCur ? ' <span class="note">In use</span>' : "") + (locked ? ' <span class="note">Needs confirming</span>' : "") + "</span></div>";
    }).join("");
    var lib = SK.library();
    var toggles = [["discipline", "Discipline scenes", "Rites play as scenes. Off: a short summary instead."],
                   ["romance", "Romance scenes", "Courtship evenings and bonding nights play as scenes. Off: they happen off the page."]]
      .map(function (x) {
        var on = st[x[0]];
        return '<div class="rule-option' + (on ? " current" : "") + '"><button data-act="toggle" data-toggle="' + x[0] + '">'
          + esc(x[1]) + ": " + (on ? "on" : "off") + '</button><span class="small">' + esc(x[2]) + "</span></div>";
      }).join("");
    return (state ? statusBar() : titleArt()) + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">Settings</h2>'
      + '<p class="dateline">Kept in this browser, for every game</p>'
      + '<div class="pane create">'
      + '<fieldset class="create-section"><legend>Scenes</legend>'
      + '<p class="small note">Each part of a scene shows the highest tier you have chosen that has text, and falls back to the tier below when a part is empty.</p>'
      + tiers
      + (SK.authorAllowed() ? '<div class="actions"><button data-act="author-off">Withdraw the Author confirmation</button></div>' : "")
      + '<p class="small note">' + (lib.authored ? "authored.js is present, with Author text in " + lib.authoredPlaces + (lib.authoredPlaces === 1 ? " place." : " places.")
        : "authored.js is not present, so the Author tier shows Candlelight text.") + "</p>"
      + "</fieldset>"
      + '<fieldset class="create-section"><legend>Content</legend>' + toggles + "</fieldset>"
      + '<fieldset class="create-section"><legend>For the author</legend>'
      + '<p class="small">The preview page reads any scene under any setting without playing a run.</p>'
      + '<div class="actions"><a class="button" href="preview.html" target="_blank" rel="noopener">Open the preview page</a>'
      + '<button data-act="check-scenes">Check the scene files</button></div></fieldset>'
      + "</div>"
      + '<div class="actions"><button class="primary" data-act="settings-back" data-primary>Back</button></div>'
      + "</div>";
  }

  function viewAuthorConfirm() {
    return (state ? statusBar() : titleArt())
      + '<div class="body">'
      + '<h2 class="band black">The Author tier</h2>'
      + '<div class="pane"><p>The Author tier shows text written by the game’s designer and kept in a separate file, authored.js. '
      + "It may be fully explicit. It never plays where a woman’s consent was not freely given, and never once the house has gone wrong.</p>"
      + "<p>Please confirm that you are 18 or over and that you want it switched on. You can switch it off again in Settings.</p></div>"
      + '<div class="actions"><button class="danger" data-act="author-yes">I am 18 or over: switch it on</button>'
      + '<button data-act="settings" data-primary>Back</button></div>'
      + "</div>";
  }

  /* ---------- The house: rooms ---------- */

  function viewHouse() {
    var hs = state.house;
    var ED = EC.data;
    var rows = hs.rooms.map(function (r) {
      var d = EC.roomDef(r.id) || { name: r.id };
      var shabby = r.condition < ED.shabbyBelow;
      var tags = [];
      if (d.guest) tags.push(r.condition >= ED.guestRoomUsableAt ? "guest room" : "guest room, unfit");
      if (shabby) tags.push("shabby");
      if (r.restoring) tags.push("restoring: " + r.restoring + (r.restoring === 1 ? " week" : " weeks"));
      var canRestore = !r.restoring && r.period < 100 && r.id !== "computing";
      return '<div class="room-row">'
        + '<div class="room-name"><strong>' + esc(d.name) + "</strong>"
        + (tags.length ? ' <span class="small note">' + esc(tags.join(" · ")) + "</span>" : "") + "</div>"
        + meter("Period", r.period, null, "per")
        + meter("Condition", r.condition, null, shabby ? "dbt" : "cond")
        + '<div class="room-actions">'
        + '<button data-act="repair" data-room="' + r.id + '"' + (r.condition >= 100 ? " disabled" : "") + ">Repair, "
        + money(pence(EC.repairCost())) + "</button>"
        + (r.id === "computing" ? '<span class="small note">The Computing Room cannot be made period.</span>'
          : '<button data-act="restore" data-room="' + r.id + '"' + (canRestore ? "" : " disabled") + ">Restore, "
            + money(pence(ED.restore.cost)) + ", " + ED.restore.weeks + " weeks</button>")
        + "</div></div>";
    }).join("");

    var avg = Math.round(EC.averagePeriod(state));
    var tenure = EC.owned(state) ? "owned outright by the Mistress (rates of " + money(pence(ED.ownerRates)) + " a week)"
      : "rented (" + money(pence(ED.rent)) + " a week)";
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band blue">The House</h2>'
      + '<p class="dateline">' + esc(HOUSE.name) + ", " + tenure + "</p>"
      + '<div class="pane">'
      + '<div class="book inline-book"><table><tbody>'
      + '<tr><td>Average Period</td><td class="num">' + avg + "</td></tr>"
      + '<tr><td>Guest rooms fit for use</td><td class="num">' + EC.guestCapacity(state) + "</td></tr>"
      + '<tr><td>Reputation with guests</td><td class="num">' + Math.round(hs.reputation) + "</td></tr>"
      + '<tr><td>Shabby rooms</td><td class="num">' + EC.shabbyRooms(state) + "</td></tr>"
      + "</tbody></table></div>"
      + '<p class="small note">Period is how far a room feels from the Pit; Condition is its state of repair. Repairs are paid at once and appear in Sunday’s accounts. '
      + "Shabby rooms raise the Pit and the household’s Doubt. A guest room below " + ED.guestRoomUsableAt + " Condition cannot be let.</p>"
      + "</div>"
      + '<div class="pane rooms">' + rows + "</div>"
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  /* ---------- The household ---------- */

  function viewHousehold() {
    var cards = state.residents.map(function (r) {
      var du = H.duty(r.duty);
      return '<div class="card">'
        + '<div class="card-head">' + residentLink(r) + " " + polarityTag(r) + (state.housekeeper === r.id ? ' <span class="tag hk">Housekeeper</span>' : "") + "</div>"
        + '<p class="small">' + esc(r.first) + ", aged " + r.age + " · " + esc(H.background(r.background).name)
        + " · " + esc(du.name) + "</p>"
        + meters(r, state.week > 0)
        + "</div>";
    }).join("");
    var gone = state.departed.map(function (p) {
      var how = p.reason === "racinated" ? "departed racinated" : "left the house";
      return "<li>" + esc(p.name) + " (" + esc(p.first) + "), " + how + ", " + esc(shortDate(sundayOf(p.week))) + "</li>";
    }).join("");

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band blue">The Household</h2>'
      + '<div class="pane">' + (cards || "<p>The house is empty.</p>") + "</div>"
      + (gone ? '<h2 class="band black">Departed</h2><div class="pane"><ul class="plain">' + gone + "</ul></div>" : "")
      + (testing ? '<div class="testing"><p class="small">Testing tools</p>'
        + '<button data-act="regen">Make a new household</button>'
        + '<label class="field" style="width:100%"><span>Fire an event now</span><select id="fire-choice">'
        + EV.all().map(function (e) { return '<option value="' + esc(e.id) + '">' + esc((e.kind === "letter" ? "Letter: " : (e.kind === "visitor" ? "Visitor: " : "Incident: ")) + e.title) + "</option>"; }).join("")
        + "</select></label>"
        + '<button data-act="fire-event">Fire it</button>'
        + '<button data-act="check-events">Check the event files</button>'
        + '<button data-act="check-scenes">Check the scene files</button></div>' : "")
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  function viewResident() {
    var r = resident(residentId);
    if (!r) { view = "household"; return viewHousehold(); }
    var season = currentSeason();
    var desc = H.describe(r, season);
    var bg = H.background(r.background);
    var des = H.desire(r.desire);
    var du = H.duty(r.duty);
    var worn = H.outfit(r, season);
    var share = Math.round(H.periodShare(worn) * 100);

    var skills = H.skills.map(function (s) {
      var v = r.skills[s] || 0;
      return "<tr><td>" + esc(H.skillNames[s]) + '</td><td class="num">' + v + '</td><td class="pips" aria-hidden="true">'
        + "■■■■■".slice(0, v) + '<span class="off">' + "□□□□□".slice(0, 5 - v) + "</span></td></tr>";
    }).join("");

    var ties = r.ties.length
      ? "<ul class=\"plain\">" + r.ties.map(function (t) { return "<li>" + esc(capital(t.text)) + "</li>"; }).join("") + "</ul>"
      : "<p>None that she speaks of.</p>";

    var wornIds = worn.map(function (g) { return g; });
    var wardrobe = r.wardrobe.map(function (g) {
      var on = wornIds.indexOf(g) >= 0;
      return "<tr" + (on ? ' class="current"' : "") + "><td>" + esc(capital(H.garmentName(g))) + "</td>"
        + '<td><span class="tag ' + (g.era === "period" ? "period" : "pit") + '">' + (g.era === "period" ? g.year : "Pit") + "</span></td>"
        + '<td class="num">' + Math.round(g.condition) + "%</td></tr>";
    }).join("");

    var testingTools = testing
      ? '<div class="testing"><p class="small">Testing tools</p>'
        + '<button data-act="nudge" data-meter="racination" data-by="10">Racination +10</button>'
        + '<button data-act="nudge" data-meter="racination" data-by="-10">−10</button>'
        + '<button data-act="nudge" data-meter="devotion" data-by="10">Devotion +10</button>'
        + '<button data-act="nudge" data-meter="devotion" data-by="-10">−10</button>'
        + '<button data-act="nudge" data-meter="doubt" data-by="10">Doubt +10</button>'
        + '<button data-act="nudge" data-meter="doubt" data-by="-10">−10</button>'
        + '<p class="small">Her secret: ' + esc(r.secret) + "</p></div>"
      : "";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band ' + (r.polarity === "blonde" ? "magenta" : "") + '">' + esc(H.displayName(r)) + "</h2>"
      + '<p class="dateline">' + esc(r.first + " " + r.surname) + " · " + esc(H.polarities[r.polarity].label)
      + " · aged " + r.age + " · " + esc(r.nationality) + "</p>"
      + '<div class="pane">'
      + "<p>" + esc(desc.appearance) + "</p>"
      + "<p>" + esc(desc.dress) + "</p>"
      + "<p>" + esc(desc.expression) + "</p>"
      + "</div>"
      + '<h2 class="band blue">Her state</h2>'
      + '<div class="pane">' + meters(r, state.week > 0)
      + '<p class="small note">Dressed ' + share + "% in the 1930s this week. Mood: " + esc(H.moodOf(r)) + ".</p>"
      + "</div>"
      + notebookSection(r)
      + '<h2 class="band magenta">Her duty</h2>'
      + '<div class="pane">' + dutySelect(r)
      + '<p class="small note">' + esc(du.note) + "</p></div>"
      + '<h2 class="band blue">Her history</h2>'
      + '<div class="pane"><p>' + esc(bg.blurb) + "</p>"
      + "<p><strong>What she wants:</strong> " + esc(des.text) + "</p>"
      + "<p><strong>Ties to the outside world:</strong></p>" + ties
      + '<p class="note small">She keeps something back.</p></div>'
      + '<h2 class="band blue">Her skills</h2>'
      + '<div class="book" style="border-top:3px double var(--blue)"><table><tbody>' + skills + "</tbody></table></div>"
      + '<h2 class="band blue">Her wardrobe</h2>'
      + '<div class="book" style="border-top:3px double var(--blue)"><table>'
      + '<thead><tr><th>Garment</th><th>Date</th><th class="num">Kept</th></tr></thead><tbody>' + wardrobe + "</tbody></table></div>"
      + '<p class="small note">Highlighted: what she is wearing this week. Making, buying and mending arrive in Milestone 4.</p>'
      + '<h2 class="band black">Portrait description</h2>'
      + '<div class="pane"><p class="small note">Plain text for an image generator.</p>'
      + '<textarea class="portrait" id="portrait-text" readonly rows="7">' + esc(H.portrait(r, season)) + "</textarea>"
      + '<div class="actions"><button data-act="copy-portrait">Copy portrait description</button></div></div>'
      + testingTools
      + '<div class="actions"><button class="primary" data-act="household" data-primary>Back to the household</button></div>'
      + "</div>";
  }

  /* ---------- The Mistress: creation ---------- */

  var A = DATA.appearance;

  function getField(obj, path) {
    var parts = path.split(".");
    var v = obj;
    for (var i = 0; i < parts.length; i++) { if (v == null) return ""; v = v[parts[i]]; }
    return v;
  }
  function setField(obj, path, value) {
    var parts = path.split(".");
    var o = obj;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
  }

  function selectField(label, field, options, extra) {
    var cur = String(getField(draft, field));
    var opts = options.map(function (o) {
      return '<option value="' + esc(o.value) + '"' + (String(o.value) === cur ? " selected" : "") + ">" + esc(o.label) + "</option>";
    }).join("");
    return '<label class="field"><span>' + esc(label) + '</span><select data-field="' + field + '">' + opts + "</select>" + (extra || "") + "</label>";
  }

  function textField(label, field, hint) {
    return '<label class="field"><span>' + esc(label) + '</span><input type="text" data-field="' + field + '" value="'
      + esc(getField(draft, field) || "") + '" maxlength="30" autocomplete="off" spellcheck="false">'
      + (hint ? '<span class="small note">' + esc(hint) + "</span>" : "") + "</label>";
  }

  function fromList(list) {
    return list.map(function (o) { return { value: o.text, label: capital(o.text) }; });
  }
  function fromItems(list) {
    return list.map(function (o) { return { value: o.id, label: o.label }; });
  }

  function chooseButton(section, label) {
    return '<button class="tiny" data-act="choose" data-section="' + section + '">' + esc(label || "Choose for me") + "</button>";
  }

  function createSection(title, section, body, buttonLabel) {
    return '<fieldset class="create-section"><legend>' + esc(title) + "</legend>"
      + '<div class="section-tools">' + chooseButton(section, buttonLabel) + "</div>"
      + body + "</fieldset>";
  }

  function previewHTML() {
    var m = MI.preview(draft);
    var season = "winter";
    var desc = MI.describe(m, season);
    var bg = MI.background(draft.background);
    return '<h3 class="preview-head">As the house will see her</h3>'
      + "<p>" + esc(desc.appearance) + "</p>"
      + "<p>" + esc(desc.personal) + "</p>"
      + "<p>" + esc(desc.dress) + "</p>"
      + '<p class="small note">She begins with ' + money(pence(bg.money)) + " in the bank"
      + (state.week > 0 || state.ledger.length ? " (this run is already under way, so the house keeps its own money)" : "")
      + ", Authority " + Math.round(m.meters.authority) + ", Conviction " + Math.round(m.meters.conviction)
      + " and Doubt " + Math.round(m.meters.doubt) + ".</p>"
      + '<h3 class="preview-head">Portrait description</h3>'
      + '<p class="small portrait-preview">' + esc(MI.portrait(m, season)) + "</p>";
  }

  function viewCreate() {
    if (!draft) draft = MI.randomDraft();
    var D = MI.data;
    var ages = [];
    for (var a = D.ages[0]; a <= D.ages[1]; a++) ages.push({ value: a, label: String(a) });
    var st = MI.style(draft.style);
    var bg = MI.background(draft.background);

    var name = createSection("Her name", "name",
      selectField("Title", "title", D.titles.map(function (t) { return { value: t, label: t }; }))
      + textField("First name", "first", "Used by those who know her well.")
      + textField("Surname", "surname"), "Random name");

    var age = createSection("Her age and country", "age",
      selectField("Age", "age", ages)
      + selectField("Nationality", "nationality", D.nationalities.map(function (n) { return { value: n, label: n }; }))
      + '<p class="small note">An older Mistress starts with more Authority. The village gossips more about a younger one.</p>');

    var L = draft.looks;
    var looks = createSection("Her appearance", "looks",
      '<div class="grid">'
      + selectField("Complexion", "looks.skin", fromList(A.skin))
      + selectField("Face", "looks.face", fromList(A.face))
      + selectField("Cheeks", "looks.cheeks", fromList(A.cheeks))
      + selectField("Chin", "looks.chin", fromList(A.chin))
      + selectField("Nose", "looks.nose", fromList(A.nose))
      + selectField("Lips", "looks.lips", fromList(A.lips))
      + selectField("Eye colour", "looks.eyeColour", fromList(A.eyeColour))
      + selectField("Eyes", "looks.eyeShape", fromList(A.eyeShape))
      + selectField("Eyelashes", "looks.eyelashes", fromList(A.eyelashes))
      + selectField("Eyebrows", "looks.eyebrows", fromList(A.eyebrows))
      + selectField("Hair colour", "looks.hairColour", fromList(A.hairColour))
      + selectField("Hair length", "looks.hairLength", fromList(A.hairLength))
      + selectField("Hair style", "looks.hairStyle", fromList(MI.hairStylesFor(L.hairLength)))
      + selectField("Make-up", "looks.makeup", fromList(MI.makeupChoices()))
      + selectField("Height", "looks.height", fromList(A.height))
      + selectField("Build", "looks.physique", fromList(A.physique))
      + "</div>"
      + '<p class="small">Measurements: <strong>' + L.bust + "–" + L.waist + "–" + L.hips + "</strong> "
      + '<button class="tiny" data-act="remeasure">Redraw</button></p>'
      + (A.hairColour.some(function (h) { return h.text === L.hairColour && h.tone === "fair"; })
        ? '<p class="small note">A fair-haired Mistress: the house will have views.</p>' : ""));

    var manner = createSection("Her manner", "manner",
      selectField("Voice", "voice", fromItems(D.voices))
      + selectField("Distinguishing mark", "mark", fromItems(D.marks))
      + selectField("Scent", "scent", fromItems(D.scents))
      + '<p class="small note">A regional voice costs a little standing with snobbish guests (from Milestone 4).</p>');

    var styleS = createSection("Her style within the 1930s", "style",
      selectField("Style", "style", fromItems(D.styles))
      + '<p class="small">' + esc(st.prose) + " The house's dress code begins <strong>" + esc(st.dressCode) + "</strong>.</p>");

    var bgS = createSection("Her background", "background",
      selectField("Background", "background", fromItems(D.backgrounds))
      + '<p class="small">' + esc(bg.blurb) + "</p>"
      + '<p class="small note">Starting money ' + money(pence(bg.money)) + ". Contacts: " + esc(bg.contacts.join("; ")) + ".</p>");

    return (state.mistress ? statusBar() : "") + takeFlash()
      + '<div class="body">'
      + '<h2 class="band black">The Mistress of Hesperis House</h2>'
      + '<p class="dateline">Make the woman who will hold the keys</p>'
      + '<div class="pane create">'
      + '<p class="small">Choose each part yourself, or let the house choose. She is a brunette by temperament, whatever her hair says.</p>'
      + '<div class="actions"><button data-act="choose" data-section="all">Choose everything for me</button></div>'
      + '<div class="create-grid"><div class="create-form">' + name + age + looks + manner + styleS + bgS + "</div>"
      + '<div class="create-preview" id="create-preview">' + previewHTML() + "</div></div>"
      + "</div>"
      + '<div class="actions"><button class="primary" data-act="take-keys">Take up the keys of the house</button></div>'
      + "</div>";
  }

  var NAME_OK = /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ' \-]{0,29}$/;

  function takeKeys() {
    var first = String(draft.first || "").trim();
    var surname = String(draft.surname || "").trim();
    if (!NAME_OK.test(surname)) {
      setFlash("She needs a surname: letters, spaces, hyphens and apostrophes only.", true);
      render(); return;
    }
    if (first && !NAME_OK.test(first)) {
      setFlash("Her first name can only use letters, spaces, hyphens and apostrophes.", true);
      render(); return;
    }
    draft.first = first; draft.surname = surname;
    var m = MI.build(draft);
    state.mistress = m;
    state.rules = state.rules || {};
    state.rules.dressCode = m.dressCode;
    if (state.week === 0 && !state.ledger.length) {
      state.money = pence(MI.background(draft.background).money);
      state.openingMoney = state.money;
    }
    draft = null;
    saveGame();
    setFlash(MI.displayName(m) + " has taken up the keys of " + HOUSE.name + ".");
    goView("game");
  }

  /* ---------- The Mistress: her page ---------- */

  function viewMistress() {
    var m = state.mistress;
    var season = currentSeason();
    var desc = MI.describe(m, season);
    var bg = MI.background(m.background);
    var st = MI.style(m.style);
    var notes = MI.data.meterNotes;
    var worn = H.outfit(m, season);

    var meterRows = meter("Authority", m.meters.authority, state.week > 0 ? m.last.authority : null, "aut")
      + meter("Conviction", m.meters.conviction, state.week > 0 ? m.last.conviction : null, "con")
      + meter("Doubt", m.meters.doubt, state.week > 0 ? m.last.doubt : null, "dbt");

    var skills = H.skills.map(function (s) {
      var v = m.skills[s] || 0;
      return "<tr><td>" + esc(H.skillNames[s]) + '</td><td class="num">' + v + '</td><td class="pips" aria-hidden="true">'
        + "■■■■■".slice(0, v) + '<span class="off">' + "□□□□□".slice(0, 5 - v) + "</span></td></tr>";
    }).join("");

    var wardrobe = m.wardrobe.map(function (g) {
      var on = worn.indexOf(g) >= 0;
      return "<tr" + (on ? ' class="current"' : "") + "><td>" + esc(capital(H.garmentName(g))) + "</td>"
        + '<td><span class="tag period">' + g.year + '</span></td><td class="num">' + Math.round(g.condition) + "%</td></tr>";
    }).join("");

    var gossip = m.gossip >= 66 ? "a great deal" : m.gossip >= 33 ? "a fair amount" : "very little";

    var testingTools = testing
      ? '<div class="testing"><p class="small">Testing tools</p>'
        + ["authority", "conviction", "doubt"].map(function (k) {
          return '<button data-act="nudge" data-who="mistress" data-meter="' + k + '" data-by="10">' + capital(k) + " +10</button>"
            + '<button data-act="nudge" data-who="mistress" data-meter="' + k + '" data-by="-10">−10</button>';
        }).join("")
        + '<button data-act="remake-mistress">Make her again</button></div>'
      : "";

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band">' + esc(MI.displayName(m)) + "</h2>"
      + '<p class="dateline">' + esc((m.first ? m.first + " " : "") + m.surname) + " · Mistress · Brunette · aged " + m.age
      + " · " + esc(m.nationality) + "</p>"
      + '<div class="pane">'
      + '<p class="note">' + esc(desc.opening) + "</p>"
      + "<p>" + esc(desc.appearance) + "</p>"
      + "<p>" + esc(desc.personal) + "</p>"
      + "<p>" + esc(desc.dress) + "</p>"
      + "<p>" + esc(desc.expression) + "</p>"
      + "</div>"
      + '<h2 class="band blue">Her state</h2>'
      + '<div class="pane">' + meterRows
      + '<ul class="plain small note"><li>Authority: ' + esc(notes.authority) + "</li><li>Conviction: " + esc(notes.conviction)
      + "</li><li>Doubt: " + esc(notes.doubt) + "</li></ul>"
      + (MI.inCrisis(m) ? '<p class="warn">Her Doubt has outrun her Conviction for a season.</p>' : "")
      + beliefScale()
      + "</div>"
      + '<h2 class="band blue">Her history</h2>'
      + '<div class="pane"><p>' + esc(bg.blurb) + "</p>"
      + "<p><strong>Contacts:</strong></p><ul class=\"plain\">"
      + m.contacts.map(function (c) { return "<li>" + esc(capital(c)) + "</li>"; }).join("") + "</ul>"
      + "<p><strong>Her style:</strong> " + esc(st.label) + ". The house's dress code is <strong>" + esc(state.rules.dressCode || st.dressCode) + "</strong>.</p>"
      + '<p class="small note">The village talks about her ' + gossip + ".</p></div>"
      + '<h2 class="band blue">Her skills</h2>'
      + '<div class="book" style="border-top:3px double var(--blue)"><table><tbody>' + skills + "</tbody></table></div>"
      + '<h2 class="band blue">Her wardrobe</h2>'
      + '<div class="book" style="border-top:3px double var(--blue)"><table>'
      + '<thead><tr><th>Garment</th><th>Date</th><th class="num">Kept</th></tr></thead><tbody>' + wardrobe + "</tbody></table></div>"
      + '<h2 class="band black">Portrait description</h2>'
      + '<div class="pane"><p class="small note">Plain text for an image generator.</p>'
      + '<textarea class="portrait" id="portrait-text" readonly rows="7">' + esc(MI.portrait(m, season)) + "</textarea>"
      + '<div class="actions"><button data-act="copy-portrait">Copy portrait description</button></div></div>'
      + testingTools
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  /* ---------- The ledger ---------- */

  function viewLedger() {
    var curWeek = Math.min(state.week, TOTAL_WEEKS - 1);
    var firstYear = mondayOf(0).getUTCFullYear();
    var lastYear = sundayOf(TOTAL_WEEKS - 1).getUTCFullYear();
    var curYear = sundayOf(curWeek).getUTCFullYear();
    if (ledgerYear == null) ledgerYear = curYear;

    var yearButtons = "";
    for (var y = firstYear; y <= lastYear; y++) {
      var any = y <= curYear;
      yearButtons += '<button data-act="year" data-year="' + y + '" aria-pressed="' + (y === ledgerYear ? "true" : "false") + '"'
        + (any ? "" : " disabled") + ">" + y + "</button>";
    }

    var rows = "";
    if (ledgerYear === firstYear) {
      rows += '<tr><td>' + esc(shortDate(mondayOf(0))) + '</td><td>Balance brought forward</td><td class="num"></td><td class="num"></td><td class="num">'
        + moneyHTML(state.openingMoney) + "</td></tr>";
    }
    var count = 0;
    state.ledger.forEach(function (e) {
      var sun = sundayOf(e.week);
      if (sun.getUTCFullYear() !== ledgerYear) return;
      count++;
      rows += "<tr" + (e.week === state.week ? ' class="current"' : "") + "><td>" + esc(shortDate(sun))
        + "</td><td>Week " + (e.week + 1) + '</td><td class="num">' + money(e.received)
        + '</td><td class="num">' + money(e.paid) + '</td><td class="num">' + moneyHTML(e.balance) + "</td></tr>";
    });
    if (!count && ledgerYear !== firstYear) {
      rows += '<tr><td colspan="5" class="empty">No weeks have been reckoned in ' + ledgerYear + " yet.</td></tr>";
    }

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band blue">The Ledger</h2>'
      + '<div class="years" role="group" aria-label="Year">' + yearButtons + "</div>"
      + '<div class="book" style="border-top:3px double var(--blue)"><table>'
      + '<thead><tr><th>Week ending</th><th></th><th class="num">Received</th><th class="num">Paid</th><th class="num">Balance</th></tr></thead>'
      + "<tbody>" + rows + "</tbody></table></div>"
      + '<p class="note small">Each week is entered at its Sunday reckoning.</p>'
      + '<div class="actions"><button class="primary" data-act="back" data-primary>Back to the week</button></div>'
      + "</div>";
  }

  function render() {
    var html;
    switch (view) {
      case "loading": html = viewLoading(loadingStage); break;
      case "adult": html = viewAdult(); break;
      case "left": html = viewLeft(); break;
      case "title": html = viewTitle(); break;
      case "confirm-new": html = viewConfirmNew(); break;
      case "ledger": html = viewLedger(); break;
      case "household": html = viewHousehold(); break;
      case "house": html = viewHouse(); break;
      case "glossary": html = viewGlossary(); break;
      case "rules": html = viewRules(); break;
      case "wardrobe": html = viewWardrobe(); break;
      case "resident": html = viewResident(); break;
      case "rite": html = viewRite(); break;
      case "scene": html = viewScene(); break;
      case "settings": html = viewSettings(); break;
      case "author-confirm": html = viewAuthorConfirm(); break;
      case "bonds": html = viewBonds(); break;
      case "mistress": html = state.mistress ? viewMistress() : viewCreate(); break;
      case "game":
        if (!state.mistress) html = viewCreate();
        else if (state.ended || state.phase === "end") html = viewEnd();
        else if (state.phase === "rota") html = viewRota();
        else if (state.phase === "evenings") html = viewEvenings();
        else if (state.phase === "business") html = viewBusiness();
        else if (state.phase === "reckoning" && entryFor(state.week)) html = viewReckoning();
        else { state.phase = "matins"; html = viewMatins(); }
        break;
      default: html = viewTitle();
    }
    screenEl.innerHTML = html;
  }

  /* ============================================================
     The cassette loading sequence
     ============================================================ */

  var loadingStage = 1;
  var loadingTimers = [];

  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  function startLoading() {
    if (reducedMotion()) { finishLoading(); return; }
    view = "loading";
    loadingStage = 1;
    borderEl.className = "pilot";
    render();
    loadingTimers.push(setTimeout(function () {
      loadingStage = 2;
      borderEl.className = "data";
      render();
    }, 1400));
    loadingTimers.push(setTimeout(finishLoading, 3600));
  }

  function finishLoading() {
    loadingTimers.forEach(clearTimeout);
    loadingTimers = [];
    borderEl.className = "";
    view = storage.get(ADULT_KEY) === "yes" ? "title" : "adult";
    render();
  }

  /* ============================================================
     Copying the portrait description
     ============================================================ */

  function copyPortrait() {
    var box = document.getElementById("portrait-text");
    if (!box) return;
    var text = box.value;
    function fallback() {
      try {
        box.focus();
        box.select();
        var ok = document.execCommand && document.execCommand("copy");
        flashAfterCopy(!!ok);
      } catch (e) {
        flashAfterCopy(false);
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flashAfterCopy(true); }, fallback);
      } else {
        fallback();
      }
    } catch (e) {
      fallback();
    }
  }

  function flashAfterCopy(ok) {
    var y = window.scrollY;
    setFlash(ok ? "Portrait description copied." : "Could not copy automatically: the text is selected, so copy it by hand.", !ok);
    render();
    window.scrollTo(0, y);
    if (!ok) {
      var box = document.getElementById("portrait-text");
      if (box) { box.focus(); box.select(); }
    }
  }

  /* ============================================================
     Buttons and keys
     ============================================================ */

  function goView(v) {
    view = v;
    render();
    window.scrollTo(0, 0);
  }

  function act(name, el) {
    switch (name) {
      case "skip-load": if (view === "loading") finishLoading(); break;
      case "adult-yes":
        storage.set(ADULT_KEY, "yes");
        view = "title"; render(); break;
      case "adult-no": view = "left"; render(); break;
      case "testing":
        testing = !testing;
        storage.set(TESTING_KEY, testing ? "on" : "off");
        render(); break;
      case "continue":
        var s = loadSaved();
        if (!s) { setFlash("The kept game could not be read.", true); view = "title"; render(); break; }
        state = upgrade(s);
        saveGame();
        goView("game"); break;
      case "new":
        if (loadSaved()) { view = "confirm-new"; render(); }
        else beginNew();
        break;
      case "new-confirm": beginNew(); break;
      case "export-saved":
        var kept = loadSaved();
        if (kept) { state = upgrade(kept); exportSave(); }
        view = "confirm-new"; render(); break;
      case "import": startImport(); break;
      case "export": exportSave(); break;
      case "title":
        if (state && view !== "confirm-new") saveGame();
        goView("title"); break;
      case "ledger": ledgerYear = null; goView("ledger"); break;
      case "household": goView("household"); break;
      case "resident":
        residentId = Number(el.getAttribute("data-id"));
        goView("resident"); break;
      case "back": goView("game"); break;
      case "year":
        ledgerYear = Number(el.getAttribute("data-year")); render(); break;
      case "to-rota": goToRota(); window.scrollTo(0, 0); break;
      case "to-reckoning": goToReckoning(); window.scrollTo(0, 0); break;
      case "from-rota":
        state.phase = "evenings"; saveGame(); goView("game"); break;
      case "from-evenings":
        if (EV.pendingFor(state, "business").length) { state.phase = "business"; saveGame(); goView("game"); }
        else { goToReckoning(); window.scrollTo(0, 0); }
        break;
      case "bonds": goView("bonds"); break;
      case "encourage":
        var ca = document.getElementById("court-a"), cb = document.getElementById("court-b");
        if (ca && cb) {
          var en = IN.encourage(state, Number(ca.value), Number(cb.value));
          if (!en.ok) setFlash(en.why, true);
          else { saveGame(); setFlash(T(en.text), !en.yes); }
        }
        rerenderKeepingPlace(); break;
      case "hear-petition":
        var hp = IN.startHearing(state, Number(el.getAttribute("data-id")), "", true);
        if (!hp.ok) { setFlash(hp.why, true); rerenderKeepingPlace(); }
        else { saveGame(); goView("rite"); }
        break;
      case "bring-charge":
        var cw = document.getElementById("charge-who"), cf = document.getElementById("charge-fault");
        if (cw && cf) {
          var bc = IN.startHearing(state, Number(cw.value), cf.value, false);
          if (!bc.ok) { setFlash(bc.why, true); rerenderKeepingPlace(); }
          else { saveGame(); goView("rite"); }
        }
        break;
      case "open-rite": goView("rite"); break;
      case "keep-rite":
      case "insist-rite":
        var rp = document.getElementById("rite-presider"), rm = document.getElementById("rite-measure");
        var ra = document.getElementById("rite-aftercare"), rr = document.getElementById("rite-reconcile");
        var kr = IN.keepRite(state, {
          presider: rp ? rp.value : "mistress",
          measure: rm ? rm.value : "formal",
          aftercare: ra ? ra.checked : true,
          reconciliation: rr ? rr.value : "private",
          insist: name === "insist-rite"
        });
        if (!kr.ok) setFlash(kr.why, true);
        else if (kr.scene) {
          var rite0 = state.romance.rite;
          var cast = { mistress: { kind: "mistress" }, partner: { kind: "resident", id: rite0.rid },
            presider: rite0.presider === "housekeeper" && state.housekeeper != null ? { kind: "resident", id: state.housekeeper } : { kind: "mistress" } };
          if (SK.start(state, { trigger: "rite", params: kr.scene.params, cast: cast, free: kr.scene.free, wordAt: kr.scene.wordAt,
            toggle: "discipline", after: { kind: "rite" } })) {
            saveGame(); goView("scene"); break;
          }
        }
        saveGame();
        goView("rite"); break;
      case "close-hearing":
        IN.closeHearing(state);
        saveGame();
        goView("rite"); break;
      case "guest-rite":
        var gr = IN.offerGuestRite(state, Number(el.getAttribute("data-index")));
        if (!gr.ok) setFlash(gr.why, true);
        else if (gr.scene && SK.start(state, { trigger: "guestrite", params: gr.scene.params,
          cast: { mistress: { kind: "mistress" }, guest: { kind: "guest", id: Number(el.getAttribute("data-index")) } },
          free: gr.scene.free, toggle: "discipline", after: { kind: "guest", text: gr.text } })) {
          saveGame(); goView("scene"); break;
        } else { saveGame(); setFlash(gr.text); }
        rerenderKeepingPlace(); break;
      case "court-scene":
        var cs = courtshipScene(Number(el.getAttribute("data-a")), Number(el.getAttribute("data-b")), el.getAttribute("data-kind"));
        if (cs) { saveGame(); goView("scene"); }
        else { setFlash("There is no scene for that evening.", true); rerenderKeepingPlace(); }
        break;
      case "scene-choice":
        SK.choose(state, Number(el.getAttribute("data-index")));
        var run = SK.current(state);
        if (run && run.done) { finishScene(); break; }
        saveGame();
        render(); window.scrollTo(0, 0); break;
      case "settings": settingsFrom = view === "settings" || view === "author-confirm" ? settingsFrom : view; goView("settings"); break;
      case "settings-back": goView(settingsFrom === "title" || !state ? "title" : (settingsFrom || "game")); break;
      case "set-tier":
        var tw = SK.setTier(el.getAttribute("data-tier"));
        if (tw) setFlash(tw, true);
        rerenderKeepingPlace(); break;
      case "author-ask": goView("author-confirm"); break;
      case "author-yes": SK.confirmAuthor(); setFlash("The Author tier is on."); goView("settings"); break;
      case "author-off": SK.revokeAuthor(); setFlash("The Author tier is off, and its confirmation withdrawn."); rerenderKeepingPlace(); break;
      case "toggle":
        var tg = el.getAttribute("data-toggle");
        SK.setToggle(tg, !SK.settings()[tg]);
        rerenderKeepingPlace(); break;
      case "check-scenes":
        var sc = SK.check();
        setFlash(sc.problems.length ? "Problems in the scene files: " + sc.problems.join(" | ") : "The scene files are in order: " + sc.scenes + " scenes, no problems found. " + sc.notes.filter(function (n) { return /authored/.test(n); }).join(" "), !!sc.problems.length);
        rerenderKeepingPlace(); break;
      case "choose-event":
        var ce = EV.choose(state, Number(el.getAttribute("data-key")), Number(el.getAttribute("data-index")), rand);
        if (!ce.ok) setFlash(ce.why, true);
        saveGame();
        rerenderKeepingPlace(); break;
      case "glossary": goView("glossary"); break;
      case "fire-event":
        var fsel = document.getElementById("fire-choice");
        if (fsel) {
          var fmon = mondayOf(Math.min(state.week, TOTAL_WEEKS - 1));
          var fwhy = EV.fire(state, fsel.value, fmon, seasonOf(fmon), rand);
          setFlash(fwhy || "Fired. Letters appear at Matins; visitors and incidents in the week’s business.", !!fwhy);
          saveGame();
        }
        rerenderKeepingPlace(); break;
      case "check-events":
        var probs = EV.check();
        setFlash(probs.length ? "Problems in the event files: " + probs.join(" | ") : "The event files are in order: " + EV.all().length + " events, no problems found.", !!probs.length);
        rerenderKeepingPlace(); break;
      case "next-week": nextWeek(); break;
      case "copy-portrait": copyPortrait(); break;
      case "nudge":
        var r = el.getAttribute("data-who") === "mistress" ? state.mistress : resident(residentId);
        if (r) {
          var m = el.getAttribute("data-meter");
          r.meters[m] = Math.max(0, Math.min(100, r.meters[m] + Number(el.getAttribute("data-by"))));
          saveGame();
          var y = window.scrollY; render(); window.scrollTo(0, y);
        }
        break;
      case "mistress": goView("mistress"); break;
      case "house": goView("house"); break;
      case "rules": goView("rules"); break;
      case "wardrobe": goView("wardrobe"); break;
      case "set-rule":
        var res4 = RR.change(state, el.getAttribute("data-rule"), el.getAttribute("data-option"));
        if (res4.ok) {
          saveGame();
          setFlash("Rule changed. Authority spent: " + res4.cost
            + (res4.objectors ? ". " + res4.objectors + (res4.objectors === 1 ? " resident objects." : " residents object.") : ".")
            + (res4.supporters ? " " + res4.supporters + " welcome it." : ""));
        } else if (res4.why) setFlash(res4.why, true);
        rerenderKeepingPlace(); break;
      case "appoint":
        var sel = document.getElementById("hk-choice");
        var who = sel ? resident(Number(sel.value)) : null;
        var why = RR.appoint(state, who);
        if (why) setFlash(why, true);
        else { saveGame(); setFlash(H.displayName(who) + " is now the Housekeeper."); }
        rerenderKeepingPlace(); break;
      case "contributions":
        var c = RR.askContributions(state);
        if (c.ok) {
          state.money += pence(c.pounds);
          state.house.spent.push({ label: "Contributions from the household", amount: pence(c.pounds) });
          state.house.news.push(c.line);
          saveGame();
          setFlash(T(c.line) + " (" + money(pence(c.pounds)) + ")");
        } else setFlash(c.why, true);
        rerenderKeepingPlace(); break;
      case "mend-toggle":
        state.sewing.mendFirst = !state.sewing.mendFirst;
        saveGame(); rerenderKeepingPlace(); break;
      case "place-order":
        var od = orderDraftNow();
        var po = DR.placeOrder(state, od.owner, od.g, od.colour, od.fabric);
        if (po.ok) { saveGame(); setFlash("Ordered. The cloth cost " + money(pence(po.cost)) + "."); }
        else setFlash(po.why, true);
        rerenderKeepingPlace(); break;
      case "cancel-order":
        DR.cancelOrder(state, Number(el.getAttribute("data-order")));
        saveGame(); setFlash("Order cancelled. The cloth goes into the scrap basket."); rerenderKeepingPlace(); break;
      case "buy":
        var item = el.closest(".shop-item");
        var forSel = item ? item.querySelector("select.for") : null;
        var b = DR.buy(state, el.getAttribute("data-shop"), Number(el.getAttribute("data-key")), forSel ? Number(forSel.value) : -1);
        if (b.ok) { saveGame(); setFlash("Bought for " + money(pence(b.price)) + "." + (b.pit ? (b.pit >= 2 ? " The trip to London brought a good dose of the Pit home." : " The trip brought a little of the Pit home.") : "")); }
        else setFlash(b.why, true);
        rerenderKeepingPlace(); break;
      case "mail":
        var mitem = el.closest(".shop-item");
        var mfor = mitem ? mitem.querySelector("select.for") : null;
        var mcol = mitem ? mitem.querySelector("select.colour") : null;
        var mo = DR.orderByMail(state, Number(el.getAttribute("data-index")), mfor ? Number(mfor.value) : -1, mcol ? mcol.value : "");
        if (mo.ok) { saveGame(); setFlash("Ordered by post for " + money(pence(mo.price)) + ". It will arrive in " + DR.data.shops.mail.weeks + " weeks."); }
        else setFlash(mo.why, true);
        rerenderKeepingPlace(); break;
      case "repair":
        if (EC.repair(state, el.getAttribute("data-room"))) { saveGame(); setFlash("Repaired. The cost goes into this week’s accounts."); }
        rerenderKeepingPlace(); break;
      case "restore":
        if (EC.restore(state, el.getAttribute("data-room"))) { saveGame(); setFlash("The restoration has begun. It will be finished in " + EC.data.restore.weeks + " weeks."); }
        rerenderKeepingPlace(); break;
      case "choose":
        MI.chooseFor(draft, el.getAttribute("data-section"));
        rerenderKeepingPlace(); break;
      case "remeasure":
        MI.remeasure(draft);
        rerenderKeepingPlace(); break;
      case "take-keys": takeKeys(); break;
      case "remake-mistress":
        draft = null;
        state.mistress = null;
        saveGame();
        goView("game"); break;
      case "regen":
        addHousehold();
        saveGame();
        setFlash("A new household has been made (testing).");
        render(); break;
    }
  }

  function rerenderKeepingPlace(focusField) {
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
    if (focusField) {
      var el = screenEl.querySelector('[data-field="' + focusField + '"]');
      if (el) el.focus();
    }
  }

  // The Sewing Room order form.
  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!el || !el.getAttribute || !el.getAttribute("data-order-field") || view !== "wardrobe") return;
    var f = el.getAttribute("data-order-field");
    orderDraftNow();
    orderDraft[f] = f === "owner" ? Number(el.value) : el.value;
    rerenderKeepingPlace();
  });

  // The creation screen: selects redraw the form; typing only refreshes the preview.
  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!draft || !el || !el.getAttribute || !el.getAttribute("data-field") || el.tagName !== "SELECT") return;
    var field = el.getAttribute("data-field");
    var v = el.value;
    if (field === "age") v = Number(v);
    setField(draft, field, v);
    MI.settle(draft, field);
    rerenderKeepingPlace(field);
  });

  document.addEventListener("input", function (ev) {
    var el = ev.target;
    if (!draft || !el || !el.getAttribute || !el.getAttribute("data-field") || el.tagName !== "INPUT") return;
    setField(draft, el.getAttribute("data-field"), el.value);
    var pv = document.getElementById("create-preview");
    if (pv) pv.innerHTML = previewHTML();
  });

  function beginNew() {
    newState();
    saveGame();
    goView("game");
  }

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!el || el.disabled) return;
    act(el.getAttribute("data-act"), el);
  });

  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!el || !el.classList || !el.classList.contains("duty")) return;
    var r = resident(Number(el.getAttribute("data-id")));
    if (!r) return;
    var d = H.duty(el.value);
    if (H.ineligible(r, d)) { render(); return; }
    r.duty = d.id;
    saveGame();
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
  });

  // The Evenings: each woman's register.
  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!el || !el.classList || !el.classList.contains("evening")) return;
    var r = resident(Number(el.getAttribute("data-id")));
    if (!r) return;
    IN.setEvening(state, r, el.value);
    saveGame();
    rerenderKeepingPlace();
  });

  document.addEventListener("keydown", function (ev) {
    if (view === "loading") { finishLoading(); return; }
    if (ev.key !== "Enter") return;
    var active = document.activeElement;
    if (active && active !== document.body && /^(BUTTON|SELECT|TEXTAREA|SUMMARY|INPUT)$/.test(active.tagName)) return;
    var primary = screenEl.querySelector("[data-primary]");
    if (primary) { ev.preventDefault(); primary.click(); }
  });

  /* ============================================================
     Start
     ============================================================ */

  startLoading();

})();
