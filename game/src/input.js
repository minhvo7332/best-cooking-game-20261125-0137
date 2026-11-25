// Wok Rush — keyboard and mouse, read once per frame. Keys move the chef (WASD or arrows),
// E / Space works the nearest station, 1-7 grabs an ingredient at the pantry, S serves at
// the hatch, P pauses, M mutes. A mouse click sets a walk target; clicking a station walks
// the chef there and works it on arrival, clicking a pantry crate grabs that ingredient,
// clicking an order ticket serves it when a plate matches.
import { INGREDIENT_LIST, STATIONS } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_INTERACT = 4;
export const ACTION_SERVE = 8;

export function createInput(canvas, world, onPause) {
  const keys = new Set();
  let actions = 0;
  let click = null;
  let servedTicket = null;

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function stationAt(point) {
    for (const station of Object.values(STATIONS)) {
      if (point.x >= station.x && point.x <= station.x + station.w && point.y >= station.y && point.y <= station.y + station.h) return station;
    }
    return null;
  }

  function crateAt(point) {
    const pantry = STATIONS.pantry;
    if (point.y < pantry.y || point.y > pantry.y + pantry.h) return null;
    const crateWidth = pantry.w / INGREDIENT_LIST.length;
    const index = Math.floor((point.x - pantry.x) / crateWidth);
    if (index < 0 || index >= INGREDIENT_LIST.length) return null;
    return INGREDIENT_LIST[index];
  }

  function orderTicketAt(point) {
    if (point.y < 64 || point.y > 168) return null;
    const index = Math.floor((point.x - 16) / 304);
    if (index < 0 || index >= world.state.orders.length) return null;
    return world.state.orders[index];
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'Space' || event.code === 'Enter') { actions |= ACTION_CONFIRM; event.preventDefault(); }
    if (event.code === 'KeyE') actions |= ACTION_INTERACT;
    if (event.code === 'KeyQ') actions |= ACTION_SERVE;
    if (event.code === 'KeyP' || event.code === 'Escape') { actions |= ACTION_PAUSE; if (onPause) onPause(); }
    if (event.code === 'KeyM') actions |= 16;
    const digit = event.code.startsWith('Digit') ? event.code.slice(5) : null;
    if (digit) {
      const ingredient = INGREDIENT_LIST.find((item) => item.key === digit);
      if (ingredient) world.pickIngredient(ingredient.id);
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (event) => {
    const point = canvasPoint(event);
    click = point;
    const ticket = orderTicketAt(point);
    if (ticket) { servedTicket = ticket; return; }
    const crate = crateAt(point);
    if (crate) {
      const chef = world.state.chef;
      chef.tx = STATIONS.pantry.anchorX; chef.ty = STATIONS.pantry.anchorY;
      chef.autoStation = null;
      world.state.pendingCrate = crate.id;
      return;
    }
    const station = stationAt(point);
    if (station) {
      const chef = world.state.chef;
      chef.tx = station.anchorX; chef.ty = station.anchorY;
      chef.autoStation = station;
      return;
    }
    const chef = world.state.chef;
    chef.tx = point.x; chef.ty = point.y; chef.autoStation = null;
  });

  function direction() {
    let x = 0;
    let y = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
    return { x, y };
  }

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  function takeClick() {
    const taken = click;
    click = null;
    return taken;
  }

  function takeServedTicket() {
    const taken = servedTicket;
    servedTicket = null;
    return taken;
  }

  return { direction, takeActions, takeClick, takeServedTicket };
}
