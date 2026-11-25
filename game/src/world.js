// Wok Rush — the rules of the kitchen. No drawing here: this file owns the orders, the
// stations, the chef's hands, the plates, the score and the dinner-rush ramp, and answers
// one question per frame: what happened when the world advanced by `dt` seconds.
import {
  BURN_AFTER_DONE, CHEF, FLOOR, INGREDIENTS, MAX_HANDS, MAX_HEARTS, RECIPES,
  SHIFT_SECONDS, STATIONS, orderTimeAt, ordersOpenAt, spawnIntervalAt,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_FAILED = 2;
export const EVENT_OVER = 4;
export const EVENT_COOKED = 8;
export const EVENT_BURNT = 16;

function stationSlot() {
  return { item: null, progress: 0, done: false, doneFor: 0, burnt: false };
}

export function createWorld(random, sound) {
  const state = {
    chef: { x: 640, y: 600, tx: null, ty: null, autoStation: null, facing: 1, walking: false },
    hands: [],
    orders: [],
    stations: { board: stationSlot(), wok: stationSlot(), pot: stationSlot(), grill: stationSlot() },
    plates: { plateA: { components: [] }, plateB: { components: [] } },
    score: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    served: 0,
    failed: 0,
    elapsed: 0,
    spawnIn: 2,
    over: false,
    won: false,
    popups: [],
    orderSerial: 0,
    sizzling: false,
  };

  function addPopup(x, y, text, color) {
    state.popups.push({ x, y, text, color, life: 1.4 });
  }

  function spawnOrder() {
    const recipe = random.pick(RECIPES);
    state.orderSerial += 1;
    state.orders.push({
      id: state.orderSerial,
      recipe,
      timeLeft: orderTimeAt(state.elapsed),
      timeMax: orderTimeAt(state.elapsed),
      ticked: false,
    });
  }

  function plateMatchesOrder(plate, order) {
    if (plate.components.length !== order.recipe.components.length) return false;
    const have = [...plate.components].sort().join(',');
    const want = [...order.recipe.components].sort().join(',');
    return have === want;
  }

  function matchingOrder(plate) {
    return state.orders.find((order) => plateMatchesOrder(plate, order)) ?? null;
  }

  function serveOrder(orderId, plateId) {
    const orderIndex = state.orders.findIndex((order) => order.id === orderId);
    if (orderIndex < 0) return null;
    const order = state.orders[orderIndex];
    const plate = state.plates[plateId];
    if (!plate || !plateMatchesOrder(plate, order)) return null;
    state.orders.splice(orderIndex, 1);
    plate.components = [];
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const timeBonus = Math.round(order.timeLeft) * 2;
    const points = (order.recipe.price + timeBonus) * state.combo;
    state.score += points;
    state.served += 1;
    const plateStation = STATIONS[plateId];
    addPopup(plateStation.x + plateStation.w / 2, plateStation.y - 12, `+${points}`, '#ffd94d');
    if (sound) sound.serve();
    return { points, combo: state.combo, name: order.recipe.name };
  }

  function nearestStation() {
    let best = null;
    let bestDistance = 120;
    for (const station of Object.values(STATIONS)) {
      const dx = state.chef.x - station.anchorX;
      const dy = state.chef.y - station.anchorY;
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) { bestDistance = distance; best = station; }
    }
    return best;
  }

  function takeFromHands(predicate) {
    const index = state.hands.findIndex(predicate);
    if (index < 0) return null;
    return state.hands.splice(index, 1)[0];
  }

  function interact() {
    const station = nearestStation();
    if (!station) return false;
    if (station.kind === 'pantry') return false; // pantry needs a chosen ingredient: click a crate or press 1-7
    if (station.kind === 'trash') {
      if (state.hands.length === 0) return false;
      state.hands = [];
      if (sound) sound.place();
      return true;
    }
    if (station.kind === 'plate') {
      const plate = state.plates[station.id];
      const cookedIndex = state.hands.findIndex((item) => item.kind === 'cooked');
      if (cookedIndex < 0) return false;
      const item = state.hands[cookedIndex];
      if (plate.components.includes(item.id) || plate.components.length >= 3) return false;
      plate.components.push(item.id);
      state.hands.splice(cookedIndex, 1);
      if (sound) sound.place();
      return true;
    }
    if (station.kind === 'serve') {
      for (const plateId of ['plateA', 'plateB']) {
        const order = matchingOrder(state.plates[plateId]);
        if (order) { serveOrder(order.id, plateId); return true; }
      }
      return false;
    }
    // Cooking stations: board, wok, pot, grill.
    const slot = state.stations[station.id];
    if (slot.item && slot.done) {
      if (state.hands.length >= MAX_HANDS) return false;
      state.hands.push(slot.item);
      state.stations[station.id] = stationSlot();
      if (sound) sound.pickup();
      return true;
    }
    if (slot.item) return false; // still cooking: wait for the ding
    const carried = state.hands.find((item) => item.kind === 'raw' && INGREDIENTS[item.id].station === station.id);
    if (!carried) return false;
    takeFromHands((item) => item === carried);
    state.stations[station.id] = { item: { kind: 'cooking', id: INGREDIENTS[carried.id].yields }, progress: 0, done: false, doneFor: 0, burnt: false };
    if (sound) sound.place();
    return true;
  }

  function pickIngredient(ingredientId) {
    const station = nearestStation();
    if (!station || station.id !== 'pantry') return false;
    if (state.hands.length >= MAX_HANDS) return false;
    if (!INGREDIENTS[ingredientId]) return false;
    state.hands.push({ kind: 'raw', id: ingredientId });
    if (sound) sound.pickup();
    return true;
  }

  function moveChef(dt, dirX, dirY) {
    const chef = state.chef;
    chef.walking = false;
    if (dirX !== 0 || dirY !== 0) {
      const length = Math.hypot(dirX, dirY);
      chef.x += (dirX / length) * CHEF.speed * dt;
      chef.y += (dirY / length) * CHEF.speed * dt;
      chef.tx = null; chef.ty = null; chef.autoStation = null;
      chef.facing = dirX !== 0 ? Math.sign(dirX) : chef.facing;
      chef.walking = true;
    } else if (chef.tx !== null && chef.ty !== null) {
      const dx = chef.tx - chef.x;
      const dy = chef.ty - chef.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 6) {
        chef.tx = null; chef.ty = null;
        if (chef.autoStation) {
          const station = chef.autoStation;
          chef.autoStation = null;
          if (station.id === 'pantry') return;
          interact();
        }
      } else {
        chef.x += (dx / distance) * CHEF.speed * dt;
        chef.y += (dy / distance) * CHEF.speed * dt;
        chef.facing = dx !== 0 ? Math.sign(dx) : chef.facing;
        chef.walking = true;
      }
    }
    chef.x = Math.min(FLOOR.x + FLOOR.w - CHEF.radius, Math.max(FLOOR.x + CHEF.radius, chef.x));
    chef.y = Math.min(FLOOR.y + FLOOR.h - CHEF.radius, Math.max(FLOOR.y + CHEF.radius, chef.y));
  }

  function step(dt, dirX, dirY) {
    let events = EVENT_NONE;
    if (state.over) return events;
    state.elapsed += dt;
    moveChef(dt, dirX, dirY);

    // Stations cook; a finished dish waits, then burns.
    let anySizzling = false;
    for (const [id, slot] of Object.entries(state.stations)) {
      if (!slot.item || slot.done) {
        if (slot.done && !slot.burnt) {
          slot.doneFor += dt;
          if (slot.doneFor > BURN_AFTER_DONE) {
            slot.burnt = true;
            slot.item = { kind: 'burnt', id: slot.item.id };
            events |= EVENT_BURNT;
            if (sound) sound.burnt();
          }
        }
        continue;
      }
      const station = STATIONS[id];
      slot.progress += dt / station.cookSeconds;
      if (id === 'wok') anySizzling = true;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        slot.item = { kind: 'cooked', id: slot.item.id };
        events |= EVENT_COOKED;
        if (sound) sound.ding();
      }
    }
    if (sound) {
      if (anySizzling && !state.sizzling) { sound.startSizzle(); state.sizzling = true; }
      if (!anySizzling && state.sizzling) { sound.stopSizzle(); state.sizzling = false; }
    }

    // Orders arrive on the rush's schedule and their timers run down.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0 && state.orders.length < ordersOpenAt(state.elapsed)) {
      spawnOrder();
      state.spawnIn = spawnIntervalAt(state.elapsed);
    }
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.timeLeft -= dt;
      if (order.timeLeft <= 10 && !order.ticked) { order.ticked = true; if (sound) sound.tick(); }
      if (order.timeLeft <= 0) {
        state.orders.splice(i, 1);
        state.hearts -= 1;
        state.failed += 1;
        state.combo = 0;
        events |= EVENT_FAILED;
        if (sound) sound.fail();
        if (state.hearts <= 0) {
          state.over = true;
          state.won = false;
          events |= EVENT_OVER;
        }
      }
    }
    if (state.elapsed >= SHIFT_SECONDS && !state.over) {
      state.over = true;
      state.won = true;
      state.score += 250;
      events |= EVENT_OVER;
    }
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      state.popups[i].life -= dt;
      state.popups[i].y -= 24 * dt;
      if (state.popups[i].life <= 0) state.popups.splice(i, 1);
    }
    return events;
  }

  function reset() {
    state.chef.x = 640; state.chef.y = 600;
    state.chef.tx = null; state.chef.ty = null; state.chef.autoStation = null;
    state.hands = [];
    state.orders = [];
    state.stations = { board: stationSlot(), wok: stationSlot(), pot: stationSlot(), grill: stationSlot() };
    state.plates = { plateA: { components: [] }, plateB: { components: [] } };
    state.score = 0; state.combo = 0; state.bestCombo = 0;
    state.hearts = MAX_HEARTS; state.served = 0; state.failed = 0;
    state.elapsed = 0; state.spawnIn = 2; state.over = false; state.won = false;
    state.popups = []; state.orderSerial = 0;
    if (sound) sound.stopSizzle();
    state.sizzling = false;
  }

  return {
    state, reset, step, interact, pickIngredient, serveOrder,
    nearestStation, matchingOrder, plateMatchesOrder, spawnOrder, addPopup,
  };
}
