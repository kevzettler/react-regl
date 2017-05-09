import test from 'tape';
import topDownDrawScopes from '../../src/util/topDownDrawScopes.js';
import Node from 'display-tree';
import sinon from 'sinon';

test('topDownDrawScopes', (t) => {
  t.equal(typeof topDownDrawScopes(), 'function', "it returns a function");

  
  t.test("a node with no children", (st) => {
    const drawFn = sinon.spy();
    const props = {
      cool: 'bro',
      drawCommand: drawFn
    };

    const tNode = Node(props);

    topDownDrawScopes(tNode)();

    st.equal(drawFn.callCount, 1, "should call its draw function");
    st.end();
  });
  

  t.end();
});
