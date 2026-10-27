/* =====================================================================
   sounds.js — ALL THE SOUND EFFECTS, made with code (no sound files!)

   Which sound plays when is chosen in config.js → sounds.
   This file contains the "recipes" that build each sound from beeps and
   noise, plus the mute button.

   Each recipe is a little function. They use the browser's Web Audio
   tools:
     - an "oscillator" makes a tone (a beep). Its "frequency" is how high
       or low it sounds (100 = low rumble, 1000 = high whistle).
     - a "gain" is a volume knob. We turn it up and down over time.
     - a "filter" removes some of the sound to make it softer or muffled.

   License: MIT (see the LICENSE file)
   ===================================================================== */

let audio = null;         // the browser's sound system (created on the first sound)
let master = null;        // the main volume knob, every sound goes through it
let muted = false;
const MUTED_KEY = "toilettrouble-muted";   // name used to remember mute in the browser

try { muted = localStorage.getItem(MUTED_KEY) === "1"; } catch (e) {}

// Browsers only allow sound after the player has clicked or tapped something,
// so the sound system is created the first time a sound is needed.
function getAudio() {
  if (!audio) {
    const AudioSystem = window.AudioContext || window.webkitAudioContext;
    if (!AudioSystem) return null;          // very old browser: no sound, game still works
    audio = new AudioSystem();
    master = audio.createGain();
    master.gain.value = CONFIG.soundVolume;
    master.connect(audio.destination);      // destination = your speakers
  }
  if (audio.state === "suspended") audio.resume();
  return audio;
}

// Play a sound by name, e.g. playSound("plop").
// If the name has a dot in it (like "sounds/my-plop.mp3") a sound FILE is played instead.
function playSound(name) {
  if (muted || !name) return;

  if (name.includes(".")) {
    const file = new Audio(name);
    file.volume = CONFIG.soundVolume;
    file.play().catch(() => {});            // ignore errors (e.g. file not found)
    return;
  }

  const recipe = SOUND_RECIPES[name];
  const ac = getAudio();
  if (recipe && ac) recipe(ac, ac.currentTime, master);
}


/* ---------- Helpers used by the recipes ---------- */

// One tone that slides from one pitch ("from") to another ("to") and fades out.
//   type: "sine" (smooth), "triangle" (soft), "square" (buzzy), "sawtooth" (very buzzy)
function tone(ac, start, out, { type = "sine", from, to = from, duration, volume = 0.5 }) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);                              // start silent
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);         // quickly get loud
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);     // fade away
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + duration + 0.02);
  return osc;
}

// A chunk of random "shhhh" noise (used for the flush)
function noise(ac, duration) {
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * duration), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  return source;
}


/* ---------- The sound recipes ----------
   ac = the sound system, t = when to start, out = where the sound goes */
const SOUND_RECIPES = {

  // A drop falling into water: a quick tone sliding from high to low
  plop(ac, t, out) {
    tone(ac, t, out, { type: "sine", from: 750, to: 120, duration: 0.14, volume: 0.9 });
    tone(ac, t + 0.07, out, { type: "sine", from: 380, to: 900, duration: 0.06, volume: 0.25 }); // little bubble
  },

  // Magic sparkle: four quick notes going up
  sparkle(ac, t, out) {
    [880, 1109, 1319, 1760].forEach((pitch, i) => {
      tone(ac, t + i * 0.07, out, { type: "triangle", from: pitch, duration: 0.18, volume: 0.45 });
    });
  },

  // Blocked pipe: three low "glug" sounds going down
  glug(ac, t, out) {
    [[240, 140], [190, 110], [150, 70]].forEach(([from, to], i) => {
      tone(ac, t + i * 0.13, out, { type: "triangle", from, to, duration: 0.14, volume: 0.9 });
    });
  },

  // 💨 A wobbly low buzz with a random rumble, muffled by a filter
  fart(ac, t, out) {
    const duration = 0.7;
    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    const wobble = new Float32Array(40);                  // 40 random pitches in a row
    for (let i = 0; i < wobble.length; i++) wobble[i] = 95 - i * 0.8 + (Math.random() - 0.5) * 30;
    osc.frequency.setValueCurveAtTime(wobble, t, duration);

    const muffle = ac.createBiquadFilter();
    muffle.type = "lowpass";
    muffle.frequency.value = 500;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.7, t + 0.03);
    gain.gain.setValueAtTime(0.7, t + duration - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(muffle).connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  },

  // Toilet flush: rushing noise that swirls up and then drains away
  flush(ac, t, out) {
    const duration = 1.3;
    const water = noise(ac, duration);

    const swirl = ac.createBiquadFilter();
    swirl.type = "bandpass";
    swirl.Q.value = 1.5;
    swirl.frequency.setValueAtTime(300, t);
    swirl.frequency.exponentialRampToValueAtTime(1800, t + 0.4);
    swirl.frequency.exponentialRampToValueAtTime(250, t + duration);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(2.5, t + 0.15);   // above 1 because the filter makes noise quiet
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    water.connect(swirl).connect(gain).connect(out);
    water.start(t);
    water.stop(t + duration);
  },

  // "Wah wah wah waaaah": four sad notes going down, the last one wobbles
  sadTrombone(ac, t, out) {
    const muffle = ac.createBiquadFilter();
    muffle.type = "lowpass";
    muffle.frequency.value = 1200;
    muffle.connect(out);

    const notes = [293.7, 277.2, 261.6, 246.9];
    notes.forEach((pitch, i) => {
      const last = i === notes.length - 1;
      const osc = tone(ac, t + i * 0.4, muffle, {
        type: "sawtooth", from: pitch, duration: last ? 1.1 : 0.36, volume: 0.35,
      });
      if (last) {
        // Wobble the last note up and down 6 times a second
        const wobbler = ac.createOscillator();
        const depth = ac.createGain();
        wobbler.frequency.value = 6;
        depth.gain.value = 6;
        wobbler.connect(depth).connect(osc.frequency);
        wobbler.start(t + i * 0.4);
        wobbler.stop(t + i * 0.4 + 1.15);
      }
    });
  },

  // A plain beep, handy for testing
  beep(ac, t, out) {
    tone(ac, t, out, { type: "square", from: 660, duration: 0.12, volume: 0.3 });
  },
};


/* ---------- Mute button ---------- */

function updateSoundButton() {
  const button = document.getElementById("soundBtn");
  button.textContent = muted ? "🔇" : "🔊";
  button.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
}

function toggleSound() {
  muted = !muted;
  try { localStorage.setItem(MUTED_KEY, muted ? "1" : "0"); } catch (e) {}
  updateSoundButton();
  if (!muted) playSound(CONFIG.sounds.catch);   // a little "plop" so you know it's on
}

document.getElementById("soundBtn").addEventListener("click", toggleSound);
updateSoundButton();
