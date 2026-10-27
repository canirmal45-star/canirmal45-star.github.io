# 🚽 Toilet Trouble

A silly catching game. You are a toilet. 💩 is falling from the sky.
Catch it, and **don't** let phones, rubber ducks, teddies, socks or keys
clog you up!

It's made with plain HTML, CSS and JavaScript: no frameworks, no installs,
no build step.

---

## How to play

| Item | What happens |
|---|---|
| 💩 | Catch it: **+10 points** |
| 🧻 (glowing gold) | Rare golden roll: **+50 points** |
| 📱 🧸 🦆 🧦 🔑 | Clogs the toilet: **lose a plunger 🪠** |

- You start with **3 plungers 🪠** (lives). Lose them all and it's game over.
- Every **100 points** you go up a level, and things fall faster.
- Your best score is saved in your browser.

**Controls**

| Device | How to move |
|---|---|
| Keyboard | ← → arrow keys, or A / D |
| Mouse | Move the mouse over the game |
| Phone / tablet | Drag your finger across the game |
| Pause | Press **P** |
| Sound on / off | Tap the **🔊** button in the corner, or press **M** |

**Sounds:** *flush* when you start, *plop* for each 💩, a *sparkle* for the golden 🧻,
a *glug* when you get clogged, a *fart* 💨 when you level up, and a sad trombone at game over.

---

## How to run it

1. Open the game folder.
2. **Double-click `index.html`**. It opens in your web browser.

That's it. Nothing to install.

---

## The files

| File | What it does |
|---|---|
| `index.html` | The page layout: title, score bar, game area and Start button. Double-click this to play. |
| `style.css` | How the page around the game looks: page colours, fonts, the button shape. |
| `config.js` | **All the settings you'll want to change**: emojis, points, speeds, lives, colours and every message. Start here. |
| `sounds.js` | All the sound effects (plop, fart, flush…), made by code, so no sound files are needed. Also the 🔊 mute button. |
| `game.js` | The game logic: the game loop, spawning items, catching, scoring and controls. You rarely need to edit it. |
| `manifest.webmanifest` | The app's "ID card": name, icon and colours. Lets phones install the game, and is what PWABuilder uses to build the Play Store app. |
| `sw.js` | The "service worker". Saves the game's files so it works offline once installed. Only runs on a website, not when you double-click. |
| `icons/icon.svg` | The app icon drawing (a toilet with a happy 💩). Edit this to change the icon. |
| `icons/icon-192.png`, `icons/icon-512.png` | The icon as pictures, in the two sizes phones and the Play Store need. |
| `.nojekyll` | An empty file that tells GitHub Pages to serve every file as-is. Without it, GitHub would hide the `.well-known` folder. |
| `.well-known/assetlinks.json` | Proves the Play Store app and this website belong together, so the app opens full-screen with no browser address bar. Contains the app's package ID (`com.salvo.toilettrouble`) and signing-key fingerprints. |
| `README.md` | This guide. |
| `LICENSE` | The MIT license. It says anyone may use, change and share this game as long as they keep the notice. |
| `fruit-fall.html` | The original one-file version of the game, kept as a backup. Safe to delete. |

---

## How to change things

After **every** change: save the file, then refresh the browser (**F5**).
If nothing changes, do a hard refresh: **Ctrl + F5** (Mac: **Cmd + Shift + R**).

### Change the player emoji
1. Open `config.js`.
2. Find `player: "🚽",`
3. Swap the emoji, for example `player: "🪣",`
4. Save and refresh.

> Tip: on Windows press **Windows key + .** (full stop) to open the emoji picker.

### Add new things to catch or avoid
1. Open `config.js`.
2. Find the list, for example `badItems: ["📱", "🧸", "🦆", "🧦", "🔑"],`
3. Add a new emoji inside the brackets, with quotes and a comma:
   `badItems: ["📱", "🧸", "🦆", "🧦", "🔑", "🎮"],`
4. Same idea for `goodItems`.

Want the falling poop to look different now and then? Add more to `goodItems`, e.g. `["💩", "💩", "🟤"]`.
(Putting an emoji in twice makes it appear twice as often.)

