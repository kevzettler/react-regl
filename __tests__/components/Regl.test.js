import React from 'react';
import Regl from '../../src/index.js';

it('should render a canvas', () => {
  expect(render(<Regl width={500} height={400} />)).toMatchSnapshot();
})
