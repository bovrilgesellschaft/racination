# Racination

A household-management game of devotion, discipline and the Pit, 1983–1989.
Adults only (18+).

Current build: **Milestone 4a, the household economy.** Real weekly accounts
(paying guests, publications, needlework, contributions; rent, provisions,
coal, post), a House page of rooms with Period and Condition to repair and
restore, the Pit meter, seasons, the outside world's events on their real
dates, and two new ways to lose: bankruptcy and the Pit. Milestones 1 to 3
(the turn, residents, the rota and the Mistress) are all still here.

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

Everything in the `data` folder is for editing:

- `data/house.js`: the house's name, dates and the Housekeeper's lines.
- `data/economy.js`: every price, the rooms, the Pit, paying guests, the
  outside world's dated events and the endings' words.
- `data/appearance.js`: the appearance lists (from the spreadsheet), hair
  styles, make-up, expressions and the sentences descriptions are built from.
- `data/wardrobe.js`: the 1930s and modern garments.
- `data/residents.js`: names, backgrounds, duties, desires, ties, secrets,
  the weekly drift of the meters, and the household's lines.
- `data/mistress.js`: the Mistress's creation choices, backgrounds, styles,
  starting meters, weekly drift and her lines.

Any line of text can mention the Mistress with tokens such as
`{mistress.name}`, `{mistress.voice}`, `{mistress.hair}`, `{mistress.scent}`,
`{mistress.mark}`, `{mistress.style}` or `{mistress.background}`.

Each file opens in any text editor (TextEdit on a Mac:
choose Format → Make Plain Text; Notepad on Windows). Change the words
between quotation marks and the numbers; leave the rest alone. If the game
shows an error after an edit, look for a missing comma or quotation mark.

## Testing tools

On the title screen, **Testing tools** switches on extra buttons: nudging a
resident's or the Mistress's meters, showing a resident's secret, making a new
household, and making the Mistress again. They are
for checking the game and will be removed before release.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page you open |
| `style.css` | Colours, fonts and layout |
| `engine.js` | The turn, the screens, money, saving |
| `household.js` | Making, describing and dressing residents; their weekly meters |
| `mistress.js` | The Mistress: creation choices, description, tokens, her weekly meters |
| `economy.js` | The weekly accounts, rooms, guests, the Pit and the endings it can cause |
| `data/` | Figures and words you can edit |
| `fonts/` | The two fonts and their licences |

## Credits

- **VT323** by Peter Hull, SIL Open Font Licence 1.1 (`fonts/LICENSE-VT323.txt`).
- **Jacquard 24** by The Soft Type Project Authors, SIL Open Font Licence 1.1 (`fonts/LICENSE-Jacquard24.txt`).
