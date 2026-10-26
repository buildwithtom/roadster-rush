// World units are tuned for the arcade camera. Mars uses 38% of the Earth
// gravity; scaling impulse by its square root preserves the reachable lift
// height while making the complete rise/fall arc about 1.62 times longer.
export const EARTH_FLIGHT = Object.freeze({
  gravity:920, impulse:-335, speed:190, spacing:440, spacingScale:1,
});
export const MARS_FLIGHT = Object.freeze({
  ...EARTH_FLIGHT,
  gravity:EARTH_FLIGHT.gravity*.38,
  impulse:EARTH_FLIGHT.impulse*Math.sqrt(.38),
  spacingScale:1.3,
});
