/*
  RACINATION — scenes/list.js
  ---------------------------------------------------------------
  The list of scene files. To add a scene, put its file in this
  folder and add its name to the list below (in quotation marks,
  with a comma between names). WRITING-SCENES.md explains the rest.

  This file also loads authored.js (your Author-tier text) from the
  game's main folder, if it is there. If it is not, the game runs
  without it.
  ---------------------------------------------------------------
*/

window.RACINATION_SCENE_LIST = [
  "rite.js",
  "rite-petition.js",
  "guest-rite.js",
  "courtship-gramophone.js",
  "courtship-reading.js",
  "mistress-evening.js",
  "bonding-night.js"
];

/* Leave everything below this line alone. */
(function () {
  var base = (document.currentScript && document.currentScript.getAttribute("data-base")) || "";
  window.RACINATION_SCENE_FILES = window.RACINATION_SCENE_FILES || [];
  window.RACINATION_SCENE_LIST.forEach(function (f) {
    document.write('<script src="' + base + "scenes/" + f + '"><\/script>');
  });
  document.write('<script src="' + base + 'authored.js" onerror="window.RACINATION_AUTHORED_MISSING = true"><\/script>');
})();
