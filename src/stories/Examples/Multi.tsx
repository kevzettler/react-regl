import React from 'react'
import regl, { ReglFrame } from '../../';

export const Multi = () => {
  return (
    <>
      <ReglFrame width={200} height={200} color={[0,1,0,1]}/>
      <ReglFrame width={200} height={200} color={[0,0,1,1]}/>
    </>
  );
}
