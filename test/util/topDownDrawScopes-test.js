import test from 'tape';
import topDownDrawScopes from '../../src/util/topDownDrawScopes.js';

test('topDownDrawScopes', (t) => {
  t.equal(typeof topDownDrawScopes(), 'function', "it returns a function");
  t.end();
});
