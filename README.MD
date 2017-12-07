# react-regl

[![npm version](https://badge.fury.io/js/react-regl.svg)](https://badge.fury.io/js/react-regl)
[![Dependency Status](https://david-dm.org/kevzettler/react-regl.svg)](https://david-dm.org/kevzettler/react-regl)
[![Build Status](https://travis-ci.org/kevzettler/react-regl.svg?branch=master)](https://travis-ci.org/kevzettler/react-regl)

## Install

```javascript
npm install --save react-regl
```

## Usage

Define a `react-regl` component `Triangle.js`:

There is a [React Storybook](https://storybook.js.org/) included in the `/docs` directory with usage examples. The source for the Storybook is in [`/stories`](./stories/index.js) directory and demonstrates how to create the examples.

This library is a React wrapper for the [Regl](http://regl.party/) library. Visit the [Regl gallery page](http://regl.party/examples) for more ideas on usage.

### Standalone ReglComponents
```javascript
import React, { Component } from 'react';
import { Draw } from 'react-regl';

class Triangle extends Component {
  render(){
    const {positions, color} = this.props;

    return (
      <Draw vert={triVert}
            frag={triFrag}
            attributes={{
              positions: this.props.positions
            }}
            uniforms={{
              color: color this.props.color
            }}
            count={3}
      />
    );
  }
}
```

```javascript
    import Regl from 'react-regl';
    import Triangle from './triangle';

    // Import the Regl component and add it into JSX content
    // Add the triangle component as a child of Regl pass it props

    <div>
        <h1>React Regl Example</h1>
        <Regl width={window.innerWidth}
              height={window.innerHeight}
              onFrame={this.onFrameHandler.bind(this)}>
              <Triangle color={[1,1,0.5,1]}
                        positions={[[-0.5, 0],[0, -0.5],[0.25, 1]]} />
        </Regl >
    </div>
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
