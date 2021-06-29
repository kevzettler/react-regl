import React from 'react'
import regl, { ReglFrame } from '../../'
import mouseHandle from 'mouse-change';

const mouse = mouseHandle()
const pixels = regl.texture()

const DrawFeedback = regl({
  frag: `
  precision mediump float;
  uniform sampler2D texture;
  uniform vec2 mouse;
  uniform float t;
  varying vec2 uv;
  void main () {
    float dist = length(gl_FragCoord.xy - mouse);
    gl_FragColor = vec4(0.98 * texture2D(texture,
      uv + cos(t) * vec2(0.5 - uv.y, uv.x - 0.5) - sin(2.0 * t) * (uv - 0.5)).rgb, 1) +
      exp(-0.01 * dist) * vec4(
        1.0 + cos(2.0 * t),
        1.0 + cos(2.0 * t + 1.5),
        1.0 + cos(2.0 * t + 3.0),
        0.0);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,

  attributes: {
    position: [
      -2, 0,
      0, -2,
      2, 2]
  },

  uniforms: {
    texture: (context) => {
      pixels()({copy: true})
      return pixels();
    },
    mouse: ({pixelRatio, viewportHeight}) => [
      mouse.x * pixelRatio,
      viewportHeight - mouse.y * pixelRatio
    ],
    t: ({tick}) => 0.01 * tick
  },

  count: 3
})

export const Feedback = () => {
  return (
    <ReglFrame
      onFrame={(context) => {
        regl.clear({color: [0,0,0,1]})
        DrawFeedback();
        pixels()({copy: true})
      }}>
    </ReglFrame>
  );
}
