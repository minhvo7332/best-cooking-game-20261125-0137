// Wok Rush — the screenshot scenes behind ?shot=cover|assembly|rush|serve. Each one sets
// the real game state to a moment a real shift reaches — orders on the board, food cooking,
// a plate mid-assembly — and the renderer paints it, so the frame is what the game itself
// looks like. The same seed always stages the same frame.
import { RECIPES } from './config.js';
import { SCREEN_PLAY } from './render.js';

function order(id, recipeIndex, timeLeft, timeMax) {
  const recipe = RECIPES[recipeIndex];
  return { id, recipe, timeLeft, timeMax, ticked: timeLeft <= 10 };
}

function stationItem(kind, id, progress, done) {
  return { item: { kind: done ? 'cooked' : 'cooking', id }, progress, done, doneFor: 0, burnt: false };
}

export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'assembly') {
    state.elapsed = 38;
    state.score = 260;
    state.combo = 2;
    state.orders = [order(1, 0, 52, 72), order(2, 3, 41, 68)];
    state.stations.board = stationItem('cooking', 'choppedVeg', 0.55, false);
    state.stations.wok = stationItem('cooking', 'friedEgg', 0.35, false);
    state.stations.pot = stationItem('cooked', 'boiledNoodle', 1, true);
    state.plates.plateA.components = ['boiledNoodle'];
    state.hands = [{ kind: 'raw', id: 'veg' }];
    state.chef.x = 620; state.chef.y = 480; state.chef.facing = 1;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'rush') {
    state.elapsed = 138;
    state.score = 1240;
    state.combo = 4;
    state.bestCombo = 4;
    state.hearts = 2;
    state.served = 9;
    state.orders = [
      order(7, 4, 9, 55), order(8, 1, 14, 52), order(9, 2, 21, 58), order(10, 6, 33, 60),
    ];
    state.stations.board = stationItem('cooked', 'choppedChili', 1, true);
    state.stations.wok = stationItem('cooking', 'friedEgg', 0.7, false);
    state.stations.pot = stationItem('cooking', 'boiledNoodle', 0.45, false);
    state.stations.grill = stationItem('cooked', 'grilledShrimp', 1, true);
    state.plates.plateA.components = ['boiledNoodle', 'choppedVeg'];
    state.plates.plateB.components = ['grilledShrimp'];
    state.hands = [{ kind: 'cooked', id: 'grilledChicken' }, { kind: 'cooked', id: 'choppedVeg' }];
    state.chef.x = 1020; state.chef.y = 470; state.chef.facing = -1;
    return { screen: SCREEN_PLAY, best: 1240 };
  }
  if (name === 'serve') {
    state.elapsed = 74;
    state.score = 860;
    state.combo = 2;
    state.bestCombo = 3;
    state.served = 6;
    state.orders = [order(4, 0, 38, 70), order(5, 5, 47, 66)];
    state.plates.plateA.components = ['boiledNoodle', 'choppedVeg', 'friedEgg'];
    state.stations.wok = stationItem('cooking', 'friedEgg', 0.5, false);
    state.stations.pot = stationItem('cooked', 'boiledRice', 1, true);
    state.popups = [{ x: 982, y: 330, text: 'SERVED! +240', color: '#ffd94d', life: 1.4 }];
    state.chef.x = 880; state.chef.y = 500; state.chef.facing = 1;
    return { screen: SCREEN_PLAY, best: 860 };
  }
  // cover (default): the whole game in one frame — order board, ingredients on the counter,
  // a dish mid-assembly, a timer and a plate ready to serve.
  state.elapsed = 62;
  state.score = 480;
  state.combo = 3;
  state.bestCombo = 3;
  state.served = 4;
  state.orders = [order(3, 0, 44, 74), order(4, 1, 31, 70), order(5, 2, 19, 62)];
  state.stations.board = stationItem('cooked', 'choppedVeg', 1, true);
  state.stations.wok = stationItem('cooking', 'friedEgg', 0.6, false);
  state.stations.pot = stationItem('cooked', 'boiledNoodle', 1, true);
  state.plates.plateA.components = ['boiledNoodle', 'choppedVeg', 'friedEgg'];
  state.plates.plateB.components = ['boiledRice'];
  state.hands = [{ kind: 'cooked', id: 'grilledChicken' }];
  state.chef.x = 420; state.chef.y = 520; state.chef.facing = 1;
  return { screen: SCREEN_PLAY, best: 480 };
}
