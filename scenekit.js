/*
  RACINATION — scenekit.js
  Milestone 7: the Author's Scene Kit (GDD §7.5).

  Reads the scene files (scenes/*.js) and, if it is present, the
  designer's authored.js; checks them; chooses a scene for a moment
  in the game; plays it beat by beat at the right tier; and hands the
  result back.

  THE GATES LIVE HERE AND IN intimacy.js, IN CODE. No scene file and
  no authored text can change them:
    1. Adults only. Every participant is a generated resident, a paying
       guest or the Mistress, aged 24 or over; a scene naming any other
       kind of participant will not load. Text that frames anything
       in terms of school, childhood or youth is withheld, at every tier.
    2. Freely given consent. If any participant's yes was not freely
       given, the scene takes the fade path: Gaslight text only.
    3. No failure state. From the "Diaries" rung no scene plays at all.
    4. The Author tier plays only when switched on in Settings, behind
       an 18+ confirmation, and never on the fade path.
  And the stop route: every beat offers the way to aftercare, and a
  woman's house word always ends a scene in aftercare.
*/

(function () {
  "use strict";

  var D = window.RACINATION_DATA || {};
  var K = D.scenekit;
  if (!K) return;

  var TIERS = ["gaslight", "candlelight", "author"];
  var ROLES = ["mistress", "partner", "beloved", "presider", "guest"];
  var TRIGGERS = ["rite", "guestrite", "courtship", "bonding", "working"];
  var SETTINGS_KEY = "racination.settings";
  var ADULT_KEY = "racination.adult";

  // Gate 1: framing that is never allowed in intimate text, at any tier. Code only.
  var FORBIDDEN = /\b(school\w*|schoolgirls?|pupils?|headmistress\w*|form[- ]mistress|under[- ]?age|teen\w*|child\w*|little girls?|young girls?|minors?|daddy|babyish|nursery|lolita)\b/i;

  var rand = Math.random;
  function setRandom(fn) { rand = fn; }

  /* ============================================================
     Settings (stored in this browser; every call guarded)
     ============================================================ */

  function readStore(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function writeStore(key, v) { try { window.localStorage.setItem(key, v); return true; } catch (e) { return false; } }

  var settings = { tier: "gaslight", authorConfirmed: false, discipline: true, romance: true };
  (function loadSettings() {
    try {
      var s = JSON.parse(readStore(SETTINGS_KEY) || "null");
      if (s && typeof s === "object") {
        if (TIERS.indexOf(s.tier) >= 0) settings.tier = s.tier;
        settings.authorConfirmed = s.authorConfirmed === true;
        settings.discipline = s.discipline !== false;
        settings.romance = s.romance !== false;
      }
    } catch (e) { /* defaults */ }
  })();

  function saveSettings() { return writeStore(SETTINGS_KEY, JSON.stringify(settings)); }
  function getSettings() { return { tier: settings.tier, authorConfirmed: settings.authorConfirmed, discipline: settings.discipline, romance: settings.romance }; }

  // Gate 4: the Author tier needs both the start-up age check and its own confirmation.
  function authorAllowed() { return settings.authorConfirmed && readStore(ADULT_KEY) === "yes"; }

  function setTier(t) {
    if (TIERS.indexOf(t) < 0) return "No such tier.";
    if (t === "author" && !authorAllowed()) return "The Author tier must be confirmed first.";
    settings.tier = t;
    saveSettings();
    return "";
  }
  function confirmAuthor() { settings.authorConfirmed = true; settings.tier = "author"; saveSettings(); }
  function revokeAuthor() { settings.authorConfirmed = false; if (settings.tier === "author") settings.tier = "candlelight"; saveSettings(); }
  function setToggle(name, on) { if (name === "discipline" || name === "romance") { settings[name] = !!on; saveSettings(); } }
  function topTier() {
    if (settings.tier === "author" && authorAllowed()) return "author";
    return settings.tier === "author" ? "candlelight" : settings.tier;
  }

  /* ============================================================
     Reading the files
     ============================================================ */

  function parseTrigger(s) {
    var m = /^\s*([a-z]+)\s*(?:\((.*)\))?\s*$/i.exec(s || "");
    if (!m) return null;
    var params = {};
    if (m[2]) m[2].split(",").forEach(function (p) {
      var kv = p.split("=");
      if (kv.length === 2) params[kv[0].trim()] = kv[1].trim();
    });
    return { name: m[1].toLowerCase(), params: params };
  }

  function parseOutcome(s) {
    var out = {};
    (s || "").split(",").forEach(function (p) {
      var m = /^\s*([a-z]+)\s*([+-]\s*\d+(?:\.\d+)?)\s*$/i.exec(p);
      if (m) out[m[1].toLowerCase()] = Number(m[2].replace(/\s/g, ""));
    });
    return out;
  }

  // One parser for both kinds of file. Returns { scenes: [...], problems: [...] }.
  function parse(text, file) {
    var scenes = [], problems = [];
    var scene = null, beat = null, slot = null;
    var lines = String(text || "").replace(/\r/g, "").split("\n");
    function where(i) { return file + ", line " + (i + 1); }
    function closeSlot() {
      if (beat && slot) beat.slots[slot] = (beat.slots[slot] || "").replace(/^\s+|\s+$/g, "");
      slot = null;
    }
    lines.forEach(function (line, i) {
      var t = line.replace(/\s+$/, "");
      var m;
      if (/^\s*#/.test(t)) return;
      if ((m = /^===\s*scene:\s*([\w-]+)\s*$/.exec(t))) {
        closeSlot();
        scene = { id: m[1], file: file, title: m[1], participants: [], trigger: null, triggerText: "", outcome: {}, room: "", beats: {}, order: [], line: i + 1 };
        scenes.push(scene);
        beat = null;
        return;
      }
      if ((m = /^---\s*beat:\s*([\w-]+)\s*$/.exec(t))) {
        closeSlot();
        if (!scene) { problems.push(where(i) + ": a beat comes before any “=== scene:” line."); return; }
        if (scene.beats[m[1]]) problems.push(where(i) + ": the beat “" + m[1] + "” appears twice in " + scene.id + ".");
        beat = { id: m[1], slots: {}, choices: [], line: i + 1 };
        scene.beats[m[1]] = beat;
        scene.order.push(m[1]);
        return;
      }
      if ((m = /^\s*\[(gaslight|candlelight|author)\]\s*(.*)$/i.exec(t))) {
        closeSlot();
        if (!beat) { problems.push(where(i) + ": a [" + m[1] + "] slot comes before any beat."); return; }
        slot = m[1].toLowerCase();
        beat.slots[slot] = m[2] ? m[2] + "\n" : "";
        return;
      }
      if ((m = /^\s*\*\s*(.*?)\s*->\s*(beat:\s*[\w-]+|aftercare|end)\s*(?:\(\s*if\s+([\w]+)\s*=\s*([\w-]+)\s*\))?\s*$/i.exec(t))) {
        closeSlot();
        if (!beat) { problems.push(where(i) + ": a choice comes before any beat."); return; }
        var to = m[2].toLowerCase().indexOf("beat:") === 0 ? m[2].replace(/^beat:\s*/i, "") : m[2].toLowerCase();
        beat.choices.push({ label: m[1], to: to, cond: m[3] ? { key: m[3], value: m[4] } : null, line: i + 1 });
        return;
      }
      if (/^\s*\*/.test(t)) { problems.push(where(i) + ": this choice could not be read. Choices look like “* Go on -> beat: rite”."); return; }
      if (scene && !beat && (m = /^\s*(title|participants|trigger|outcome|room)\s*:\s*(.*)$/i.exec(t))) {
        var key = m[1].toLowerCase(), val = m[2].trim();
        if (key === "participants") scene.participants = val.split(",").map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
        else if (key === "trigger") { scene.trigger = parseTrigger(val); scene.triggerText = val; }
        else if (key === "outcome") scene.outcome = parseOutcome(val);
        else scene[key] = val;
        return;
      }
      if (slot) { beat.slots[slot] += t + "\n"; return; }
      if (t.trim()) problems.push(where(i) + ": this line is outside any slot, so it will never be shown.");
    });
    closeSlot();
    return { scenes: scenes, problems: problems };
  }

  /* ============================================================
     The library: every scene, with the designer's text attached
     ============================================================ */

  var library = null;

  function load() {
    var files = window.RACINATION_SCENE_FILES || [];
    var list = window.RACINATION_SCENE_LIST || [];
    var lib = { scenes: {}, ids: [], problems: [], notes: [], authored: false, authoredPlaces: 0, missingFiles: [] };
    var loaded = {};
    files.forEach(function (f) {
      loaded[f.file] = true;
      var r = parse(f.text, "scenes/" + f.file);
      r.problems.forEach(function (p) { lib.problems.push(p); });
      r.scenes.forEach(function (s) {
        if (lib.scenes[s.id]) { lib.problems.push("scenes/" + f.file + ": the scene id “" + s.id + "” is used twice."); return; }
        // Author text in a scene file can never play: it belongs in authored.js.
        s.order.forEach(function (b) {
          if (s.beats[b].slots.author != null) {
            lib.problems.push(s.file + ", beat " + b + ": an [author] slot in a scene file will never play. Author text belongs in authored.js.");
            delete s.beats[b].slots.author;
          }
        });
        lib.scenes[s.id] = s;
        lib.ids.push(s.id);
      });
    });
    list.forEach(function (name) {
      if (!loaded[name]) lib.missingFiles.push(name);
    });
    lib.missingFiles.forEach(function (name) {
      lib.problems.push("scenes/" + name + " did not load. Look for a backtick (`) in the text, or a missing last line.");
    });

    // The designer's authored.js, if present.
    var A = window.RACINATION_AUTHORED;
    if (typeof A === "string" && A.trim()) {
      lib.authored = true;
      var ar = parse(A, "authored.js");
      ar.problems.forEach(function (p) { lib.problems.push(p); });
      ar.scenes.forEach(function (as) {
        var target = lib.scenes[as.id];
        as.order.forEach(function (b) {
          var txt = as.beats[b].slots.author;
          if (txt == null || !txt.trim()) return;
          if (!target) { lib.problems.push("authored.js: there is no scene called “" + as.id + "”, so this Author text can never play."); return; }
          var tb = target.beats[b] || (b === "aftercare" ? (target.beats.aftercare = { id: "aftercare", slots: {}, choices: [], line: 0, engine: true }) : null);
          if (!tb) { lib.problems.push("authored.js: the scene “" + as.id + "” has no beat called “" + b + "”, so this Author text can never play."); return; }
          tb.slots.author = txt;
          lib.authoredPlaces++;
        });
        ["gaslight", "candlelight"].forEach(function (tier) {
          as.order.forEach(function (b) {
            if (as.beats[b].slots[tier] != null) lib.problems.push("authored.js, " + as.id + "/" + b + ": a [" + tier + "] slot in authored.js is ignored; only [author] slots are read there.");
          });
        });
      });
    }
    library = lib;
    return lib;
  }

  function lib() { return library || load(); }

  /* ============================================================
     The checker
     ============================================================ */

  function reachable(s) {
    var seen = {};
    var first = s.order[0];
    if (!first) return seen;
    var stack = [first];
    while (stack.length) {
      var b = stack.pop();
      if (seen[b] || !s.beats[b]) continue;
      seen[b] = true;
      s.beats[b].choices.forEach(function (c) { if (c.to !== "end") stack.push(c.to); });
    }
    seen.aftercare = true;   // always reachable through the stop route
    return seen;
  }

  function tokensIn(text) {
    var out = [];
    String(text || "").replace(/\{(\w+)\.?(\w*)\}/g, function (m, a) { out.push(a); return m; });
    return out;
  }

  function check() {
    var L = load();
    var problems = L.problems.slice();
    var notes = [];
    L.ids.forEach(function (id) {
      var s = L.scenes[id];
      var w = s.file + ", scene " + id;
      if (!s.order.length) problems.push(w + ": it has no beats.");
      var bad = s.participants.filter(function (p) { return ROLES.indexOf(p) < 0; });
      if (bad.length) problems.push(w + ": it names “" + bad.join(", ") + "” as participants. Only " + ROLES.join(", ") + " are allowed, so this scene will not load.");
      if (!s.participants.length) problems.push(w + ": it has no participants line.");
      if (!s.trigger) problems.push(w + ": it has no trigger line, so it can never play.");
      else if (TRIGGERS.indexOf(s.trigger.name) < 0) problems.push(w + ": its trigger “" + s.trigger.name + "” is not one the game knows (" + TRIGGERS.join(", ") + ").");
      Object.keys(s.outcome).forEach(function (k) {
        if (["racination", "devotion", "doubt", "bond", "charge"].indexOf(k) < 0) problems.push(w + ": its outcome mentions “" + k + "”, which the game does not know.");
      });
      var reach = reachable(s);
      s.order.forEach(function (b) {
        var bt = s.beats[b];
        var bw = s.file + ", " + id + "/" + b;
        if (!bt.slots.gaslight) problems.push(bw + ": it has no [gaslight] text. Every beat needs it: it is the fade path and the fallback.");
        if (!bt.slots.candlelight) notes.push(bw + ": no [candlelight] text, so Candlelight shows the Gaslight text here.");
        if (!reach[b]) problems.push(bw + ": no choice leads here, so it can never be reached" + (bt.slots.author ? " (and its Author text can never play)" : "") + ".");
        bt.choices.forEach(function (c) {
          if (c.to !== "end" && c.to !== "aftercare" && !s.beats[c.to]) problems.push(bw + ": a choice leads to “" + c.to + "”, which is not a beat in this scene.");
        });
        TIERS.forEach(function (tier) {
          var txt = bt.slots[tier];
          if (!txt) return;
          if (FORBIDDEN.test(txt)) problems.push(bw + " [" + tier + "]: this text uses wording the game does not allow in intimate scenes (school, childhood or youth), so it is withheld.");
          tokensIn(txt).forEach(function (role) {
            if (ROLES.indexOf(role) >= 0 && role !== "mistress" && s.participants.indexOf(role) < 0) problems.push(bw + " [" + tier + "]: it mentions {" + role + "...} but “" + role + "” is not among the participants.");
          });
        });
      });
    });
    if (!L.authored) notes.push("authored.js is not present. The game runs without it.");
    else notes.push("authored.js is present: Author text in " + L.authoredPlaces + (L.authoredPlaces === 1 ? " beat." : " beats."));
    return { problems: problems, notes: notes, scenes: L.ids.length };
  }

  /* ============================================================
     Choosing a scene for a moment
     ============================================================ */

  function sceneOK(s) {
    if (!s.trigger || !s.order.length) return false;
    if (s.participants.some(function (p) { return ROLES.indexOf(p) < 0; })) return false;   // Gate 1: will not load
    return true;
  }

  function find(triggerName, params) {
    var L = lib();
    var best = [], bestScore = -1;
    L.ids.forEach(function (id) {
      var s = L.scenes[id];
      if (!sceneOK(s) || s.trigger.name !== triggerName) return;
      var score = 0;
      for (var k in s.trigger.params) {
        if (params[k] == null || String(params[k]) !== s.trigger.params[k]) return;
        score++;
      }
      if (score > bestScore) { best = [s]; bestScore = score; }
      else if (score === bestScore) best.push(s);
    });
    if (!best.length) return null;
    return best[Math.floor(rand() * best.length)];
  }

  /* ============================================================
     Playing a scene
     ============================================================

     A run is kept in state.scenes.current:
       { scene, beat, cast: {role: {kind, id}}, params, fade, wordAt, steps, stopped, done, after: {...} }
     cast kinds: "resident" (id), "mistress", "guest" (index into this week's guest list).
  */

  var ADULT_AGE = 24;

  function personFor(state, c) {
    if (!c) return null;
    if (c.kind === "mistress") return state.mistress;
    if (c.kind === "guest") return state.house && state.house.guestList ? state.house.guestList[c.id] : null;
    if (c.kind === "resident") {
      for (var i = 0; i < state.residents.length; i++) if (state.residents[i].id === c.id) return state.residents[i];
    }
    return null;
  }

  // Gates 1 and 3, and the toggles. Returns "" or the reason no scene plays.
  function canPlay(state, s, cast, kindToggle) {
    var IN = window.RACINATION_INTIMACY;
    if (IN && !IN.gatesOpen(state)) return "closed";
    if (kindToggle && settings[kindToggle] === false) return "toggled";
    for (var i = 0; i < s.participants.length; i++) {
      var role = s.participants[i];
      if (ROLES.indexOf(role) < 0) return "roles";
      var p = role === "mistress" ? state.mistress : personFor(state, cast[role]);
      if (!p) return "cast";
      if (!(typeof p.age === "number" && p.age >= ADULT_AGE)) return "adult";
    }
    return "";
  }

  // Start a scene. opts: { trigger, params, cast, free, wordAt, toggle, after }
  // Returns true if a scene is now playing.
  function start(state, opts) {
    var s = find(opts.trigger, opts.params || {});
    if (!s) return false;
    if (canPlay(state, s, opts.cast, opts.toggle)) return false;
    state.scenes = state.scenes || {};
    // Gate 2: a yes that was not freely given takes the fade path. The house also draws the curtain now and then.
    var fade = !opts.free || rand() < (K.curtainChance || 0);
    state.scenes.current = {
      scene: s.id, beat: s.order[0], cast: opts.cast, params: opts.params || {}, fade: fade,
      free: !!opts.free, wordAt: opts.wordAt || 0, steps: 0, stopped: false, earlyStop: false, done: false,
      after: opts.after || null, log: []
    };
    return true;
  }

  function current(state) { return state.scenes && state.scenes.current ? state.scenes.current : null; }

  function sceneOf(run) { return lib().scenes[run.scene] || null; }

  // Which tier's text to show for a beat, and the text.
  function textFor(beat, run) {
    var order = run.fade ? ["gaslight"] : TIERS.slice(0, TIERS.indexOf(topTier()) + 1).reverse();
    for (var i = 0; i < order.length; i++) {
      var t = beat.slots[order[i]];
      if (t && !FORBIDDEN.test(t)) return { tier: order[i], text: t };
    }
    return { tier: "gaslight", text: "" };
  }

  function condMet(c, run) {
    if (!c.cond) return true;
    return String(run.params[c.cond.key]) === c.cond.value;
  }

  // What the current beat looks like: { title, tier, paragraphs, choices: [{label, index}] }
  function view(state) {
    var run = current(state);
    if (!run) return null;
    var s = sceneOf(run);
    if (!s) return null;
    var beat, tierText;
    if (run.beat === "#houseword") {
      var tier = run.fade || topTier() === "gaslight" ? "gaslight" : "candlelight";
      tierText = { tier: tier, text: K.houseWord[tier] };
      beat = { id: "#houseword", choices: [] };
    } else if (run.beat === "aftercare" && !s.beats.aftercare) {
      var t2 = run.fade || topTier() === "gaslight" ? "gaslight" : "candlelight";
      tierText = { tier: t2, text: K.aftercare[t2] };
      beat = { id: "aftercare", choices: [] };
    } else {
      beat = s.beats[run.beat];
      if (!beat) return null;
      tierText = textFor(beat, run);
    }
    var text = fill(state, run, s, tierText.text);
    if (run.earlyStop && beat.id === "aftercare") text = K.stoppedEarly + "\n\n" + text;
    var choices = [];
    if (!run.done) {
      if (beat.id === "#houseword") choices.push({ label: K.continueLabel, index: -2 });
      else if (beat.id === "aftercare" && !s.beats.aftercare) choices.push({ label: K.closeLabel, index: -3 });
      else {
        var hasStop = false;
        beat.choices.forEach(function (c, i) {
          if (!condMet(c, run)) return;
          if (c.to === "aftercare") hasStop = true;
          choices.push({ label: fill(state, run, s, c.label || K.continueLabel), index: i });
        });
        if (!choices.length) choices.push({ label: K.closeLabel, index: -3 });
        // The stop route: on every beat, and no scene file can remove it.
        if (!hasStop && beat.id !== "aftercare") choices.push({ label: K.stopLabel, index: -1, stop: true });
      }
    }
    return {
      title: s.title,
      tier: tierText.tier,
      paragraphs: text.split(/\n\s*\n/).map(function (p) { return p.replace(/\s*\n\s*/g, " ").trim(); }).filter(Boolean),
      choices: choices,
      fade: run.fade
    };
  }

  function go(state, run, s, to) {
    run.steps++;
    if (to === "end") { run.done = true; return; }
    if (to === "aftercare") { run.beat = "aftercare"; return; }
    // Her word arrives when the scene goes past her limit (Gate: the house word).
    if (run.wordAt && run.steps >= run.wordAt && run.beat !== "#houseword") {
      run.beat = "#houseword";
      run.stopped = true;
      return;
    }
    run.beat = s.beats[to] ? to : "aftercare";
  }

  // index: a choice's index, -1 the stop route, -2 on from the house word, -3 close.
  function choose(state, index) {
    var run = current(state);
    if (!run || run.done) return;
    var s = sceneOf(run);
    if (!s) { run.done = true; return; }
    if (index === -3) { run.done = true; return; }
    if (index === -2) { run.beat = "aftercare"; return; }
    if (index === -1) {
      run.earlyStop = true;
      run.stopped = true;
      run.beat = "aftercare";
      return;
    }
    var beat = s.beats[run.beat];
    var c = beat && beat.choices[index];
    if (!c || !condMet(c, run)) return;
    if (c.to === "aftercare" && run.beat !== "aftercare") {
      // A scene's own route to aftercare counts as finishing unless it is plainly a stop.
      if (/stop|enough|no further/i.test(c.label || "")) { run.earlyStop = true; run.stopped = true; }
    }
    go(state, run, s, c.to);
    if (run.beat === "aftercare" && s.beats.aftercare && !s.beats.aftercare.choices.length) {
      // An aftercare beat with no choices of its own simply closes.
    }
  }

  // Finish the scene: returns what happened, and clears it.
  function finish(state) {
    var run = current(state);
    if (!run) return null;
    var s = sceneOf(run);
    var res = {
      scene: run.scene, after: run.after, stopped: run.stopped, earlyStop: run.earlyStop,
      completed: !run.stopped, free: run.free, fade: run.fade, outcome: s ? s.outcome : {}, cast: run.cast
    };
    state.scenes.current = null;
    return res;
  }

  // The outcome line: a small bonus, capped, and only for a completed scene freely consented to (D3).
  function applyOutcome(state, res) {
    if (!res || !res.completed || !res.free) return;
    var cap = K.outcomeCap || 2;
    var o = res.outcome || {};
    var IN = window.RACINATION_INTIMACY;
    ["partner", "beloved", "guest"].forEach(function (role) {
      var c = res.cast && res.cast[role];
      if (!c || c.kind !== "resident") return;
      var r = personFor(state, c);
      if (!r) return;
      ["racination", "devotion", "doubt"].forEach(function (k) {
        if (!o[k]) return;
        var v = Math.max(-cap, Math.min(cap, o[k]));
        r.meters[k] = Math.max(0, Math.min(100, r.meters[k] + v));
      });
    });
    if (o.bond && IN && res.cast && res.cast.partner) {
      var other = res.cast.beloved ? (res.cast.beloved.kind === "mistress" ? 0 : res.cast.beloved.id) : null;
      if (other != null) IN.addProgress(state, res.cast.partner.id, other, Math.max(-cap, Math.min(cap, o.bond)));
    }
  }

  /* ============================================================
     Tokens
     ============================================================ */

  function personTokens(state, p, kind) {
    if (!p) return {};
    var t = { name: (p.title ? p.title + " " : "") + (p.surname || p.name || ""), first: p.first || p.surname || "", surname: p.surname || "", title: p.title || "" };
    if (kind === "guest") { t.name = p.name; t.job = p.job; t.town = p.town; }
    t.polarity = p.polarity || "";
    t.houseword = p.consent ? p.consent.houseWord : "";
    var A = D.appearance, H = window.RACINATION_HOUSEHOLD;
    if (p.looks && A && H) {
      try {
        t.hair = H.helpers.opt(A.hairColour, p.looks.hairColour).prose;
        t.eyes = H.helpers.opt(A.eyeColour, p.looks.eyeColour).prose;
      } catch (e) { /* leave them out */ }
    }
    return t;
  }

  function fill(state, run, s, text) {
    var t = {};
    Object.keys(run.cast || {}).forEach(function (role) {
      var c = run.cast[role];
      var p = personFor(state, c);
      var pt = personTokens(state, p, c.kind);
      Object.keys(pt).forEach(function (k) { t[role + "." + k] = pt[k]; });
    });
    var partner = personFor(state, run.cast && run.cast.partner);
    t.houseword = partner && partner.consent ? partner.consent.houseWord : "";
    t.room = run.params.room || s.room || "the Study";
    t.season = run.params.season || "";
    t.planet = run.params.planetName || run.params.planet || "";
    t.lady = run.params.lady || "";
    t.phrase = run.params.phrase || "";
    t.image = run.params.image || "";
    t.house = (D.house && D.house.name) || "the house";
    var out = String(text || "").replace(/\{(\w+(?:\.\w+)?)\}/g, function (m, k) { return t[k] != null ? t[k] : m; });
    var MI = window.RACINATION_MISTRESS;
    if (MI && state.mistress) out = MI.fillTokens(out, state.mistress);
    return out;
  }

  /* ============================================================
     For the preview page
     ============================================================ */

  function previewText(beat, tier, fade) {
    var order = fade ? ["gaslight"] : TIERS.slice(0, TIERS.indexOf(tier) + 1).reverse();
    for (var i = 0; i < order.length; i++) {
      var t = beat.slots[order[i]];
      if (t && FORBIDDEN.test(t)) continue;
      if (t) return { tier: order[i], text: t, fellBack: order[i] !== order[0] };
    }
    return { tier: "", text: "", fellBack: true };
  }

  // A template of every scene and beat with empty [author] slots, for the designer to fill.
  function authoredTemplate() {
    var L = lib();
    var out = ["window.RACINATION_AUTHORED = `", "# Your Author-tier text. Write under each [author] marker.", "# Leave a slot empty to let Candlelight (or Gaslight) show instead.", "# Do not use the backtick character anywhere in this file.", ""];
    L.ids.forEach(function (id) {
      var s = L.scenes[id];
      out.push("=== scene: " + id);
      s.order.concat(s.beats.aftercare ? [] : ["aftercare"]).forEach(function (b) {
        out.push("--- beat: " + b, "[author]", "", "");
      });
    });
    out.push("`;");
    return out.join("\n");
  }

  window.RACINATION_SCENEKIT = {
    data: K,
    TIERS: TIERS,
    ROLES: ROLES,
    setRandom: setRandom,
    settings: getSettings,
    setTier: setTier,
    confirmAuthor: confirmAuthor,
    revokeAuthor: revokeAuthor,
    setToggle: setToggle,
    authorAllowed: authorAllowed,
    topTier: topTier,
    parse: parse,
    load: load,
    library: lib,
    check: check,
    find: find,
    start: start,
    current: current,
    view: view,
    choose: choose,
    finish: finish,
    applyOutcome: applyOutcome,
    previewText: previewText,
    authoredTemplate: authoredTemplate,
    forbidden: function (t) { return FORBIDDEN.test(t || ""); }
  };

})();
