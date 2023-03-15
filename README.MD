# react-regl
This library enables [Regl](http://regl.party/) shader WebGL draw commands to be rendered directly as React components.

[![Stability](https://img.shields.io/badge/Stability-Experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![npm version](https://badge.fury.io/js/react-regl.svg)](https://badge.fury.io/js/react-regl)
[![Build Status](https://travis-ci.org/kevzettler/react-regl.svg?branch=master)](https://travis-ci.org/kevzettler/react-regl)

## Demos
[View demos in the Storybook](https://kevzettler.com/react-regl)

There is a [React Storybook](https://storybook.js.org/) included in the `/docs` directory with usage examples. The source for the Storybook is in the [`/stories`](./src/stories) directory and demonstrates how to create the examples.

Visit the [Regl gallery page](http://regl.party/examples) for more ideas on usage.

## Install
Use your perferred package manager

### npm
```
npm install --save react-regl
```

### yarn
```
yarn add react-regl
```

### Example Usage
There is a test app that demonstrates both modes of ussage in `./react-regl-test-app`

#### Triangle.js
```javascript
// Define a draw call for rendering a 2D triangle
const DrawTriangle = regl({
  // Shaders in regl are just strings.  You can use glslify or whatever you want
  // to define them.  No need to manually create shader objects.

  vert: `
          precision mediump float;
          attribute vec2 position;
          void main () {
            gl_Position = vec4(position, 0, 1);
          }`,

  frag:`
          precision mediump float;
          uniform vec4 color;
          void main () {
            gl_FragColor = color;
          }`,

  // Here we define the vertex attributes for the above shader
  attributes:{
    position: [
      [-1, 0],
      [0, -1],
      [1, 1]
    ]
    // regl automatically infers sane defaults for the vertex attribute pointers
  },

  uniforms:{
    // This defines a dynamic regl value that can bethat can be passed as a react prop
    color: regl.prop('color')
  },

  // This tells regl the number of vertices to draw in this command
  count: 3
});

export default DrawTriangle;
```

#### use in React App
```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReglFrame } from 'react-regl';
import { DrawTriangle } from './DrawTriangle';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <ReglFrame
    color={[0.40625, 0.94921, 0.996, 1]}>
    <DrawTriangle />
  </ReglFrame>
);
```

#### use in Standalone (Non-react) App
```javascript
import reglInit from "regl";
import reactRegl from "react-regl";
import { DrawTriangle } from './DrawTriangle';

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

// create a regl scope reference
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
DrawTriangle();

```

## Design Goals
This libaray was developed as a byproduct of using regl for an HTML5 game engine rendering layer. The game engine has many views that render 3D content. Some of the game engine views need to be high performance with as little over head as possible like the realtime gameplay view. Other views are less performance demanding and are used for stateful UI e.g. inventory, store, character select views.

**This libaray enables developers to write shader code in a Regl syntax style and then seamlesssly execute it as a regular Regl command or a React component.**

This library brings a JSX interface to `regl`, enabling easy integration of Regl UI into existing `react` projects. `react-regl` Allows you to render regl draw commands as React components. You can define the Regl draw command as you would with raw `regl` but with `react-regl` you can pass and render it as React component.

This library was inspired by a discussion in the main regl repository: https://github.com/regl-project/regl/issues/576

### Caveats
This library uses some magic to 'deferr' WebGL resource and context creation. This library is not a 1-to-1 match with base regl functionality. There are some cases of breakage with the regl examples.

### Alternative libraries
Because of the Caveats mentioned above we feel compled to mention alternative libraries. `@psycobolt/react-regl` is a purely React focused regl reconciler which seems to 100% cover the example cases of the base regl library.
https://github.com/psychobolt/react-regl

Worldview is a higher level 3D engine (think Three.js or Babylon.js) abstraction on top of Regl with corporate backing from Crusie self driving.
https://webviz.io/worldview/#/

### Regl vs Other WebGL frameworks
Regl follows the unix philosophy of "small sharp tools" or "do one thing and do it well". Regl has full test coverage and aims for stable non-breaking updates. Other popular WebGL frameworks encompass much more responsiblity, usually including heavy abstractions for: scene graphs, animation systems, input systems, and cross device compatibility. The large amount of responsiblity in these other libraries leads to unstable, breaking releases, and lacking documentation and support.

learn more in the official [Why Regl?](https://github.com/regl-project/regl#why-regl) documentation.

## Development
This repo is using yarn. You can build the module with `yarn build` Then in a seperate project you can require the dependency with a local file path like `yarn add ../path/to/react-regl`


#### Publishing

publish to npm with the version command and `patch` `minor` `major`, and `pre` versions or explicit tag `4.0.0-beta.2`
```
npm version prerelease
```

`npm version` will create a git tag that needs to be pushed..
```
git push --tags

```
