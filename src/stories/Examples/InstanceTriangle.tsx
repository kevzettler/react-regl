import React from 'react'
import regl, { ReglFrame } from '../../'


const N = 10 // N triangles on the width, N triangles on the height.

const angle: number[] = [];

for (var i = 0; i < N * N; i++) {
  // generate random initial angle.
  angle[i] = Math.random() * (2 * Math.PI)
}

// This buffer stores the angles of all
// the instanced triangles.
const angleBuffer = regl.buffer({
  length: angle.length * 4,
  type: 'float',
  usage: 'dynamic'
})

const Triangle = regl({
  frag: `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  // These three are instanced attributes.
  attribute vec3 color;
  attribute vec2 offset;
  attribute float angle;
  varying vec3 vColor;
  void main() {
    gl_Position = vec4(
      cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    vColor = color;
  }`,

  attributes: {
    position: [[0.0, -0.05], [-0.05, 0.0], [0.05, 0.05]],

    offset: {
      buffer: regl.buffer(
        Array(N * N).fill(0).map((_, i) => {
          var x = -1 + 2 * Math.floor(i / N) / N + 0.1
          var y = -1 + 2 * (i % N) / N + 0.1
          return [x, y]
        })),
      divisor: 1 // one separate offset for every triangle.
    },

    color: {
      buffer: regl.buffer(
        Array(N * N).fill(0).map((_, i) => {
          var r = Math.floor(i / N) / N
          var g = (i % N) / N
          return [r, g, r * g + 0.2]
        })),
      divisor: 1 // one separate color for every triangle
    },

    angle: {
      buffer: () => {
        // rotate the triangles every frame.
        for (var i = 0; i < N * N; i++) {
          angle[i] += 0.01
        }

        angleBuffer.subdata(angle)
        return angleBuffer()
      },
      divisor: 1 // one separate angle for every triangle
    }
  },

  depth: {
    enable: false
  },

  // Every triangle is just three vertices.
  // However, every such triangle are drawn N * N times,
  // through instancing.
  count: 3,
  instances: N * N
})

function onFrame(context, regl){
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

export const InstancedTriangle = () => {
  return (
    <ReglFrame
      onFrame={onFrame}
      extensions={['angle_instanced_arrays']}
    >
      <Triangle />
    </ReglFrame>
  );
}
