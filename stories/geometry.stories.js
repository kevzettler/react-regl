import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';

import Regl, { Draw } from '../src/';
import bunny from 'bunny';
import { mat4 } from 'gl-matrix';

const projectionUniform = ({viewportWidth, viewportHeight}) => {
  return mat4.perspective([],
                          Math.PI / 4,
                          viewportWidth / viewportHeight,
                          0.01,
                          1000);
};

const viewUniform = ({tick}) => {
  const t = 0.01 * tick
  return mat4.lookAt([],
                     [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
                     [0, 2.5, 0],
                     [0, 1, 0])
};

storiesOf('Geometry', module)
  .add('Bunny', () => {
    return (
      <Regl
        width={window.innerWidth}
        height={window.innerHeight}
        color={[0,0,0,1]}
        >
        <Draw
          vert={`
             precision mediump float;
             attribute vec3 position;
             uniform mat4 model, view, projection;
             void main() {
                 gl_Position = projection * view * model * vec4(position, 1);
             }`
          }

          frag={`
          precision mediump float;
  void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
          }`}

          elements={bunny.cells}

          attributes={{
            position: bunny.positions
          }}

          uniforms={{
            model: mat4.identity([]),
            projection: projectionUniform,
            view: viewUniform
          }}
          />
      </Regl>
    );
  });
