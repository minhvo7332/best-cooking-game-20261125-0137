// Wok Rush — boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between four screens:
// title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=cover|assembly|rush|serve (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createSound } from './audio.js';
import { createWorld, EVENT_OVER } from './world.js';
import { ACTION_CONFIRM, ACTION_INTERACT, ACTION_PAUSE, ACTION_SERVE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const sound = createSound();
const world = createWorld(createRandom(seed), sound);
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    world.state.nearestStationForPrompt = null;
    renderer.draw(world.state, scene.screen, scene.best, 1.2);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  const input = createInput(canvas, world, () => {
    if (screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
  });

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    sound.unlock();
    announce('Playing. Three hearts. Serve every order before its timer runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(world.state.won
      ? `Shift complete. Score ${world.state.score}. Best ${best}.`
      : `Shift over. Score ${world.state.score}. Best ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
    else if (actions & ACTION_PAUSE && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    else if (screen === SCREEN_PLAY && (actions & ACTION_INTERACT)) world.interact();
    else if (screen === SCREEN_PLAY && (actions & ACTION_SERVE)) {
      for (const plateId of ['plateA', 'plateB']) {
        const order = world.matchingOrder(world.state.plates[plateId]);
        if (order) { world.serveOrder(order.id, plateId); break; }
      }
    }
    if (actions & 16) {
      const muted = sound.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    const ticket = input.takeServedTicket();
    if (ticket && screen === SCREEN_PLAY) {
      for (const plateId of ['plateA', 'plateB']) {
        if (world.plateMatchesOrder(world.state.plates[plateId], ticket)) {
          world.serveOrder(ticket.id, plateId);
          break;
        }
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_PLAY) {
      const direction = input.direction();
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        const events = world.step(STEP, direction.x, direction.y);
        accumulator -= STEP;
        if (events & EVENT_OVER) endGame();
      }
      // A clicked pantry crate is grabbed once the chef reaches the pantry.
      const pending = world.state.pendingCrate;
      if (pending && screen === SCREEN_PLAY) {
        const chef = world.state.chef;
        if (Math.hypot(chef.x - 286, chef.y - 480) < 120) {
          world.state.pendingCrate = null;
          world.pickIngredient(pending);
        }
      }
    } else {
      accumulator = 0;
    }
    world.state.nearestStationForPrompt = screen === SCREEN_PLAY ? world.nearestStation() : null;
    renderer.draw(world.state, screen, best, now / 1000);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Wok Rush. Press Space or click to start the shift.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
