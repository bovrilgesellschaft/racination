# Racination

A household-management game of devotion, discipline and the Pit, 1983–1989.
Adults only (18+).

Current build: **Milestone 1, the skeleton.** The title screen, the weekly turn,
the Matins report, the ledger, and saving and loading. Residents arrive in
Milestone 2.

## How to play it

1. On this repository's GitHub page, click the green **Code** button, then **Download ZIP**.
2. Unzip the download. You get a folder called `racination-main`.
3. Open that folder and double-click `index.html`. It opens in your web browser.

Nothing needs installing and the game needs no internet connection once downloaded.
Keep all the files together in their folders, or the game can't find them.

## Saving

- The game saves itself in your browser at every step.
- **Save file** downloads your game as a small file. **Load file** reads one back.
  Use these to move a game between computers, or to keep a copy.
- Some browsers (Safari, and most iPhones) don't always keep games saved
  from a file on your disk. If Continue doesn't appear when you come back,
  use Save file before closing.

## Editing the words and figures

`data/house.js` holds the starting money, the weekly accounts and the lines
the Housekeeper writes. It opens in any text editor (TextEdit on a Mac:
choose Format → Make Plain Text; Notepad on Windows). Change the words
between quotation marks and the numbers; leave the rest alone. If the game
shows an error after an edit, look for a missing comma or quotation mark.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page you open |
| `style.css` | Colours, fonts and layout |
| `engine.js` | The rules: turns, money, saving |
| `data/house.js` | Figures and words you can edit |
| `fonts/` | The two fonts and their licences |

## Credits

- **VT323** by Peter Hull, SIL Open Font Licence 1.1 (`fonts/LICENSE-VT323.txt`).
- **Jacquard 24** by The Soft Type Project Authors, SIL Open Font Licence 1.1 (`fonts/LICENSE-Jacquard24.txt`).
