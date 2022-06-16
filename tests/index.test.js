const CUE = require('../dist/cue-wasm.cjs');

const cueString1 = `
test: string
test: "test"
`;

test('parses cue to js object', async () => {
  const cue = await CUE.init();
  const result = cue.parse(cueString1);
  expect(result).toEqual({ test: "test" });
});
