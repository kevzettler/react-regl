import regl, { ReglFrame } from '../../';
import { vec4 } from 'gl-matrix'
import { Buffer } from 'buffer';
import { PNG } from "pngjs";
import { mat4 } from 'gl-matrix';
import pepperArrayBuffer from '../static/peppers.png';

const pepperPNG =  PNG.sync.read(Buffer.from(pepperArrayBuffer));


var cubePosition = [
  [-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5], // positive z face.
  [+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], // positive x face
  [+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], // negative z face
  [-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], // negative x face.
  [-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5], // top face
  [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5]  // bottom face
];

var cubeUv = [
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive z face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive x face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative z face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative x face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // top face
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]  // bottom face
];

const cubeElements = [
  [2, 1, 0], [2, 0, 3],       // positive z face.
  [6, 5, 4], [6, 4, 7],       // positive x face.
  [10, 9, 8], [10, 8, 11],    // negative z face.
  [14, 13, 12], [14, 12, 15], // negative x face.
  [18, 17, 16], [18, 16, 19], // top face.
  [20, 21, 22], [23, 20, 22]  // bottom face
];

const Cube = regl({
  vert:`
             precision mediump float;
             attribute vec3 position;
             attribute vec2 uv;
             varying vec2 vUv;
             uniform mat4 projection, view;
             void main() {
               vUv = uv;
               gl_Position = projection * view * vec4(position, 1);
           }
  `,

  frag:`
           precision mediump float;
           varying vec2 vUv;
           uniform sampler2D tex;
           void main () {
             gl_FragColor = texture2D(tex,vUv);
           }
  `,

  elements: cubeElements,

  attributes:{
    position: cubePosition,
    uv: cubeUv
  },

  uniforms:{
    projection: ({viewportWidth, viewportHeight}) => {
      return mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        10)
    },

    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt(
        mat4.create(),
        [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)],
        [0, 0.0, 0],
        [0, 1, 0]
      )
    },

    tex: regl.texture({
      width: pepperPNG.width,
      height: pepperPNG.height,
      data: pepperPNG.data,
      mag: 'linear',
      min: 'linear'
    })
  }
});

export const TexturedCube = () => {
  const backgroundColor: vec4 = [0.40625, 0.94921, 0.996, 1];
  return (
    <ReglFrame
      color={[0.40625, 0.94921, 0.996, 1]}
      onFrame={() => regl.clear({color: backgroundColor, depth: 1})}
    >
      <Cube/>
    </ReglFrame>
  );
}
