# react-regl
This library enables [Regl](http://regl.party/) shader WebGL draw commands to be rendered directly as React components.

[![Stability](https://img.shields.io/badge/Stability-Experimental-orange.svg)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![npm version](https://badge.fury.io/js/react-regl.svg)](https://badge.fury.io/js/react-regl)
[![Dependency Status](https://david-dm.org/kevzettler/react-regl.svg)](https://david-dm.org/kevzettler/react-regl)
[![Build Status](https://travis-ci.org/kevzettler/react-regl.svg?branch=master)](https://travis-ci.org/kevzettler/react-regl)

## Demos
[View demos in the Storybook](https://kevzettler.com/react-regl)

There is a [React Storybook](https://storybook.js.org/) included in the `/docs` directory with usage examples. The source for the Storybook is in the [`/stories`](./stories) directory and demonstrates how to create the examples.

Visit the [Regl gallery page](http://regl.party/examples) for more ideas on usage.

## Install

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

### Motivation and Goals
This repo, `react-regl` brings a JSX interface to `regl`, enabling easy integration of Regl UI into existing `react` projects. `react-regl` Allows you to render regl draw commands as react components. You can define the regl draw command as you would with raw `regl` but with `react-regl` you can pass arnd render it as react component.

[regl](http://regl.party/) is a stateless functional abstraction for WebGl. Regl makes working with WebGL a more productive experience. Its stateless nature makes it easier to reason about WebGL programs. Regl's design was influenced by React. It follows React's unidirectional data flow to stateless component model. This module wraps Regl with a React reconciler for a fuller React experience


### Regl vs Other WebGL frameworks
Regl follows the unix philosophy of "small sharp tools" or "do one thing and do it well". Regl has full test coverage and aims for stable non-breaking updates. Other popular WebGL frameworks encompass much more responsiblity, usually including heavy abstractions for: scene graphs, animation systems, input systems, and cross device compatibility. The large amount of responsiblity in these other libraries leads to unstable, breaking releases, and lacking documentation and support.

## Development
`npm link` and local installs `npm i -S react-regl@file:../react-regl`
should link to consuming project. `npm run build` should be run in the `react-regl` module directory


### React peer dependency error

If default `npm link` or local install fails with od errors about duplicate react versions you need to ensure the module is loading react from the consuming host project

```
cd my-app
npm link ../react-regl
```

#### Link its copy of React back to the app's React
```
cd ../react-regl
npm link ../my-app/node_modules/react
```


#### Publishing

publish to npm with the version command and `patch` `minor` `major` or explicit tag `4.0.0-beta.2`
```
npm version
```

`npm version` will create a git tag that needs to be pushed..
```
git push --tags

```
