// Wok Rush — a tiny seeded random source, so a screenshot seed always stages the same frame.
export function createRandom(seed) {
  let state = (seed >>> 0) || 1;
  function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  function intBelow(n) {
    return Math.floor(next() * n);
  }
  function pick(list) {
    return list[intBelow(list.length)];
  }
  return { next, intBelow, pick };
}
