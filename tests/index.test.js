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

test('parses cue tagged template to js object', async () => {
  const cue = await CUE.init();
  const result = cue`
    tagged: "template"
  `;
  expect(result).toEqual({ tagged: "template" });
});

test('parses cue tagged with int interpolation to js object', async () => {
  const cue = await CUE.init();
  const result = cue`
    tagged: int
    tagged: ${1}
  `;
  expect(result).toEqual({ tagged: 1 });
});

test('parses cue tagged with string interpolation to js object', async () => {
  const cue = await CUE.init();
  const result = cue`
    tagged: string
    tagged: "${"test"}"
  `;
  expect(result).toEqual({ tagged: "test" });
});

test('parses cue tagged with obj interpolation to js object', async () => {
  const cue = await CUE.init();
  const result = cue`
    tagged: string
    ${{tagged: "test"}}
  `;
  expect(result).toEqual({ tagged: "test" });
});

test('parses list of cue strings to js object', async () => {
  const cue = await CUE.init();
  const result = cue.parse([cueString1, cueString2]);
  expect(result).toEqual({ test: "test", hello: "world" });
});

// Perf tests
// https://github.com/cue-lang/cue/wiki/Creating-test-or-performance-reproducers
// TODO: provide slim/full bundles, this doesn't pass with tinygo
test('parses cue golden file', async () => {
  const cue = await CUE.init();
  const result = cue`
  #A: {
    a: string
    // when using tinygo, breaks with: *a | string
  }

  s: [Name=string]: #A & {
      a: Name
  }

  s: bar: _

  foo: [
      for _, a in s if a.a != _|_ {a},
  ]
  `;

  console.log(result)
  expect(result).toEqual({ s: { bar: { a: 'bar' } }, foo: [ { a: 'bar' } ] });
});
