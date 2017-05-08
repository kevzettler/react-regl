# Install

```javascript
npm install --save react-regl
```

# Usage

There is a full example with animations and batch rendering in the example directory. You can launch the [Example app](example/src/index.js) with `npm start`

Define a `react-regl` component `Triangle.js`:

## Standalone ReglComponents
```javascript
import { Draw } from 'react-regl';

// Draw is an enhanced react component
// Draw components support a `drawCommand` Method which return a regl draw command


class Triangle extends Draw {
  drawCommand(regl){
    return regl({
      frag: `
   precision mediump float;
   uniform vec4 color;
   void main () {
     gl_FragColor = color;
   }`,
      
      vert: `
   precision mediump float;
   attribute vec2 position;
   void main () {
     gl_Position = vec4(position, 0, 1);
   }`,
      
      attributes: {
        position: regl.prop('position')
      },
      
      uniforms: {
        color: regl.prop('color')
      },
      
      count: 3
    });
  }
}
```

```javascript
    import Regl from 'react-regl';

    // Import the Regl component and add it into JSX content
    // Add the triangle component as a child of Regl pass it props
    
    <div>
        <h1>React Regl Example</h1>
        <Regl width={window.innerWidth}
              height={window.innerHeight}
              onFrame={this.onFrameHandler.bind(this)}>
              <Triangle color={[1,1,0.5,1]}
                        position={[[-0.5, 0],[0, -0.5],[0.25, 1]]} />
        </Regl >
    </div>
```

# Motivation and Goals
This repo, `react-regl` brings a JSX interface to `regl`, enabling easy integration of regl UI into existing `react` projects. 

[regl](http://regl.party/) is a stateless functional abstraction for WebGl. Regl makes working with WebGL a more productive experience. Its stateless nature makes it easier to reason about WebGL programs. Regl's design was influenced by React. It follows React's unidirectional data flow to stateless component model.

## Regl vs Other WebGL frameworks
Regl follows the unix philosophy of "small sharp tools" or "do one thing and do it well". Regl has full test coverage and aims for stable non-breaking updates. Other popular WebGL frameworks encompass much more responsiblity, usually including heavy abstractions for: scene graphs, animation systems, input systems, and cross device compatibility. The large amount of responsiblity in these other libraries leads to unstable, breaking releases, and lacking documentation and support.

## Working towards higher level abastractions
The goal of this repo is to provide a solid foundation for building a higher level 3d applications. 

# Caveats

This project currently uses a react "Stack" model reconciler. This projects "Stack" implementation was modeled after a guide on ["Making custom renders for react"](https://goshakkk.name/react-custom-renderers/) and the accompanying [example project](https://github.com/goshakkk/pabla). It's unclear if this was the "correct" way to implement a renderer. The react renderer API is private, un-documented and changing with each update. This project could probably be improved to better match the react private apis.

At the time of writing this paragraph (5-7-2017) the [react "Fiber" reconciler](https://github.com/acdlite/react-fiber-architecture) is close on the horizon. To stay current this project may need updates.
