const cue = require('../lib');

console.log(cue);

const cueString1 = `
test: string
test: "test"
`;

test('parses cue to js object', async () => {
  const result = await cue.parse(cueString1);
  expect(result).toEqual({ test: "test" });
});