### Change the game's name
The name appears in two places. Change both:
1. `config.js` → `title` (the name on the page and in the browser tab).
2. `manifest.webmanifest` → `name` and `short_name` (the name under the app icon on phones).

### Change the funny words
`catchWords` in `config.js` is the list of words that pop up when you catch something
("Plop!", "Splash!" …). Add your own the same way as above.
All other messages (start screen, game over, paused) are in the **Messages** part of `config.js`.
`{score}` and `{level}` get replaced by the real numbers.

### Change the difficulty
In `config.js`, under **Difficulty**:

| To make it… | Change this |
|---|---|
| Easier | more `lives`, lower `startFallSpeed`, lower `badChance` (e.g. `0.15`) |
| Harder | fewer `lives`, higher `speedPerLevel`, higher `badChance` (e.g. `0.4`) |
| Level up faster | lower `pointsPerLevel` (e.g. `50`) |
| More items on screen | lower `startSpawnMs` (e.g. `600`) |

### Change the colours
- **Inside the game** (wall, tiles, floor): `config.js` → **Colours inside the game**.
  Colours are hex codes like `"#a9e3dc"`. Search "color picker" on Google to find codes.
- **Around the game** (page background, button, text): the top of `style.css`.
  For example change `--accent: #8b5a2b;` to change the button colour.

### Change the background
The bathroom wall is drawn in `game.js` in the **7. Drawing** section, using these settings in `config.js`:
- `wallTop` and `wallBottom`: the wall fades from one colour to the other. Use the same colour twice for a flat wall.
- `tileSize`: how big the tiles are. Set it to `0` for no tiles.
- `floorColor`: the strip at the bottom.

For example, a pink bathroom: `wallTop: "#f7b6d2"`, `wallBottom: "#fde7f1"`.

### Change which sound plays when
1. Open `config.js` and find the **Sounds** part:
   ```js
   sounds: {
     start: "flush",
     catch: "plop",
     bonus: "sparkle",
     bad: "glug",
     levelUp: "fart",
     gameOver: "sadTrombone",
   },
   ```
2. Swap any sound for another built-in one: `"plop"`, `"sparkle"`, `"glug"`, `"fart"`, `"flush"`, `"sadTrombone"` or `"beep"`.
   For example, `catch: "fart",` makes every catch a fart. 💨
3. Use `""` (empty quotes) for no sound, e.g. `start: "",`
4. Change `soundVolume` to make everything louder (up to `1`) or quieter (down to `0`).

### Add your own sound file
1. Make a folder called `sounds` next to `index.html`.
2. Put your sound file in it, for example `sounds/my-plop.mp3` (`.mp3` and `.wav` work everywhere).
3. In `config.js`, use the file's path instead of a sound name:
   `catch: "sounds/my-plop.mp3",`
4. So it also works offline in the app, open `sw.js`, add `"sounds/my-plop.mp3",` to the `FILES` list,
   and change `toilet-trouble-v2` to `toilet-trouble-v3` (a new number each time you change the list).
5. Upload the `sounds` folder and the changed files to GitHub.

> Only use sounds you made yourself or that are free to use (for example from freesound.org with a "CC0" license).
> Sounds from games, films or TV shows can get the app removed from the Play Store.

### Make a new built-in sound
The sounds are "recipes" in `sounds.js`, inside `SOUND_RECIPES`. The easiest way to start is to copy
`plop`, rename it (e.g. `boing`), and play with the numbers:
- `from` / `to`: the starting and ending pitch (low numbers = deep, high numbers = squeaky)
- `duration`: how long it lasts, in seconds
- `type`: `"sine"` (smooth), `"triangle"` (soft), `"square"` (buzzy, retro), `"sawtooth"` (very buzzy)

Then use your new name in `config.js`, e.g. `bonus: "boing",`

---

## How `game.js` works

`game.js` is split into 8 numbered sections. Here are the main ideas.

**The game loop (section 5)**
Like a flip-book: about 60 times a second the browser calls `loop()`.
Each time, `update()` moves everything a tiny bit and `draw()` repaints the picture.
`dt` measures how much time passed since the last frame, so the game runs at
the same speed on fast and slow devices.

