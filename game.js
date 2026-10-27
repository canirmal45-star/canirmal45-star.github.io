/* =====================================================================
   game.js — HOW THE GAME WORKS

   You normally don't need to edit this file. Most changes can be made
   in config.js. This file is split into sections:

     1. Setup        get the canvas ready, fill in the page text
     2. Game state   all the numbers that change while you play
     3. Start / end  starting a new game and game over
     4. Spawning     creating new falling items
     5. Game loop    runs about 60 times a second: move, check, draw
     6. Scoring      points, levels and floating texts
     7. Drawing      painting everything onto the canvas
     8. Controls     keyboard, mouse and touch
     9. App support  lets the game work offline when installed as an app

   License: MIT (see the LICENSE file)
   ===================================================================== */


/* ---------- 1. Setup ---------- */

// The game always thinks it is 360 x 480 pixels big.
// It is then stretched to fit your screen, so it looks the same everywhere.
const W = 360, H = 480;
const GROUND = 30;                       // height of the floor strip
const BEST_SCORE_KEY = "toilettrouble-best";  // name used to save the best score in the browser

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");     // "ctx" is the pen we draw with

// Shortcut: $("score") means "find the element with id score on the page"
const $ = (id) => document.getElementById(id);

// Swaps {score} and {level} in a message for the real numbers.
// Example: fillIn("Level {level}!") -> "Level 3!"
function fillIn(text) {
  return text.replace("{score}", state.score).replace("{level}", state.level);
}

// Put the text from config.js onto the page
document.title = CONFIG.title;
$("title").textContent = CONFIG.title;
$("overlayTitle").textContent = CONFIG.startTitle;
$("overlayText").textContent = CONFIG.startText;
$("startBtn").textContent = CONFIG.startButton;
$("help").textContent = CONFIG.helpText;

// Makes the canvas sharp on every screen size (runs again if the window changes size)
function resize() {
  const dpr = window.devicePixelRatio || 1;          // phones have extra-sharp screens
  const rect = canvas.getBoundingClientRect();       // how big the canvas is on screen
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  // Stretch our 360 x 480 drawing to fill the real canvas size
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  if (!state.running) draw();
}


/* ---------- 2. Game state ----------
   Everything that changes during a game is kept in this one object. */
const state = {
  running: false,          // is a game being played right now?
  paused: false,
  score: 0,
  level: 1,
  lives: CONFIG.lives,
  playerX: W / 2,          // where the player is, left to right (starts in the middle)
  items: [],               // every falling thing currently on screen
  popups: [],              // floating texts like "+10"
  spawnTimer: 0,           // counts up until it's time for a new item
  lastTime: 0,             // when the last frame happened
  keys: { left: false, right: false },  // which arrow keys are held down
  best: 0,                 // best score ever
};

// Load the best score saved in this browser (if there is one)
try { state.best = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0; } catch (e) {}

// Copy the numbers from "state" into the score bar on the page
function updateHud() {
  $("score").textContent = state.score;
  $("level").textContent = state.level;
  $("best").textContent = state.best;
  $("lives").textContent = CONFIG.lifeIcon.repeat(Math.max(0, state.lives)) || CONFIG.noLivesIcon;
}


/* ---------- 3. Start / end ---------- */

function startGame() {
  // Reset everything for a fresh game
  state.running = true;
  state.paused = false;
  state.score = 0;
  state.level = 1;
  state.lives = CONFIG.lives;
  state.items = [];
  state.popups = [];
  state.playerX = W / 2;
  state.spawnTimer = 0;
  state.lastTime = performance.now();

  $("overlay").hidden = true;     // hide the start box
  updateHud();
  playSound(CONFIG.sounds.start);
  requestAnimationFrame(loop);    // start the game loop
}

function endGame() {
  state.running = false;          // this makes the game loop stop

  // New best score? Save it in the browser.
  if (state.score > state.best) {
    state.best = state.score;
    try { localStorage.setItem(BEST_SCORE_KEY, state.best); } catch (e) {}
  }
  updateHud();
  playSound(CONFIG.sounds.gameOver);

  // Show the game over box
  $("overlayTitle").textContent = CONFIG.gameOverTitle;
  $("overlayText").textContent = fillIn(CONFIG.gameOverText);
  $("startBtn").textContent = CONFIG.playAgainButton;
  $("overlay").hidden = false;
  $("startBtn").focus();          // so pressing Enter plays again
}


