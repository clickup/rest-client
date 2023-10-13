export default function toFloatMs(elapsed: [number, number]) {
  return elapsed[0] * 1e3 + elapsed[1] / 1e6;
}
