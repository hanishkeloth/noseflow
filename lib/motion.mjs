/** Frame-rate independent smoothing and calibrated, bounded face input. */
export const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));
export const damp = (current, target, dt, rate = 7) => current + (target - current) * (1 - Math.exp(-rate * Math.max(0, dt)));
export function faceInput(nose, center) {
  const deadZone = value => Math.abs(value) < 0.025 ? 0 : Math.sign(value) * (Math.abs(value) - 0.025);
  return {x: clamp(deadZone((center.x - nose.x) * 4)), y: clamp(deadZone((center.y - nose.y) * 4))};
}
export function safeFalUrl(value) {
  const url = new URL(value);
  if (url.origin !== 'https://queue.fal.run' || url.username || url.password) throw new Error('Unexpected fal response URL');
  return url.href;
}
