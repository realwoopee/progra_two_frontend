export const delay = (delayInms) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
};

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);

}

export function getRandomIntFromRange(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
