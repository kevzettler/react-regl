const ReactRegl = require('../src/index.js');

test('exports a default component', () => {
  expect(ReactRegl.default).toBeTruthy()
})

test('exports a Draw component', () => {
  expect(ReactRegl.Draw).toBeTruthy()
})
