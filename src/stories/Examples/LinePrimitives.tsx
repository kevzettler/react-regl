import React from 'react'
import regl, { ReglFrame } from '../../'
import { mat4 } from 'gl-matrix'
import createRng from 'seedrandom'

const rng = createRng('my_seed')

const Global = regl({
  uniforms: {
    tick: ({tick}) => tick,
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      ),
    view: mat4.lookAt(
      mat4.create(),
      [2.1, 0, 1.3],
      [0, 0.0, 0],
      [0, 0, 1]
    )
  },
  frag: `
  precision mediump float;
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  uniform mat4 projection, view;
  uniform float scale;
  uniform vec2 offset;
  uniform float tick;
  uniform float phase;
  uniform float freq;
  void main() {
    vec2 p  = position;
    // scale
    p *= scale;
    // rotate
    float phi = tick * freq + phase;
    p = vec2(
      dot(vec2(+cos(phi), -sin(phi)), p),
      dot(vec2(+sin(phi), +cos(phi)), p)
    );
    // translate
    p += offset;
    gl_Position = projection * view * vec4(p, 0, 1);
  }`
})

// TODO
// The lineWidth fns are ineffciant and should be set as a constant.
// there is a discrpency on regl.limits between regl and deferred-regl
// regl.limits is not set untill the regl inst has been initalized

//
// square
//
const squareVerts = [[-1, -1], [+1, -1], [+1, +1], [-1, +1]];
const Square = regl({
  uniforms:{
    color: [1, 0.1, 0.3],
    scale: 0.25,
    offset: [-0.7, 0.0],
    phase: 0.0,
    freq: 0.01,
  },

  attributes:{
    position: squareVerts
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  count: squareVerts.length,
  primitive: 'line loop'
})

function makeCircle (N:number) { // where N is tesselation degree.
  return Array(N).fill(0).map((_, i) => {
    var phi = 2 * Math.PI * (i / N)
    return [Math.cos(phi), Math.sin(phi)]
  })
}

//
// triangle
//
const triVerts = makeCircle(3)
const Triangle = regl({
  uniforms:{
    color: [0.2, 0.8, 0.3],
    scale: 0.25,
    offset: [-0.7, 0.7],
    phase: 0.8,
    freq: -0.014,
  },

  attributes: {
    position: triVerts
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  count: triVerts.length,
  primitive: 'line loop',
})

//
// hexagon
//
const hexVerts = makeCircle(6);
const Hexagon = regl({
  uniforms:{
    color: [0.7, 0.3, 0.9],
    scale: 0.25,
    offset: [0.0, 0.7],
    phase: 0.6,
    freq: 0.009,
  },

  attributes:{
    position: makeCircle(6)
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  count: hexVerts.length,
  primitive: 'line loop',
})


// star-shaped thingy
let N = 30
const starVerts = Array(N).fill(0).map((_, i) => {
  var phi = 2 * Math.PI * (i / N)
  var A = 1.0 + 0.15 * Math.sin(phi * 70.0)
  return [A * Math.cos(phi), A * Math.sin(phi)]
});

const Star = regl({
  uniforms:{
    color: [0.3, 0.6, 0.8],
    scale: 0.25,
    offset: [0.7, 0.7],
    phase: 0.6,
    freq: -0.011,
  },

  attributes:{
    position: starVerts,
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  count: starVerts.length,
  primitive: 'line loop'
});

// rock-like shape
N = 70

const rockVerts = Array(N).fill(0).map((_, i) => {
  var phi = 2 * Math.PI * (i / N)
  var A = 1.0 + 0.15 * rng()
  return [A * Math.cos(phi), A * Math.sin(phi)]
});

const Rock = regl({
  uniforms:{
    color: [0.7, 0.8, 0.4],
    scale: 0.25,
    offset: [0.7, 0.0],
    phase: 0.6,
    freq: 0.012,
  },

  attributes: {
    position: rockVerts
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  count: rockVerts.length,
  primitive: 'line loop',
})

// draw a spiral.
N = 120
const spiralVerts = Array(N).fill(0).map((_, i) => {
  var phi = 2 * Math.PI * (i / N)
  phi *= 5.0
  var A = 0.03
  return [A * (Math.cos(phi) + phi * Math.sin(phi)), A * (Math.sin(phi) - phi * Math.cos(phi))]
});

const Spiral = regl({
  uniforms:{
    color: [0.3, 0.8, 0.76],
    scale: 0.25,
    offset: [0.0, 0.0],
    phase: 0.6,
    freq: 0.015,
  },

  attributes: {
    position: spiralVerts
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  primitive: 'line strip',
  count: spiralVerts.length,
});

// make a rose curve.
// see the wikipedia article for more info:
// https://en.wikipedia.org/wiki/Rose_(mathematics)
N = 300
const roseVert = Array(N).fill(0).map((_, i) => {
  var phi = 2 * Math.PI * (i / N)
  phi *= 5.0
  var A = 1.0
  var n = 5.0
  var d = 4.0
  var k = n / d
  return [A * (Math.cos(k * phi) * Math.cos(phi)), A * (Math.cos(k * phi) * Math.sin(phi))]
});

const Rose = regl({
  uniforms:{
    color: [1.0, 1.0, 1.0],
    scale: 0.25,
    offset: [0.7, -0.6],
    phase: 0.6,
    freq: -0.011,
  },

  attributes: {
    position: roseVert
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  primitive: 'line strip',
  count: roseVert.length
})

// draw sine curve.
N = 70
var n = 5.0
const sineVert = Array(N).fill(0).map((_, i) => {
  var phi = -Math.PI * n + 2 * Math.PI * n * (i / N)
  var A = 0.5
  return [A * Math.sin(phi), -(0.9) + 1.8 * (i / N)]
});
const Sine = regl({
  uniforms:{
    color: [1, 0.7, 0.2],
    scale: 0.25,
    offset: [0.0, -0.6],
    phase: 0.6,
    freq: 0.015,
  },
  attributes: {
    position: sineVert
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  primitive: 'line strip',
  count: sineVert.length
})

// fading out sine curve
N = 20
n = 5.0
const fadeVerts = Array(N).fill(0).map((_, i) => {
  var phi = -Math.PI * n + 2 * Math.PI * n * (i / N)
  var A = 0.5 * (i / N)
  return [A * Math.sin(phi), -1 + 2 * (i / N)]
});

const Fade = regl({
  uniforms:{
    color: [0.9, 0.2, 0.6],
    scale: 0.25,
    offset: [-0.7, -0.6],
    phase: 0.3,
    freq: -0.01,
  },

  attributes:{
    position: fadeVerts
  },

  lineWidth: () => {
    var lineWidth = 3
    if (lineWidth > regl.limits.lineWidthDims[1]) {
      lineWidth = regl.limits.lineWidthDims[1]
    }

    return lineWidth
  },
  primitive: 'line strip',
  count: fadeVerts.length,
});

export const LinePrimitives = () => {
  return(
    <ReglFrame
      onFrame={() => regl.clear({
        color: [0,0,0,1],
        depth: 1
      })}>
      <Global>
        <Square />
        <Triangle/>
        <Hexagon />
        <Star />
        <Rock />
        <Spiral />
        <Rose />
        <Sine />
        <Fade />
      </Global>
    </ReglFrame>
  );
};