**Spawning items (section 4)**
A timer counts up. When it reaches the spawn delay, `spawnItem()` creates a new item
just above the screen at a random spot. It rolls a random number to decide what it is:
5% bonus, 25% bad, the rest good (set by `bonusChance` and `badChance`).

**Catching / collision (section 5, inside `update`)**
Each frame every item moves down. If an item is **at the toilet's height** *and*
**close enough left-to-right**, it's caught. Good and bonus items add points;
bad items take away a life. Items that fall off the bottom are removed.

**Levels (section 6)**
`level = 1 + score ÷ pointsPerLevel` (rounded down). Higher levels make new items
fall faster (`speedPerLevel`) and appear more often (`spawnFasterPerLevel`).

**Controls (section 8)**
- Keyboard: pressing a key turns on a "left" or "right" flag; letting go turns it off.
  While a flag is on, the toilet moves each frame.
- Mouse / touch: the toilet jumps to wherever your pointer or finger is.

**Drawing (section 7)**
Painted back to front, like layers: wall → tiles → floor → falling items → toilet → floating texts.

**Sounds (`sounds.js`)**
`game.js` calls `playSound(...)` at the important moments (catch, clog, level up, game over).
`playSound` looks up the recipe in `sounds.js` and builds the sound from tones and noise using the
browser's Web Audio system. Browsers only allow sound after the player taps something,
so the sound system switches on when you press the start button.

**App support (section 9)**
When the game is on a website, this switches on `sw.js` so the game works offline.

---

## Putting it online and on the Play Store

The game is hosted for free on **GitHub Pages** at
**https://canirmal45-star.github.io/**

The Play Store app is a thin wrapper made with **PWABuilder** (pwabuilder.com).
It opens that website full-screen, so **uploading new files to GitHub also updates the app**.
You only need to upload a new Play Store build if you change the app's name, icon or package settings.

### Updating the live game
1. Go to your repository `canirmal45-star.github.io` on github.com.
2. Click **Add file → Upload files**.
3. Drag in the files you changed and click **Commit changes**.
4. Wait 1–2 minutes, then refresh the website.

---

## Ideas for what to add next

**Easy**
- More bad items (🎮 🪥 💍 🐸)
- Swap the sounds around in `config.js` (fart on every catch?)
- Different funny words and messages
- A different colour bathroom

**Medium**
- A 60-second "speed run" mode
- A tappable pause button for phones
- A shake effect when the toilet gets clogged

**Harder**
- Power-ups, like 🪠 (extra life) or 🧴 (everything slows down)
- A combo bonus for catching many 💩 in a row
- Different toilets you unlock with points
- Publish it on the Google Play Store *(in progress)*

---

## Common problems

| Problem | Fix |
|---|---|
| **Blank screen / nothing happens** | Make sure all files are in the **same folder** with their exact names (`index.html`, `style.css`, `config.js`, `game.js`). Press **F12** → **Console** tab to see the error message. |
| **Broke it after editing `config.js`** | Usually a missing comma `,` or quote `"`. Check the line you just changed. Every setting ends with a comma. |
| **Changes not appearing** | Make sure you **saved** the file, then hard-refresh with **Ctrl + F5**. |
| **An emoji shows as a box ▯** | That device's emoji set is too old for that emoji. Pick a more common one. |
| **Emojis look different on my phone** | Normal. Each company (Apple, Google, Samsung, Microsoft) draws emojis their own way. |
| **Font looks plain** | The "Fredoka" font loads from the internet. Offline, a normal font is used instead. The game still works. |
| **No sound** | Check the 🔊 button isn't showing 🔇. Turn up the device volume. On iPhone, flip the silent switch off. Sounds only start after you press the start button. |
| **Page scrolls on my phone while playing** | Drag *inside* the game area. |
| **Website still shows the old version after uploading** | GitHub Pages takes 1–2 minutes to update. Then refresh twice. The first refresh downloads the new version and the second shows it. |
| **404 page on the website** | The repository must be named exactly `canirmal45-star.github.io`, and `index.html` must be at the top level, not inside a folder. |

---

## License

MIT License. Copyright (c) 2026 SALVO. See the `LICENSE` file.
