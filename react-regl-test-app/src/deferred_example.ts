import reglInit from "regl";
import reactRegl from "../../src";
import { BasicTriangle } from '../../src/stories/Examples/Triangle';

// Create a canvas
const canvas = document.createElement('canvas');
canvas.id = 'gameplay-canvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);

// create a gl context
const gl = canvas.getContext("webgl", {
  alpha: false,
  antialias: false,
  stencil: false,
  preserveDrawingBuffer: false
});

// create a regl reference
const reglRef = reglInit({
  gl,
});

// pass the regl reference to reactRegl
reactRegl.setRegl(reglRef);

reglRef.clear({
  color: [0.40625, 0.94921, 0.996, 1],
  depth: 1
});

// render react regl components
BasicTriangle();
