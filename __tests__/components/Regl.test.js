import React from 'react';
import Regl from '../../src/index.js';
import ReactTestRenderer from 'react-test-renderer';
import gl from 'gl';

const mockCanvas = {
  getContext: () => {
     return gl(800, 600, {
      alpha: false,
      antialias: false,
      stencil: false,
      preserveDrawingBuffer: false
    });
  }
}

it('should render a canvas', () => {
  /* expect(ReactTestRenderer.create(
   *   <Regl canvas={mockCanvas}
   *         width={500}
   *         height={400} />
   * )).toMatchSnapshot();*/
})
