import React from 'react'
import regl, { ReglFrame } from '../../'

const PentaGram = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

  attributes: {
    position: (new Array(5)).fill(0).map((x, i) => {
      var theta = 2.0 * Math.PI * i / 5
      return [ Math.sin(theta), Math.cos(theta) ]
    })
  },

  uniforms: {
    color: [1, 0, 0, 1]
  },

  elements: [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
    [3, 4]
  ],

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  }
});


export const Elements = () => {
  const backgroundColor: [number,number,number,number] = [0,0,0,1];
  return (
    <ReglFrame
      color={backgroundColor}
      onFrame={(context, regl) => regl.clear({color: backgroundColor})}
    >
      <PentaGram />
    </ReglFrame>
  );
}
