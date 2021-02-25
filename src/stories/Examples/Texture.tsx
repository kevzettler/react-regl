import React from 'react'
import regl, { ReglFrame } from '../../';
import baboonImage from 'baboon-image'

const Baboon = regl({
  frag: `
  precision mediump float;
  uniform sampler2D texture;
  varying vec2 uv;
  void main () {
    gl_FragColor = texture2D(texture, uv);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }`,

  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2]
  },

  uniforms: {
    texture: regl.texture(baboonImage)
  },

  count: 3
})

export const Texture = () => {
  return (
    <ReglFrame>
      <Baboon />
    </ReglFrame>
  );
};