/* ---------- 4. Spawning (creating falling items) ---------- */

// Picks a random thing from a list
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function spawnItem() {
  // Roll a random number between 0 and 1 to decide what kind of item this is.
  // With bonusChance 0.05 and badChance 0.25:
  //   0.00–0.05 -> bonus,  0.05–0.30 -> bad,  everything else -> good
  const roll = Math.random();
  let kind = "good";
  let emoji = pick(CONFIG.goodItems);
  if (roll < CONFIG.bonusChance) {
    kind = "bonus";
    emoji = CONFIG.bonusItem;
  } else if (roll < CONFIG.bonusChance + CONFIG.badChance) {
    kind = "bad";
    emoji = pick(CONFIG.badItems);
  }

  const half = CONFIG.itemSize / 2;
  state.items.push({
    x: half + Math.random() * (W - CONFIG.itemSize),   // random spot across the top
    y: -half,                                          // just above the screen
    // Falls faster at higher levels, plus a little randomness
    speed: CONFIG.startFallSpeed + (state.level - 1) * CONFIG.speedPerLevel + Math.random() * 0.8,
    spin: (Math.random() - 0.5) * 0.08,                // slight random spin
    angle: 0,
    kind,
    emoji,
  });
}

// How long to wait between new items. Gets shorter each level, but never below minSpawnMs.
function spawnDelay() {
  return Math.max(CONFIG.minSpawnMs, CONFIG.startSpawnMs - (state.level - 1) * CONFIG.spawnFasterPerLevel);
}


/* ---------- 5. Game loop ----------
   Like a flip-book: the browser calls loop() about 60 times a second.
   Each time we move everything a little (update) and repaint (draw). */
function loop(now) {
  if (!state.running) return;     // game over -> stop looping

  // dt = how much time passed since last frame. 1 means "one normal frame".
  // This keeps the speed the same on fast and slow devices.
  const dt = Math.min(3, (now - state.lastTime) / 16.67);
  state.lastTime = now;

  if (!state.paused) update(dt);
  draw();
  requestAnimationFrame(loop);    // ask for the next frame
}

function update(dt) {
  // Move the player with the keyboard
  if (state.keys.left) state.playerX -= CONFIG.playerSpeed * dt;
  if (state.keys.right) state.playerX += CONFIG.playerSpeed * dt;

  // Keep the player inside the game area
  const pHalf = CONFIG.playerSize / 2;
  state.playerX = Math.max(pHalf, Math.min(W - pHalf, state.playerX));

  // Is it time for a new item?
  state.spawnTimer += dt * 16.67;            // turn frames back into milliseconds
  if (state.spawnTimer >= spawnDelay()) {
    state.spawnTimer = 0;
    spawnItem();
  }

  // Move every item down and check if the player caught it.
  // (We go through the list backwards so removing items is safe.)
  const catchY = H - GROUND - CONFIG.playerSize * 0.75;   // the height where catching happens
  for (let i = state.items.length - 1; i >= 0; i--) {
    const it = state.items[i];
    it.y += it.speed * dt;
    it.angle += it.spin * dt;

    // COLLISION CHECK: caught if the item is at the player's height
    // AND close enough to the player left-to-right.
    const atPlayerHeight = it.y > catchY && it.y < catchY + CONFIG.playerSize * 0.6;
    const closeEnough = Math.abs(it.x - state.playerX) < (CONFIG.playerSize + CONFIG.itemSize) / 2 - 8;

    if (atPlayerHeight && closeEnough) {
      if (it.kind === "good") {
        playSound(CONFIG.sounds.catch);
        addPoints(CONFIG.pointsPerCatch, it, pick(CONFIG.catchWords));
      } else if (it.kind === "bonus") {
        playSound(CONFIG.sounds.bonus);
        addPoints(CONFIG.bonusPoints, it, CONFIG.bonusText);
      } else {
        // Bad item: the toilet is clogged, lose a life
        state.lives--;
        popup(CONFIG.loseLifeText, it.x, it.y);
        if (state.lives <= 0) { updateHud(); endGame(); return; }   // endGame plays its own sound
        playSound(CONFIG.sounds.bad);
      }
      state.items.splice(i, 1);    // remove the caught item
      updateHud();
    } else if (it.y > H + CONFIG.itemSize) {
      state.items.splice(i, 1);    // fell off the bottom: remove it
    }
  }

  // Float the popup texts upward and fade them out
  for (let i = state.popups.length - 1; i >= 0; i--) {
    const p = state.popups[i];
    p.y -= 0.8 * dt;
    p.life -= dt;
    if (p.life <= 0) state.popups.splice(i, 1);
  }
}


