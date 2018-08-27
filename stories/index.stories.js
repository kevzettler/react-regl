import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs';
import Regl, { Draw } from '../src/';

const colorRange = {
  range: true,
  min: 0,
  max: 1,
  step: 0.1
};


storiesOf('Infrastructure', module)
  .addDecorator(withKnobs)
  .add('Regl Component', () => {
    return (
      <Regl width={number('Width', 400)}
            height={number('Height', 200)}
            color={[
              number('R', 0.40625, colorRange),
              number('G', 0.94921, colorRange),
              number('B', 0.996, colorRange),
              1]}
      />
    );
  })
  .add('Draw Component', () => {
    return (
      <Regl
        width={window.innerWidth}
        height={window.innerHeight}
        color={[0,0,0,1]}
        >
        <Draw
          vert={`
          precision mediump float;
          attribute vec2 position;
          void main () {
            gl_Position = vec4(position, 0, 1);
          }`}

          frag={`
          precision mediump float;
          uniform vec4 color;
          void main () {
            gl_FragColor = color;
          }`}

          attributes={{
            position: [
              [-1, 0],
              [0, -1],
              [1, 1]
            ]
          }}
          uniforms={{
            color: [1, 0, 0, 1]
          }}
          count={3}
          />
      </Regl>
    )
  });
