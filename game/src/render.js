// Wok Rush — everything the player sees, painted on one canvas. No images: the night
// market, the food and the chef are all drawn here in code, so the screenshots are renders
// of this file. Screens: title, play, paused, game over.
import { COMPONENTS, INGREDIENTS, INGREDIENT_LIST, RECIPES, SHIFT_SECONDS, STATIONS, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const INK = '#2b1d16';
const CREAM = '#fff6e3';
const GOLD = '#ffb703';
const RED = '#c1121f';
const TEAL = '#0f3d3e';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

// One drawn icon per ingredient, shared by raw items, cooked components and order chips.
export function drawIngredientIcon(ctx, id, x, y, size) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'noodle' || id === 'boiledNoodle') {
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = size / 7; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-half + 2, i * size / 4);
      ctx.bezierCurveTo(-half / 2, i * size / 4 - 4, 0, i * size / 4 + 4, half - 2, i * size / 4);
      ctx.stroke();
    }
  } else if (id === 'rice' || id === 'boiledRice') {
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath(); ctx.arc(0, 2, half - 2, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#e8ddc0';
    for (let i = 0; i < 5; i += 1) { ctx.beginPath(); ctx.arc(-half + 6 + i * 6, -2, 2, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'chicken' || id === 'grilledChicken') {
    ctx.fillStyle = id === 'chicken' ? '#f2a0a0' : '#d97b4f';
    ctx.beginPath(); ctx.ellipse(-2, 2, half - 2, half - 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff6e3'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(half - 6, -half + 6); ctx.lineTo(half + 2, -half - 2); ctx.stroke();
    ctx.fillStyle = '#fff6e3';
    ctx.beginPath(); ctx.arc(half + 3, -half - 2, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'shrimp' || id === 'grilledShrimp') {
    ctx.strokeStyle = id === 'shrimp' ? '#ff9a5c' : '#ff7a3d'; ctx.lineWidth = size / 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 2, half - 4, Math.PI * 0.15, Math.PI * 1.7); ctx.stroke();
    ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.arc(-half + 5, -2, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'veg' || id === 'choppedVeg') {
    ctx.fillStyle = '#7bc96f';
    for (const angle of [0, 1.1, 2.2]) {
      ctx.save(); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0, -half + 7, 5, half - 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#4e9a44'; ctx.beginPath(); ctx.arc(0, 2, 4, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'egg' || id === 'friedEgg') {
    ctx.fillStyle = '#fff6e3';
    ctx.beginPath(); ctx.ellipse(0, 0, half - 1, half - 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.arc(0, 1, half / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffdf6b'; ctx.beginPath(); ctx.arc(-2, -1, half / 4, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chili' || id === 'choppedChili') {
    ctx.strokeStyle = '#e5484d'; ctx.lineWidth = size / 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-half + 3, -half / 2); ctx.quadraticCurveTo(0, half, half - 3, -half / 3); ctx.stroke();
    ctx.strokeStyle = '#4e9a44'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-half + 3, -half / 2); ctx.lineTo(-half + 8, -half - 1); ctx.stroke();
  }
  ctx.restore();
}

function drawTimerBar(ctx, x, y, w, fraction) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, x, y, w, 10, 5); ctx.fill();
  const color = fraction > 0.5 ? '#7bc96f' : fraction > 0.25 ? '#ffb703' : '#e5484d';
  ctx.fillStyle = color;
  roundRect(ctx, x, y, Math.max(10, w * fraction), 10, 5); ctx.fill();
}

function drawOrderTicket(ctx, order, x, y, w, h, now, plateMatch) {
  const urgent = order.timeLeft < 12;
  const pulse = urgent ? 0.75 + 0.25 * Math.sin(now * 6) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = plateMatch ? '#e9f9d8' : '#fff6e3';
  roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.lineWidth = plateMatch ? 4 : 2;
  ctx.strokeStyle = plateMatch ? '#4e9a44' : urgent ? '#e5484d' : '#d9a441';
  ctx.stroke();
  ctx.restore();
  text(ctx, `#${order.id}  ${order.recipe.name}`, x + 12, y + 20, 17, INK);
  text(ctx, `$${order.recipe.price}`, x + w - 12, y + 20, 17, '#8a6d1f', 'right');
  order.recipe.components.forEach((componentId, index) => {
    const chipX = x + 12 + index * 92;
    const component = COMPONENTS[componentId];
    ctx.fillStyle = '#f3e3c2';
    roundRect(ctx, chipX, y + 36, 84, 40, 8); ctx.fill();
    drawIngredientIcon(ctx, componentId, chipX + 18, y + 56, 26);
    text(ctx, component.name, chipX + 34, y + 57, 12, INK);
  });
  drawTimerBar(ctx, x + 12, y + 84, w - 24, Math.max(0, order.timeLeft / order.timeMax));
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 12, y + 100, 13, urgent ? '#e5484d' : '#6b543a', 'right');
  if (plateMatch) text(ctx, 'READY — click to serve!', x + 12, y + 100, 13, '#2f7a2f');
}

function drawOrderBoard(ctx, state, now) {
  text(ctx, 'ORDER BOARD', 16, 72, 13, '#ffb703', 'left', '800');
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(130, 68, 1114, 2);
  state.orders.forEach((order, index) => {
    const plateMatch = ['plateA', 'plateB'].some((plateId) => {
      const plate = state.plates[plateId];
      if (plate.components.length !== order.recipe.components.length) return false;
      return [...plate.components].sort().join(',') === [...order.recipe.components].sort().join(',');
    });
    drawOrderTicket(ctx, order, 16 + index * 304, 82, 296, 112, now, plateMatch);
  });
  if (state.orders.length === 0) {
    text(ctx, 'No orders yet — the dinner rush is about to begin…', 640, 140, 16, '#ffe9b0', 'center');
  }
}

function drawPantry(ctx, state, now) {
  const pantry = STATIONS.pantry;
  ctx.fillStyle = '#8a5a2b';
  roundRect(ctx, pantry.x, pantry.y, pantry.w, pantry.h, 10); ctx.fill();
  ctx.fillStyle = '#6f4520';
  roundRect(ctx, pantry.x, pantry.y, pantry.w, 26, 10); ctx.fill();
  text(ctx, 'PANTRY — click a crate or press 1–7', pantry.x + 12, pantry.y + 13, 13, '#ffe9b0');
  const crateWidth = pantry.w / INGREDIENT_LIST.length;
  INGREDIENT_LIST.forEach((ingredient, index) => {
    const cx = pantry.x + index * crateWidth;
    ctx.fillStyle = index % 2 === 0 ? '#a06a33' : '#96622e';
    roundRect(ctx, cx + 4, pantry.y + 32, crateWidth - 8, 68, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
    roundRect(ctx, cx + 4, pantry.y + 32, crateWidth - 8, 68, 8); ctx.stroke();
    drawIngredientIcon(ctx, ingredient.id, cx + crateWidth / 2, pantry.y + 62, 34);
    text(ctx, ingredient.name, cx + crateWidth / 2, pantry.y + 88, 11, '#fff6e3', 'center');
    text(ctx, ingredient.key, cx + crateWidth - 12, pantry.y + 42, 11, '#ffd94d', 'right');
  });
}

function drawSteam(ctx, x, y, now, amount) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < amount; i += 1) {
    const phase = (now * 0.7 + i * 0.4) % 1;
    const sx = x + Math.sin((now + i) * 2.4) * 6 - 12 + i * 10;
    const sy = y - phase * 34;
    ctx.globalAlpha = 0.55 * (1 - phase);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 5, sy - 6, sx - 2, sy - 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCookingStation(ctx, state, station, now) {
  const slot = state.stations[station.id];
  const colors = { board: '#b08954', wok: '#3a3a44', pot: '#5b6b7a', grill: '#4a3b32' };
  ctx.fillStyle = colors[station.id] ?? '#888';
  roundRect(ctx, station.x, station.y, station.w, station.h, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, station.x, station.y, station.w, 22, 10); ctx.fill();
  text(ctx, station.name.toUpperCase(), station.x + station.w / 2, station.y + 12, 11, '#ffe9b0', 'center', '800');
  if (station.id === 'wok') {
    ctx.fillStyle = '#1d1d22';
    ctx.beginPath(); ctx.ellipse(station.x + station.w / 2, station.y + 66, 44, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(station.x + station.w / 2, station.y + 66, 36, 11, 0, 0, Math.PI * 2); ctx.stroke();
    if (slot.item) drawSteam(ctx, station.x + station.w / 2, station.y + 44, now, 3);
  } else if (station.id === 'pot') {
    ctx.fillStyle = '#2f3e4d';
    ctx.beginPath(); ctx.ellipse(station.x + station.w / 2, station.y + 64, 42, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7fb3d5';
    ctx.beginPath(); ctx.ellipse(station.x + station.w / 2, station.y + 62, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
    if (slot.item) drawSteam(ctx, station.x + station.w / 2, station.y + 44, now, 2);
  } else if (station.id === 'grill') {
    ctx.strokeStyle = '#2b1d16'; ctx.lineWidth = 4;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath(); ctx.moveTo(station.x + 18, station.y + 52 + i * 8); ctx.lineTo(station.x + station.w - 18, station.y + 52 + i * 8); ctx.stroke();
    }
    ctx.fillStyle = '#ff7a3d';
    const flicker = 0.6 + 0.4 * Math.sin(now * 9);
    ctx.globalAlpha = flicker;
    ctx.beginPath(); ctx.ellipse(station.x + station.w / 2, station.y + 88, 30, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (station.id === 'board') {
    ctx.fillStyle = '#e8c98f';
    roundRect(ctx, station.x + 16, station.y + 44, station.w - 32, 48, 6); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
    roundRect(ctx, station.x + 16, station.y + 44, station.w - 32, 48, 6); ctx.stroke();
  }
  if (slot.item) {
    const iconY = station.id === 'board' ? station.y + 68 : station.y + 60;
    drawIngredientIcon(ctx, slot.item.id, station.x + station.w / 2, iconY, 40);
    if (slot.burnt) {
      text(ctx, 'BURNT!', station.x + station.w / 2, station.y + 100, 13, '#ff6b5e', 'center', '800');
    } else if (slot.done) {
      text(ctx, 'READY ✓', station.x + station.w / 2, station.y + 100, 13, '#7bc96f', 'center', '800');
    } else {
      drawTimerBar(ctx, station.x + 14, station.y + 96, station.w - 28, slot.progress);
    }
  } else {
    text(ctx, 'empty', station.x + station.w / 2, station.y + 100, 11, 'rgba(255,246,227,0.6)', 'center');
  }
}

function drawPlatingCounter(ctx, state, station) {
  const plate = state.plates[station.id];
  ctx.fillStyle = '#7a4a22';
  roundRect(ctx, station.x, station.y, station.w, station.h, 10); ctx.fill();
  ctx.fillStyle = '#96622e';
  roundRect(ctx, station.x, station.y, station.w, 20, 10); ctx.fill();
  text(ctx, station.id === 'plateA' ? 'PLATE 1' : 'PLATE 2', station.x + 12, station.y + 11, 11, '#ffe9b0', 'left', '800');
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath(); ctx.ellipse(station.x + 66, station.y + 58, 52, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d9c9a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(station.x + 66, station.y + 58, 52, 30, 0, 0, Math.PI * 2); ctx.stroke();
  plate.components.forEach((componentId, index) => {
    drawIngredientIcon(ctx, componentId, station.x + 36 + index * 30, station.y + 58, 26);
  });
  if (plate.components.length === 0) text(ctx, 'empty plate', station.x + station.w - 12, station.y + 58, 12, 'rgba(255,246,227,0.65)', 'right');
  else text(ctx, `${plate.components.length}/3 on the plate`, station.x + station.w - 12, station.y + 58, 12, '#ffe9b0', 'right');
}

function drawServingHatch(ctx, state, now) {
  const hatch = STATIONS.serve;
  const anyReady = ['plateA', 'plateB'].some((plateId) => {
    const plate = state.plates[plateId];
    return state.orders.some((order) => plate.components.length === order.recipe.components.length
      && [...plate.components].sort().join(',') === [...order.recipe.components].sort().join(','));
  });
  const glow = anyReady ? 0.6 + 0.4 * Math.sin(now * 5) : 0;
  ctx.save();
  if (anyReady) { ctx.shadowColor = '#7bc96f'; ctx.shadowBlur = 24 * glow; }
  ctx.fillStyle = anyReady ? '#2f7a2f' : '#5b3a1e';
  roundRect(ctx, hatch.x, hatch.y, hatch.w, hatch.h, 10); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#3a2410';
  roundRect(ctx, hatch.x + 12, hatch.y + 30, hatch.w - 24, 54, 8); ctx.fill();
  text(ctx, 'SERVING HATCH', hatch.x + 24, hatch.y + 15, 13, '#ffe9b0', 'left', '800');
  if (anyReady) text(ctx, 'ORDER READY — press Q or click the ticket to serve!', hatch.x + hatch.w / 2, hatch.y + 58, 17, '#b8f0a0', 'center', '800');
  else text(ctx, 'Hungry customers wait here…', hatch.x + hatch.w / 2, hatch.y + 58, 14, 'rgba(255,246,227,0.7)', 'center');
  const trash = STATIONS.trash;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 10); ctx.fill();
  text(ctx, 'SCRAP', trash.x + trash.w / 2, trash.y + 14, 11, '#ffe9b0', 'center', '800');
  text(ctx, 'BIN', trash.x + trash.w / 2, trash.y + 58, 16, '#cfc4b0', 'center', '800');
}

function drawChef(ctx, state, now) {
  const chef = state.chef;
  const bob = chef.walking ? Math.sin(now * 12) * 2 : Math.sin(now * 2) * 1;
  const x = chef.x;
  const y = chef.y + bob;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x, chef.y + 26, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Body: white apron over a red shirt.
  ctx.fillStyle = '#c1121f';
  roundRect(ctx, x - 18, y - 6, 36, 34, 10); ctx.fill();
  ctx.fillStyle = '#fff6e3';
  roundRect(ctx, x - 13, y + 2, 26, 26, 8); ctx.fill();
  // Head and tall chef's hat.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); ctx.arc(x, y - 18, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6e3';
  ctx.beginPath(); ctx.ellipse(x, y - 30, 15, 9, 0, Math.PI, 0); ctx.fill();
  roundRect(ctx, x - 15, y - 38, 30, 12, 5); ctx.fill();
  // Eyes look where the chef faces.
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(x - 5 + chef.facing * 2, y - 19, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5 + chef.facing * 2, y - 19, 1.8, 0, Math.PI * 2); ctx.fill();
  // Carried items float above the hat.
  state.hands.forEach((item, index) => {
    const hx = x - 16 + index * 32;
    const hy = y - 56;
    ctx.fillStyle = item.kind === 'burnt' ? '#3a2c22' : 'rgba(255,246,227,0.9)';
    ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2; ctx.stroke();
    if (item.kind === 'burnt') text(ctx, '✕', hx, hy, 14, '#ff6b5e', 'center', '800');
    else drawIngredientIcon(ctx, item.id, hx, hy, 22);
  });
  ctx.restore();
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, VIEW.width, 56);
  text(ctx, '🍳 WOK RUSH', 16, 28, 26, GOLD, 'left', '800');
  text(ctx, 'night-market dinner rush', 252, 30, 14, '#ffe9b0');
  const remain = Math.max(0, SHIFT_SECONDS - state.elapsed);
  const minutes = Math.floor(remain / 60);
  const seconds = Math.floor(remain % 60).toString().padStart(2, '0');
  text(ctx, `SHIFT ${minutes}:${seconds}`, 640, 28, 20, remain < 30 ? '#ff6b5e' : CREAM, 'center', '800');
  text(ctx, `SCORE ${state.score}`, 900, 28, 20, CREAM, 'center', '800');
  if (state.combo > 1) text(ctx, `COMBO ×${state.combo}`, 1040, 28, 18, GOLD, 'center', '800');
  let hearts = '';
  for (let i = 0; i < 3; i += 1) hearts += i < state.hearts ? '♥ ' : '♡ ';
  text(ctx, hearts, 1264, 28, 20, '#ff6b7a', 'right');
}

function drawKitchenBackdrop(ctx, now) {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  gradient.addColorStop(0, '#123a3b');
  gradient.addColorStop(0.45, '#1d4a3a');
  gradient.addColorStop(1, '#2a1f16');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Festival string lights across the top.
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 58);
  ctx.quadraticCurveTo(640, 96, 1280, 58);
  ctx.stroke();
  const bulbColors = ['#ffd94d', '#ff6b5e', '#7bc96f', '#ffb703'];
  for (let i = 0; i < 24; i += 1) {
    const t = i / 23;
    const x = t * 1280;
    const y = 58 + Math.sin(t * Math.PI) * 34;
    ctx.fillStyle = bulbColors[i % bulbColors.length];
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(now * 3 + i);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Tiled floor, a woven rug where the chef works, and crates stacked at the sides.
  ctx.fillStyle = '#3a2c20';
  ctx.fillRect(0, 452, VIEW.width, 268);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 1280; x += 80) { ctx.beginPath(); ctx.moveTo(x, 452); ctx.lineTo(x, 720); ctx.stroke(); }
  for (let y = 452; y <= 720; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath(); ctx.ellipse(640, 610, 300, 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(640, 610, 300, 70, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(640, 610, 240, 50, 0, 0, Math.PI * 2); ctx.stroke();
  for (const crateX of [48, 1180]) {
    ctx.fillStyle = '#8a5a2b';
    roundRect(ctx, crateX, 620, 56, 56, 6); ctx.fill();
    ctx.strokeStyle = '#6f4520'; ctx.lineWidth = 2;
    roundRect(ctx, crateX, 620, 56, 56, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(crateX, 648); ctx.lineTo(crateX + 56, 648); ctx.stroke();
  }
}

function drawPrompt(ctx, state) {
  const station = state.nearestStationForPrompt;
  if (!station || state.over) return;
  let hint = '';
  if (station.kind === 'pantry') hint = 'Click a crate, or press 1–7 to grab an ingredient';
  else if (station.kind === 'trash') hint = 'Press E to throw away what you carry';
  else if (station.kind === 'plate') hint = 'Press E to add a cooked item to the plate';
  else if (station.kind === 'serve') hint = 'Press Q to serve a finished plate';
  else {
    const slot = state.stations[station.id];
    if (slot.item && slot.done) hint = `Press E to pick up the ${slot.item.id}`;
    else if (slot.item) hint = `${station.name} is cooking…`;
    else hint = `Press E to put a matching ingredient in the ${station.name}`;
  }
  if (!hint) return;
  text(ctx, hint, 640, 700, 14, '#ffe9b0', 'center');
}

function drawPopups(ctx, state) {
  for (const popup of state.popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, popup.life));
    text(ctx, popup.text, popup.x, popup.y, 22, popup.color, 'center', '800');
  }
  ctx.globalAlpha = 1;
}

function drawTitleScreen(ctx, best) {
  ctx.fillStyle = 'rgba(10,20,20,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, '🍳 WOK RUSH', 640, 210, 72, GOLD, 'center', '800');
  text(ctx, 'Chop, fry and plate orders through a night-market dinner rush', 640, 268, 22, CREAM, 'center');
  text(ctx, 'WASD / arrows to run  •  E to work a station  •  1–7 to grab ingredients', 640, 330, 17, '#ffe9b0', 'center');
  text(ctx, 'Click a station to walk there  •  Q to serve  •  P to pause  •  M to mute', 640, 360, 17, '#ffe9b0', 'center');
  text(ctx, 'Cook each order before its timer runs out. Burnt food goes in the scrap bin.', 640, 392, 16, '#ffb703', 'center');
  text(ctx, 'Press SPACE or click to start the shift', 640, 470, 22, '#7bc96f', 'center', '800');
  if (best > 0) text(ctx, `Best score: ${best}`, 640, 512, 16, CREAM, 'center');
}

function drawGameOverScreen(ctx, state, best) {
  ctx.fillStyle = 'rgba(10,20,20,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, state.won ? 'SHIFT COMPLETE!' : 'SHIFT OVER', 640, 250, 56, state.won ? GOLD : '#ff6b5e', 'center', '800');
  text(ctx, state.won ? 'You survived the dinner rush!' : 'The customers walked away hungry…', 640, 310, 20, CREAM, 'center');
  text(ctx, `Score ${state.score}   •   Dishes served ${state.served}   •   Best combo ×${state.bestCombo}`, 640, 370, 20, '#ffe9b0', 'center');
  text(ctx, `Best score: ${best}`, 640, 410, 18, CREAM, 'center');
  text(ctx, 'Press SPACE or click to cook again', 640, 480, 20, '#7bc96f', 'center', '800');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  function draw(state, screen, best, now) {
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    drawKitchenBackdrop(ctx, now);
    drawTopBar(ctx, state);
    drawOrderBoard(ctx, state, now);
    drawPantry(ctx, state, now);
    for (const id of ['board', 'wok', 'pot', 'grill']) drawCookingStation(ctx, state, STATIONS[id], now);
    drawPlatingCounter(ctx, state, STATIONS.plateA);
    drawPlatingCounter(ctx, state, STATIONS.plateB);
    drawServingHatch(ctx, state, now);
    drawChef(ctx, state, now);
    drawPopups(ctx, state);
    if (screen === SCREEN_TITLE) drawTitleScreen(ctx, best);
    else if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(10,20,20,0.55)';
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      text(ctx, 'PAUSED', 640, 340, 48, CREAM, 'center', '800');
      text(ctx, 'Press P to keep cooking', 640, 400, 18, '#ffe9b0', 'center');
    } else if (screen === SCREEN_OVER) drawGameOverScreen(ctx, state, best);
    else drawPrompt(ctx, state);
  }
  return { draw };
}
