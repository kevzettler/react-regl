import React from 'react'
import regl, { ReglFrame } from '../../'
import bunny from 'bunny';
import { mat4, vec4 } from 'gl-matrix';

export const Bunny = () => {
  const backgroundColor: vec4 = [0.40625, 0.94921, 0.996, 1];
  const Camera = regl({
    id: "Camera",
    uniforms: {
      view: ({ tick }) => {
        const t = 0.01 * tick
        return mat4.lookAt(
          mat4.create(),
          [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
          [0, 2.5, 0],
          [0, 1, 0]
        )
      },
      projection: ({ viewportWidth, viewportHeight }) =>
        mat4.perspective(
          mat4.create(),
          Math.PI / 4,
          viewportWidth / viewportHeight,
          0.01,
          1000
        )
    }
  });


  const Bunny = regl({
    id: "Bunny",
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

  return (
    <ReglFrame
      color={backgroundColor}
      onFrame={() => regl.clear({color: backgroundColor, depth: 1})}>
      <Camera>
        <Bunny/>
      </Camera>
    </ReglFrame>
  );
}
