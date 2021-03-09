import React from 'react'
import regl, { ReglFrame } from '../../';

const Scope = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(position + offset, 0, 1);
    }`,

  attributes: {
    position: [
      0.5, 0,
      0, 0.5,
      1, 1]
  },

  count: 3
});

const Child1 = regl({
  uniforms: {
    color: [1, 0, 0, 1],
    offset: [0, 0]
  }
});

const Child2 = regl({
  uniforms: {
    color: [0, 0, 1, 1],
    offset: [-1, 0]
  }
})

const Child3 = regl({
  uniforms: {
    color: [0, 1, 0, 1],
    offset: [0, -1]
  }
})

const Child4 = regl({
  uniforms: {
    color: [1, 1, 1, 1],
    offset: [-1, -1]
  }
})

export const Scopes = () => {
  return (
    <ReglFrame
      color={[0,0,0,1]}>
      <Scope>
        <Child1/>
        <Child2/>
        <Child3/>
        <Child4/>
      </Scope>
    </ReglFrame>
  );
};
