// Visual choice only: no random draws, flight changes, or extra hazards.
// Sampling the current light level at spawn gradually mixes species at dusk
// and dawn. The chosen appearance is stored on the obstacle for its lifetime.
export function birdAppearanceAt(night, wave) {
  const amount=Math.max(0,Math.min(1,night));
  const sample=((wave*.61803398875)%1+1)%1;
  return amount>=1||(amount>0&&sample<amount)?'bat':'crow';
}