/* ---------- 6. Scoring ---------- */

// "word" is the funny text shown before the points, e.g. "Plop!" -> "Plop! +10"
function addPoints(amount, it, word) {
  state.score += amount;
  popup(word + " +" + amount, it.x, it.y);

  // Level = 1 + (score ÷ pointsPerLevel), rounded down.
  // e.g. with 100 points per level: 0–99 = level 1, 100–199 = level 2 ...
  const newLevel = 1 + Math.floor(state.score / CONFIG.pointsPerLevel);
  if (newLevel > state.level) {
    state.level = newLevel;
    popup(fillIn(CONFIG.levelUpText), W / 2, H / 2);
    playSound(CONFIG.sounds.levelUp);
  }
}

// Adds a floating text. "life" = how many frames it stays (45 ≈ 0.75 seconds).
const POPUP_LIFE = 45;
function popup(text, x, y) {
  // Keep the text away from the edges so it doesn't get cut off
  x = Math.max(80, Math.min(W - 80, x));
  state.popups.push({ text, x, y, life: POPUP_LIFE });
}


/* ---------- 7. Drawing ----------
   Painted back to front, like layers: wall, tiles, floor, items, player, texts. */
function draw() {
  // Bathroom wall: a gradient that fades from wallTop to wallBottom
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, CONFIG.wallTop);
  wall.addColorStop(1, CONFIG.wallBottom);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);

  // Wall tiles: straight lines across and down, every tileSize pixels
  if (CONFIG.tileSize > 0) {
    ctx.strokeStyle = CONFIG.tileLineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = CONFIG.tileSize; x < W; x += CONFIG.tileSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H - GROUND);
    }
    for (let y = CONFIG.tileSize; y < H - GROUND; y += CONFIG.tileSize) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  // Floor
  ctx.fillStyle = CONFIG.floorColor;
  ctx.fillRect(0, H - GROUND, W, GROUND);

  // Draw text centred on the x, y we give it
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Falling items (each one rotated by its own spin angle)
  ctx.font = `${CONFIG.itemSize}px serif`;
  for (const it of state.items) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.angle);
    // The bonus item gets a golden glow so it stands out
    if (it.kind === "bonus") {
      ctx.shadowColor = CONFIG.bonusGlow;
      ctx.shadowBlur = 18;
    }
    ctx.fillText(it.emoji, 0, 0);
    ctx.restore();
  }

  // Player
  ctx.font = `${CONFIG.playerSize}px serif`;
  ctx.fillText(CONFIG.player, state.playerX, H - GROUND - CONFIG.playerSize / 2 + 6);

  // Floating texts, fading out as their life runs down
  ctx.font = `600 22px Fredoka, sans-serif`;
  for (const p of state.popups) {
    ctx.globalAlpha = Math.max(0, p.life / POPUP_LIFE);
    ctx.fillStyle = CONFIG.textColor;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";   // dark outline so text is readable
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  // Pause screen
  if (state.paused) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = `700 36px Fredoka, sans-serif`;
    ctx.fillText(CONFIG.pausedText, W / 2, H / 2);
  }
}


/* ---------- 8. Controls ---------- */

// Keyboard: when a key goes DOWN, remember it's held. When it comes UP, forget it.
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { state.keys.left = true; e.preventDefault(); }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { state.keys.right = true; e.preventDefault(); }
  if ((e.key === "p" || e.key === "P") && state.running) state.paused = !state.paused;
  if (e.key === "m" || e.key === "M") toggleSound();   // toggleSound is in sounds.js
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = false;
});

// Mouse and touch: move the player to wherever the pointer is
function pointerMove(e) {
  if (!state.running || state.paused) return;
  const rect = canvas.getBoundingClientRect();
  // Convert screen position to our 360-wide game position
  state.playerX = ((e.clientX - rect.left) / rect.width) * W;
}
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerdown", pointerMove);

// Start button and window resizing
$("startBtn").addEventListener("click", startGame);
window.addEventListener("resize", resize);

// Get everything ready when the page first loads
updateHud();
resize();


/* ---------- 9. App / offline support ----------
   Turns on sw.js (the offline helper) when the game is on a website.
   When you just double-click index.html this is skipped. */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}
