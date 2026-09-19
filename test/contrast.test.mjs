import test from 'node:test';
import assert from 'node:assert/strict';
const luminance = hex => {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
};
const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05); };
const pairs = [
  ['main text', '#17324d', '#ffffff', 4.5], ['main on canvas', '#17324d', '#f4f7f9', 4.5],
  ['secondary text', '#46586a', '#ffffff', 4.5], ['secondary on canvas', '#46586a', '#f4f7f9', 4.5],
  ['primary button', '#ffffff', '#234f78', 4.5], ['primary hover', '#ffffff', '#173b5d', 4.5],
  ['disabled primary', '#ffffff', '#46586a', 4.5], ['disabled secondary', '#46586a', '#e3e9ee', 4.5],
  ['secondary hover', '#17324d', '#e8eff5', 4.5], ['active navigation', '#234f78', '#e6eef5', 4.5],
  ['placeholder', '#52677b', '#ffffff', 4.5], ['input border', '#657b90', '#ffffff', 3],
  ['focus on canvas', '#075da8', '#f4f7f9', 3], ['focus on white', '#075da8', '#ffffff', 3],
  ['error text', '#793b15', '#fff2e8', 4.5], ['error hover', '#793b15', '#fbe3d1', 4.5],
  ['error border', '#9b4818', '#fff2e8', 3], ['notice', '#17324d', '#edf3f8', 4.5],
  ['link hover', '#234f78', '#edf3f8', 4.5], ['due cue', '#234f78', '#ffffff', 4.5],
];
test('Daywell text, control, warning and focus palette meets contrast thresholds', () => {
  for (const [name, foreground, background, required] of pairs) {
    const ratio = contrast(foreground, background);
    assert.ok(ratio >= required, `${name}: ${ratio.toFixed(2)} must be at least ${required}`);
    console.log(`${name}: ${ratio.toFixed(2)}:1`);
  }
});
