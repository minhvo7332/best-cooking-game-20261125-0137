// Wok Rush: night-market cooking game — every tuning number and layout constant.
// One file, one job: the numbers. The rules live in world.js, the drawing in render.js.
export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const MAX_HANDS = 2;
export const MAX_ORDERS = 4;
export const BURN_AFTER_DONE = 8;
export const BEST_KEY = 'wok-rush-best';

// Stations and what each one accepts. `cookSeconds` is the time a placed item needs.
export const STATIONS = {
  pantry: { id: 'pantry', name: 'Pantry', kind: 'pantry', x: 16, y: 196, w: 540, h: 108, anchorX: 286, anchorY: 480 },
  board: { id: 'board', name: 'Chopping Board', kind: 'board', x: 576, y: 196, w: 132, h: 108, anchorX: 642, anchorY: 480, cookSeconds: 2.0 },
  wok: { id: 'wok', name: 'Wok', kind: 'wok', x: 724, y: 196, w: 132, h: 108, anchorX: 790, anchorY: 480, cookSeconds: 3.0 },
  pot: { id: 'pot', name: 'Stock Pot', kind: 'pot', x: 872, y: 196, w: 132, h: 108, anchorX: 938, anchorY: 480, cookSeconds: 4.0 },
  grill: { id: 'grill', name: 'Charcoal Grill', kind: 'grill', x: 1020, y: 196, w: 132, h: 108, anchorX: 1086, anchorY: 480, cookSeconds: 4.0 },
  trash: { id: 'trash', name: 'Scrap Bin', kind: 'trash', x: 1168, y: 196, w: 96, h: 108, anchorX: 1216, anchorY: 480 },
  plateA: { id: 'plateA', name: 'Plating Counter', kind: 'plate', x: 40, y: 336, w: 300, h: 96, anchorX: 190, anchorY: 480 },
  plateB: { id: 'plateB', name: 'Plating Counter', kind: 'plate', x: 360, y: 336, w: 300, h: 96, anchorX: 510, anchorY: 480 },
  serve: { id: 'serve', name: 'Serving Hatch', kind: 'serve', x: 700, y: 336, w: 564, h: 96, anchorX: 982, anchorY: 480 },
};
export const STATION_LIST = Object.values(STATIONS);
export const CHEF = { radius: 22, speed: 260 };
export const FLOOR = { x: 16, y: 452, w: 1248, h: 240 };

// Raw ingredients. `station` is where the raw item is cooked; `yields` is the cooked component.
export const INGREDIENTS = {
  noodle: { id: 'noodle', name: 'Noodles', color: '#f2c14e', station: 'pot', yields: 'boiledNoodle', key: '1' },
  rice: { id: 'rice', name: 'Rice', color: '#f5efe0', station: 'pot', yields: 'boiledRice', key: '2' },
  chicken: { id: 'chicken', name: 'Chicken', color: '#f2a0a0', station: 'grill', yields: 'grilledChicken', key: '3' },
  shrimp: { id: 'shrimp', name: 'Shrimp', color: '#ff9a5c', station: 'grill', yields: 'grilledShrimp', key: '4' },
  veg: { id: 'veg', name: 'Greens', color: '#7bc96f', station: 'board', yields: 'choppedVeg', key: '5' },
  egg: { id: 'egg', name: 'Egg', color: '#ffe9a8', station: 'wok', yields: 'friedEgg', key: '6' },
  chili: { id: 'chili', name: 'Chili', color: '#e5484d', station: 'board', yields: 'choppedChili', key: '7' },
};
export const INGREDIENT_LIST = Object.values(INGREDIENTS);

// Cooked components, keyed by what the stations yield.
export const COMPONENTS = {
  boiledNoodle: { id: 'boiledNoodle', name: 'Noodles', color: '#f2c14e', from: 'noodle' },
  boiledRice: { id: 'boiledRice', name: 'Rice', color: '#f5efe0', from: 'rice' },
  grilledChicken: { id: 'grilledChicken', name: 'Chicken', color: '#d97b4f', from: 'chicken' },
  grilledShrimp: { id: 'grilledShrimp', name: 'Shrimp', color: '#ff7a3d', from: 'shrimp' },
  choppedVeg: { id: 'choppedVeg', name: 'Greens', color: '#7bc96f', from: 'veg' },
  friedEgg: { id: 'friedEgg', name: 'Egg', color: '#ffd94d', from: 'egg' },
  choppedChili: { id: 'choppedChili', name: 'Chili', color: '#e5484d', from: 'chili' },
};

// Seven recipes: each one combines three cooked components in a different way, so every
// order sends the cook on a different route through the kitchen.
export const RECIPES = [
  { id: 'stirfry-noodles', name: 'Stir-Fry Noodles', price: 120, components: ['boiledNoodle', 'choppedVeg', 'friedEgg'] },
  { id: 'chicken-rice', name: 'Hainan Chicken Rice', price: 130, components: ['boiledRice', 'grilledChicken', 'choppedVeg'] },
  { id: 'garlic-shrimp', name: 'Garlic Chili Shrimp', price: 140, components: ['grilledShrimp', 'choppedVeg', 'choppedChili'] },
  { id: 'veggie-rice', name: 'Veggie Fried Rice', price: 110, components: ['boiledRice', 'choppedVeg', 'friedEgg'] },
  { id: 'spicy-soup', name: 'Spicy Noodle Soup', price: 150, components: ['boiledNoodle', 'grilledShrimp', 'choppedChili'] },
  { id: 'egg-noodles', name: 'Egg Fried Noodles', price: 115, components: ['boiledNoodle', 'friedEgg', 'choppedChili'] },
  { id: 'chicken-noodles', name: 'Chicken Noodles', price: 135, components: ['boiledNoodle', 'grilledChicken', 'choppedVeg'] },
];

// The dinner rush ramps: orders arrive faster and their timers shrink as the shift goes on.
export function spawnIntervalAt(elapsed) {
  return Math.max(8, 15 - elapsed / 25);
}
export function orderTimeAt(elapsed) {
  return Math.max(50, 78 - elapsed / 6);
}
export function ordersOpenAt(elapsed) {
  return elapsed < 60 ? 2 : elapsed < 120 ? 3 : MAX_ORDERS;
}
