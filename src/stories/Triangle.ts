import regl from '../';
export const Triangle = regl({
  vert: `
          precision mediump float;
          attribute vec2 position;
          void main () {
            gl_Position = vec4(position, 0, 1);
          }`,

  frag:`
          precision mediump float;
          uniform vec4 color;
          void main () {
            gl_FragColor = color;
          }`,
  attributes:{
    position: [
      [-1, 0],
      [0, -1],
      [1, 1]
    ]
  },
  uniforms:{
    color: [1, 0, 0, 1]
  },
  count: 3
});
