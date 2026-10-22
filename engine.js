/*
  RACINATION — engine.js
  Milestone 1: the title screen, the weekly turn, the Matins report,
  the ledger, and saving and loading.

  Game text lives in the data folder. This file holds the rules.
*/

(function () {
  "use strict";

  var DATA = window.RACINATION_DATA || {};
  var HOUSE = DATA.house;

  var SAVE_KEY = "racination.save.v1";
  var ADULT_KEY = "racination.adult";
  var SAVE_VERSION = 1;

  var screenEl = document.getElementById("screen");
  var borderEl = document.getElementById("border");
  var fileInput = document.getElementById("import-file");

  if (!HOUSE || !HOUSE.startDate) {
    screenEl.innerHTML = '<p class="warn">The file data/house.js is missing or has a mistake in it, '
      + "so the game cannot start. If you have just edited it, check for a missing comma or quotation mark.</p>";
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

  function newState() {
    var seed = (Math.random() * 4294967296) >>> 0;
    return {
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
      ended: false
    };
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

  /* ============================================================
     The weekly turn
     ============================================================ */

  function ensureMatinsLine() {
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

  function amountFor(item, season) {
    var base = (item.seasons && item.seasons[season] != null) ? item.seasons[season] : item.amount;
    var vary = Number(item.vary) || 0;
    var factor = 1 + (rand() * 2 - 1) * vary;
    return Math.round(pence(base) * factor);
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
    var lines = [];
    var received = 0, paid = 0;

    (HOUSE.income || []).forEach(function (item) {
      var a = amountFor(item, season);
      if (a !== 0) { lines.push({ label: item.label, amount: a }); received += a; }
    });
    (HOUSE.expenses || []).forEach(function (item) {
      var a = amountFor(item, season);
      if (a !== 0) { lines.push({ label: item.label, amount: -a }); paid += a; }
    });

    state.money += received - paid;
    state.ledger.push({
      week: state.week,
      lines: lines,
      received: received,
      paid: paid,
      balance: state.money
    });
    state.reckoningLine = pick(HOUSE.reckoningLines, null);
  }

  function goToRota() {
    state.phase = "rota";
    saveGame();
    render();
  }

  function goToReckoning() {
    castUpWeek();
    state.phase = "reckoning";
    var ok = saveGame();
    if (ok) setFlash("Saved.");
    else setFlash("This browser would not keep the save. Use “Save file” to keep your place.", true);
    render();
  }

  function nextWeek() {
    state.week += 1;
    state.matinsLine = null;
    state.reckoningLine = null;
    if (state.week >= TOTAL_WEEKS) {
      state.ended = true;
      state.phase = "end";
    } else {
      state.phase = "matins";
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
      state = s;
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
      + "<span>" + moneyHTML(state.money) + "</span></div>"
      + '<nav class="menu" aria-label="Game menu">'
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

  function viewMatins() {
    ensureMatinsLine();
    var d = mondayOf(state.week);
    var last = state.week > 0 ? entryFor(state.week - 1) : null;
    var report;
    if (!last) {
      report = "<p>Money in hand: <strong>" + moneyHTML(state.money) + "</strong>.</p>"
        + '<p class="note small">The ledger has been opened today. The rest of the Housekeeper’s report '
        + "(provisions, coal, the post and the household’s moods) will be added as the house fills.</p>";
    } else {
      report = "<p>Last week the house received " + moneyHTML(last.received)
        + " and paid out " + moneyHTML(last.paid) + ".</p>"
        + "<p>Money in hand: <strong>" + moneyHTML(state.money) + "</strong>.</p>";
    }
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band">Matins</h2>'
      + '<p class="dateline">' + esc(longDate(d)) + "</p>"
      + '<div class="pane"><p>' + esc(state.matinsLine) + "</p></div>"
      + '<h2 class="band blue">The Housekeeper’s report</h2>'
      + '<div class="pane">' + report + "</div>"
      + '<div class="actions"><button class="primary" data-act="to-rota" data-primary>To the rota board</button></div>'
      + "</div>";
  }

  function viewRota() {
    var d = mondayOf(state.week);
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band magenta">The Rota</h2>'
      + '<p class="dateline">Week of ' + esc(longDate(d)) + "</p>"
      + '<div class="pane"><p>' + esc(HOUSE.rotaPlaceholder) + "</p>"
      + '<p class="note small">Residents and their duties arrive in Milestone 2.</p></div>'
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
      + '<p class="note">' + esc(state.reckoningLine || "") + "</p></div>"
      + '<div class="actions"><button class="primary" data-act="next-week" data-primary>'
      + (last ? "Close the decade" : "Ring the bell for Monday") + "</button></div>"
      + "</div>";
  }

  function viewEnd() {
    return statusBar() + takeFlash()
      + '<div class="body">'
      + '<h2 class="band black">The End of the Decade</h2>'
      + '<p class="dateline">' + esc(longDate(sundayOf(TOTAL_WEEKS - 1))) + "</p>"
      + '<div class="pane"><p>' + esc(HOUSE.endingPlaceholder) + "</p>"
      + "<p>Money in hand at the close: <strong>" + moneyHTML(state.money) + "</strong>, against "
      + moneyHTML(state.openingMoney) + " in January 1983.</p>"
      + '<p class="note small">The proper endings arrive in Milestone 11.</p></div>'
      + '<div class="actions">'
      + '<button data-act="ledger">Read the ledger</button>'
      + '<button data-act="export">Save file</button>'
      + '<button class="primary" data-act="title" data-primary>Title</button>'
      + "</div></div>";
  }

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
      case "game":
        if (state.ended || state.phase === "end") html = viewEnd();
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
     Buttons and keys
     ============================================================ */

  function act(name, el) {
    switch (name) {
      case "skip-load": if (view === "loading") finishLoading(); break;
      case "adult-yes":
        storage.set(ADULT_KEY, "yes");
        view = "title"; render(); break;
      case "adult-no": view = "left"; render(); break;
      case "continue":
        state = loadSaved();
        if (!state) { setFlash("The kept game could not be read.", true); view = "title"; }
        else view = "game";
        render(); window.scrollTo(0, 0); break;
      case "new":
        if (loadSaved()) { view = "confirm-new"; render(); }
        else beginNew();
        break;
      case "new-confirm": beginNew(); break;
      case "export-saved":
        state = loadSaved();
        exportSave();
        view = "confirm-new"; render(); break;
      case "import": startImport(); break;
      case "export": exportSave(); break;
      case "title":
        if (state && view !== "confirm-new") saveGame();
        view = "title"; render(); window.scrollTo(0, 0); break;
      case "ledger":
        ledgerYear = null; view = "ledger"; render(); window.scrollTo(0, 0); break;
      case "back": view = "game"; render(); window.scrollTo(0, 0); break;
      case "year":
        ledgerYear = Number(el.getAttribute("data-year")); render(); break;
      case "to-rota": goToRota(); window.scrollTo(0, 0); break;
      case "to-reckoning": goToReckoning(); window.scrollTo(0, 0); break;
      case "next-week": nextWeek(); break;
    }
  }

  function beginNew() {
    state = newState();
    saveGame();
    view = "game";
    render();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!el || el.disabled) return;
    act(el.getAttribute("data-act"), el);
  });

  document.addEventListener("keydown", function (ev) {
    if (view === "loading") { finishLoading(); return; }
    if (ev.key !== "Enter") return;
    var active = document.activeElement;
    if (active && active !== document.body && active.tagName === "BUTTON") return;
    var primary = screenEl.querySelector("[data-primary]");
    if (primary) { ev.preventDefault(); primary.click(); }
  });

  /* ============================================================
     Start
     ============================================================ */

  startLoading();

})();
