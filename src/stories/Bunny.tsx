import regl from '../'
import bunny from 'bunny';
import { mat4 } from 'gl-matrix';

export const Bunny = regl({
  vert:`
             precision mediump float;
             attribute vec3 position;
             uniform mat4 model, view, projection;
             void main() {
                 gl_Position = projection * view * model * vec4(position, 1);
             }`,

  frag:`
              precision mediump float;
              void main() {
                  gl_FragColor = vec4(1, 1, 1, 1);
              }`,

  elements: bunny.cells,

  attributes:{
    position: bunny.positions
  },

  uniforms:{
    model: mat4.identity(mat4.create())
  }
});
