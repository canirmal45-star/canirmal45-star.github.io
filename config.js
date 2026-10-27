/* =====================================================================
   config.js — ALL THE SETTINGS YOU'RE LIKELY TO CHANGE

   How to use:
     1. Change a value below.
     2. Save the file.
     3. Refresh the game in your browser (press F5, or Ctrl+F5 if nothing changes).

   Rules so you don't break it:
     - Text goes inside "quotes".
     - Every line ends with a comma ,
     - Lists go inside [square brackets], with commas between items.
     - Anything after // is a comment. The computer ignores it.

   License: MIT (see the LICENSE file)
   ===================================================================== */

const CONFIG = {

  // ---------- Name ----------
  title: "Toilet Trouble",      // shown at the top of the page and in the browser tab

  // ---------- The player ----------
  // The thing you move left and right. Any emoji works: "🐱", "🚀", "🛸", "🪣"
  player: "🚽",

  // ---------- Good items (catch these) ----------
  goodItems: ["💩"],
  pointsPerCatch: 10,
  // One of these is picked at random and shown with the points, e.g. "Plop! +10"
  catchWords: ["Plop!", "Splash!", "Bullseye!", "Flush!", "Nice!", "Kerplunk!"],

  // ---------- Bad items (avoid these, each one clogs the toilet = lose a life) ----------
  badItems: ["📱", "🧸", "🦆", "🧦", "🔑"],
  badChance: 0.25,              // 0.25 = 25% of falling things are bad

  // ---------- Bonus item (rare, worth lots of points) ----------
  bonusItem: "🧻",
  bonusPoints: 50,
  bonusChance: 0.05,            // 0.05 = 5% chance
  bonusText: "Golden roll!",    // shown with the points when you catch it
  bonusGlow: "#ffd23f",         // the golden glow around the bonus item

  // ---------- Difficulty ----------
  lives: 3,                     // how many mistakes you can make
  playerSpeed: 7,               // how fast the player moves with the keyboard
  startFallSpeed: 2.4,          // how fast things fall at level 1
  speedPerLevel: 0.45,          // extra fall speed added each level
  pointsPerLevel: 100,          // points needed to go up one level
  startSpawnMs: 900,            // milliseconds between new items at level 1 (1000 = 1 second)
  spawnFasterPerLevel: 70,      // each level, new items come this many ms sooner
  minSpawnMs: 320,              // the fastest items can ever appear

  // ---------- Sizes (in game pixels; the game area is 360 wide x 480 tall) ----------
  itemSize: 34,
  playerSize: 58,

  // ---------- Colours inside the game (the bathroom) ----------
  // (Page colours like the button are in style.css)
  wallTop: "#a9e3dc",           // top of the bathroom wall
  wallBottom: "#e3f7f4",        // bottom of the wall (it fades between the two)
  tileSize: 40,                 // size of each wall tile (0 = no tiles)
  tileLineColor: "rgba(255, 255, 255, 0.75)",  // the lines between tiles
  floorColor: "#9ab0c4",        // the floor strip at the bottom
  textColor: "#ffffff",         // the floating "+10" texts

  // ---------- Sounds ----------
  // Which sound plays when. Built-in sounds (made by code in sounds.js):
  //   "plop", "sparkle", "glug", "fart", "flush", "sadTrombone", "beep"
  // Or use your own sound file, e.g. "sounds/my-plop.mp3"
  // Use "" (empty quotes) for no sound.
  sounds: {
    start: "flush",             // when you press the start button
    catch: "plop",              // catching 💩
    bonus: "sparkle",           // catching the golden 🧻
    bad: "glug",                // clogging the toilet
    levelUp: "fart",            // going up a level 💨
    gameOver: "sadTrombone",    // game over
  },
  soundVolume: 0.6,             // 0 = silent, 1 = loudest

  // ---------- Lives display ----------
  lifeIcon: "🪠",               // one plunger is shown per life
  noLivesIcon: "🤢",            // shown when you have no lives left

  // ---------- Messages ----------
  // {score} and {level} are swapped for the real numbers automatically.
  startTitle: "Nature calls! 🚽",
  startText: "Catch the 💩. Don't let phones, ducks or teddies clog the toilet. A golden 🧻 is worth 50!",
  startButton: "Lift the lid",
  gameOverTitle: "Totally clogged! 🤢",
  gameOverText: "You flushed {score} points and reached level {level}.",
  playAgainButton: "Flush & try again",
  levelUpText: "Level {level}! 💨",
  loseLifeText: "Clogged! -1 🪠",
  pausedText: "Occupied 🚪",
  helpText: "Move with ← → or A / D, or drag across the game. Press P to pause, M for sound.",
};
