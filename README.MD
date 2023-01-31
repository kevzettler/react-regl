# react-regl
This library enables [Regl](http://regl.party/) shader WebGL draw commands to be rendered directly as React components.

[![Stability](https://img.shields.io/badge/Stability-Experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![npm version](https://badge.fury.io/js/react-regl.svg)](https://badge.fury.io/js/react-regl)
[![Dependency Status](https://david-dm.org/kevzettler/react-regl.svg)](https://david-dm.org/kevzettler/react-regl)
[![Build Status](https://travis-ci.org/kevzettler/react-regl.svg?branch=master)](https://travis-ci.org/kevzettler/react-regl)

## Demos
[View demos in the Storybook](https://kevzettler.com/react-regl)

There is a [React Storybook](https://storybook.js.org/) included in the `/docs` directory with usage examples. The source for the Storybook is in the [`/stories`](./src/stories) directory and demonstrates how to create the examples.

Visit the [Regl gallery page](http://regl.party/examples) for more ideas on usage.

## Install
Use your perferred package manager
```javascript
npm install --save react-regl
```

### Example Usage

```
import React from 'react'
import regl, { ReglFrame } from 'react-regl';

// Define a draw call for rendering a 2D triangle
const Triangle = regl({
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

// Create an 'App' component that renders a regl frame and
// renders the triangle draw call
const App = () => {
  return (
    <ReglFrame>
      <Triangle color={[1, 0, 0, 1]} />
    </ReglFrame>
  );
};

// Mount React and render the App component
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Design Goals
This libaray was developed as a byproduct of using regl for an HTML5 game engine rendering layer. The game engine has many views that render 3D content. Some of the game engine views have to be high performance with as little over head as possible like the realtime gameplay view. Other views are less performance demanding and are used for stateful UI e.g. inventory, store, character select views.

**This libaray enables developers to write shader code in a regl syntax style and then seamlesssly execute it as a regular regl command or a ract component.**

This library brings a JSX interface to `regl`, enabling easy integration of Regl UI into existing `react` projects. `react-regl` Allows you to render regl draw commands as react components. You can define the regl draw command as you would with raw `regl` but with `react-regl` you can pass arnd render it as react component.

This library was inspired by a discussion in the main regl repository: https://github.com/regl-project/regl/issues/576

### Caveats
This library uses some magic to 'deferr' WebGL resource and context creation. This library is not a 1-to-1 match with base regl functionality. There are some cases of breakage with the regl examples.

### Alternative libraries
Because of the Caveats mentioned above we have feel compled to mention alternative libraries. `@psycobolt/react-regl` is a purely React focused regl reconciler which seems to 100% cover the example cases of the base regl library.
https://github.com/psychobolt/react-regl

Worldview is a higher level 3D engine (think Three.js or Babylon.js) abstraction on top of regl with corporate backing from Crusie self driving.
https://webviz.io/worldview/#/

### Regl vs Other WebGL frameworks
Regl follows the unix philosophy of "small sharp tools" or "do one thing and do it well". Regl has full test coverage and aims for stable non-breaking updates. Other popular WebGL frameworks encompass much more responsiblity, usually including heavy abstractions for: scene graphs, animation systems, input systems, and cross device compatibility. The large amount of responsiblity in these other libraries leads to unstable, breaking releases, and lacking documentation and support.

learn more in the official [Why Regl?](https://github.com/regl-project/regl#why-regl) documentation.

## Development
This repo is using yarn. You can build the module with `yarn build` Then in a seperate project you can require the dependency with a local file path like `yarn add ../path/to/react-regl`


#### Publishing

publish to npm with the version command and `patch` `minor` `major` or explicit tag `4.0.0-beta.2`
```
npm version
```

`npm version` will create a git tag that needs to be pushed..
```
git push --tags

```
