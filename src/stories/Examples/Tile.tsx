import React from 'react'
import regl, { ReglFrame } from '../../';
import mouseHandle from 'mouse-change';
import { PNG } from "pngjs";
import { vec4 } from 'gl-matrix'
import map from '../assets/map.json'
import tileBuffer from '../assets/tiles.png'
const tilePNG = PNG.sync.read(Buffer.from(tileBuffer))

let mouse;

const tiles = regl.texture({
  width: tilePNG.width,
  height: tilePNG.height,
  data: tilePNG.data
});

const Background = regl({
  frag: `
      precision mediump float;
      uniform sampler2D map, tiles;
      uniform vec2 mapSize, tileSize;
      varying vec2 uv;
      void main() {
        vec2 tileCoord = floor(255.0 * texture2D(map, floor(uv) / mapSize).ra);
        gl_FragColor = texture2D(tiles, (tileCoord + fract(uv)) / tileSize);
      }`,

  vert: `
      precision mediump float;
      attribute vec2 position;
      uniform vec4 view;
      varying vec2 uv;
      void main() {
        uv = mix(view.xw, view.zy, 0.5 * (1.0 + position));
        gl_Position = vec4(position, 1, 1);
      }`,

  depth: { enable: false },

  uniforms: {
    tiles,
    tileSize: [16.0, 16.0],
    map: regl.texture(map),
    mapSize: [map[0].length, map.length],
    view: (({viewportWidth, viewportHeight}) => {
      if(!mouse) return vec4.create();
      const {x, y} = mouse
      const boxX = map[0].length * x / viewportWidth
      const boxY = map.length * y / viewportHeight
      const boxH = 10
      const boxW = viewportWidth / viewportHeight * boxH

      return [
        boxX - 0.5 * boxW,
        boxY - 0.5 * boxH,
        boxX + 0.5 * boxW,
        boxY + 0.5 * boxH
      ]
    })
  },

  attributes: {
    position: [ -1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1 ]
  },

  count: 6
})



export const Tile = () => {
  React.useEffect(() => {
    mouse = mouseHandle();
  }, [])

  return (
    <ReglFrame onFrame={(context, regl) => {
      regl.clear({
        color: [0,1,0,1]
      })
    }}>
      <Background/>
    </ReglFrame>
  );
}
