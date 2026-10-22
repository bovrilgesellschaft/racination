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

  var SAVE_KEY = "racination.save.v1";
  var ADULT_KEY = "racination.adult";
  var TESTING_KEY = "racination.testing";
  var SAVE_VERSION = 4;

  var screenEl = document.getElementById("screen");
  var borderEl = document.getElementById("border");
  var fileInput = document.getElementById("import-file");

  if (!HOUSE || !HOUSE.startDate || !H || !MI || !EC || !DATA.economy || !DATA.appearance || !DATA.wardrobe || !DATA.residents || !DATA.mistress) {
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
    if (!Array.isArray(s.residents)) s.residents = [];
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
    }
    if (state.matinsLine) return;
    if (state.week === 0 && HOUSE.openingLine) {
      state.matinsLine = HOUSE.openingLine;
    } else {
      var season = seasonOf(mondayOf(state.week));
      var lines = (HOUSE.matinsLines[season] || []).concat(HOUSE.matinsLines.any || []);
      state.matinsLine = pick(lines, state.lastLine);
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

    // The week's accounts. Repairs and restorations were paid when ordered.
    var lines = EC.weekAccounts(state, season);
    var net = 0;
    lines.forEach(function (l) { net += l.amount; });
    state.money += net;
    lines = lines.concat(state.house.spent || []);
    state.house.spent = [];
    var received = 0, paid = 0;
    lines.forEach(function (l) { if (l.amount > 0) received += l.amount; else paid -= l.amount; });

    // The household's week.
    var events = [], departures = [];
    state.residents.forEach(function (r) {
      var res = H.weekly(r, season);
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
    state.endReason = EC.endReason(state);
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
  function T(text) {
    return state && state.mistress ? MI.fillTokens(text, state.mistress) : text;
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
      + (state.house ? '<button data-act="house">House</button>' : "")
      + '<button data-act="ledger">Ledger</button>'
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
      + '<p class="small"><button class="tiny" data-act="testing">Testing tools: ' + (testing ? "on" : "off") + "</button></p>"
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
      + '<h2 class="band blue">The Housekeeper’s report</h2>'
      + '<div class="pane">' + report + moods + "</div>"
      + '<div class="actions"><button class="primary" data-act="to-rota" data-primary>To the rota board</button>'
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
      + '<div class="actions"><button class="primary" data-act="to-reckoning" data-primary>On to Sunday</button></div>'
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
    var gone = state.departed.length
      ? "<p>" + state.departed.length + " women left the house racinated.</p>" : "";
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
    var table = '<div class="book inline-book"><table><tbody>' + rows.join("") + "</tbody></table></div>";

    var notes = [];
    notes.push(pw.line);
    if (hs.guests === 0) notes.push(ED.guestLines.none);
    else if (hs.guests === 1) notes.push(ED.guestLines.one);
    else notes.push(ED.guestLines.some.replace("{n}", hs.guests));
    var shabby = EC.shabbyRooms(state);
    if (shabby) notes.push((shabby === 1 ? "One room is" : shabby + " rooms are") + " shabby enough to trouble the household.");
    var html = table + "<p>" + esc(notes.join(" ")) + "</p>";
    if (state.money < 0) {
      var left = Math.max(1, ED.bankruptWeeks - hs.debtWeeks);
      html += '<p class="warn">' + esc(ED.debtWarning.replace("{weeks}", left + (left === 1 ? " week" : " weeks"))) + "</p>";
    }
    return html;
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
        + '<div class="card-head">' + residentLink(r) + " " + polarityTag(r) + "</div>"
        + '<p class="small">' + esc(r.first) + ", aged " + r.age + " · " + esc(H.background(r.background).name)
        + " · " + esc(du.name) + "</p>"
        + meters(r, state.week > 0)
        + "</div>";
    }).join("");
    var gone = state.departed.map(function (p) {
      return "<li>" + esc(p.name) + " (" + esc(p.first) + "), departed racinated, " + esc(shortDate(sundayOf(p.week))) + "</li>";
    }).join("");

    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band blue">The Household</h2>'
      + '<div class="pane">' + (cards || "<p>The house is empty.</p>") + "</div>"
      + (gone ? '<h2 class="band black">Departed</h2><div class="pane"><ul class="plain">' + gone + "</ul></div>" : "")
      + (testing ? '<div class="testing"><p class="small">Testing tools</p>'
        + '<button data-act="regen">Make a new household</button></div>' : "")
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
        + '<td class="num">' + g.condition + "%</td></tr>";
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
        + '<td><span class="tag period">' + g.year + '</span></td><td class="num">' + g.condition + "%</td></tr>";
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
      case "resident": html = viewResident(); break;
      case "mistress": html = state.mistress ? viewMistress() : viewCreate(); break;
      case "game":
        if (!state.mistress) html = viewCreate();
        else if (state.ended || state.phase === "end") html = viewEnd();
        else if (state.phase === "rota") html = viewRota();
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
