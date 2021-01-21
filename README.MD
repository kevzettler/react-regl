# react-regl

[![npm version](https://badge.fury.io/js/react-regl.svg)](https://badge.fury.io/js/react-regl)
[![Dependency Status](https://david-dm.org/kevzettler/react-regl.svg)](https://david-dm.org/kevzettler/react-regl)
[![Build Status](https://travis-ci.org/kevzettler/react-regl.svg?branch=master)](https://travis-ci.org/kevzettler/react-regl)

## Demos
[View demos in the Storybook](https://kevzettler.com/react-regl)

There is a [React Storybook](https://storybook.js.org/) included in the `/docs` directory with usage examples. The source for the Storybook is in the [`/stories`](./stories) directory and demonstrates how to create the examples.

## Install

```javascript
npm install --save react-regl
```

## Usage
This library enables [Regl](http://regl.party/) components to be rendered as React components. Visit the [Regl gallery page](http://regl.party/examples) for more ideas on usage.

Define a `react-regl` component `Triangle.js`:

### Standalone ReglComponents
```javascript
//
// Triangle.js
//
import regl from 'react-regl';
export const Triangle = regl({
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
  attributes:{
    position: [
      [-1, 0],
      [0, -1],
      [1, 1]
    ]
  },
  uniforms:{
    color: [1, 0, 0, 1]
  },
  count: 3
});
```

```javascript
import { ReglView } from 'react-regl'
import { Triangle } from './Triangle.js'

const Template = ({children}) => {
  return (
    <ReglView width={600}
              height={500}
              color={[0.40625, 0.94921, 0.996, 1]}>
       <Triangle />
    </ReglView>
  )
}
```

### Motivation and Goals
This repo, `react-regl` brings a JSX interface to `regl`, enabling easy integration of regl UI into existing `react` projects.

[regl](http://regl.party/) is a stateless functional abstraction for WebGl. Regl makes working with WebGL a more productive experience. Its stateless nature makes it easier to reason about WebGL programs. Regl's design was influenced by React. It follows React's unidirectional data flow to stateless component model. This module wraps Regl with a React reconciler for a fuller React experience

### Regl vs Other WebGL frameworks
Regl follows the unix philosophy of "small sharp tools" or "do one thing and do it well". Regl has full test coverage and aims for stable non-breaking updates. Other popular WebGL frameworks encompass much more responsiblity, usually including heavy abstractions for: scene graphs, animation systems, input systems, and cross device compatibility. The large amount of responsiblity in these other libraries leads to unstable, breaking releases, and lacking documentation and support.

## Development

### link the component
```
cd my-app
npm link ../react-regl
```

#### link its copy of React back to the app's React
```
cd ../react-regl
npm link ../my-app/node_modules/react
```
