import React from 'react';
import { vec4 } from 'gl-matrix';
import regl, { ReglFrame } from '../'
import { Triangle } from './Triangle'
import { Cross } from './Cross'

export default {
  title: "Regl/2D",
}

export const BasicTriangle = () => {
  return (
    <ReglFrame
      width={600}
      height={500}
      color={[0.40625, 0.94921, 0.996, 1]}
    >
      <Triangle />
    </ReglFrame>
  );
};

export const AnimatedCross = () => {
  const backgroundColor: vec4 = [0.40625, 0.94921, 0.996, 1];
  return (
    <ReglFrame
      width={600}
      height={500}
      color={backgroundColor}
      onFrame={() => regl.clear({color: backgroundColor})}
    >
      <Cross />
    </ReglFrame>
  )
};
