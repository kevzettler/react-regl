import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReglFrame } from '../../src/';
import { DrawTriangle } from '../../src/stories/Examples/Triangle';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <ReglFrame
    color={[0.40625, 0.94921, 0.996, 1]}>
    <DrawTriangle />
  </ReglFrame>
);
