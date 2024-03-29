/**
 * @template T
 * @param {T[]} array
 * @returns The array in a random order
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
/**
 * @template T
 * @param {T[]} array
 * @returns A random element from the array
 */
export function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
