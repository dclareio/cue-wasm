const CUE = require('../dist/cue-wasm.cjs');

const cueString1 = `
test: string
test: "test"
`;

const cueString2 = `
hello: string
hello: "world"
`;

test('parses cue to js object', async () => {
  const cue = await CUE.init();
  const result = cue.parse(cueString1);
  expect(result).toEqual({ test: "test" });
});

test('parses list of cue strings to js object', async () => {
  const cue = await CUE.init();
  const result = cue.parse([cueString1, cueString2]);
  expect(result).toEqual({ test: "test", hello: "world" });
});
