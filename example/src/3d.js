'use strict'
import React, { Component } from 'react'
import { render } from 'react-dom'

import { mat4 } from 'gl-matrix';
import createPlane from 'primitive-plane';
import createSphere from 'primitive-sphere';

import Regl from '../../src/Regl';
import Draw  from '../../src/Component';

const flatVert = `
       precision mediump float;
       attribute vec3 positions;
       uniform mat4 modelMatrix, view, projection;
       void main() {
         gl_Position = projection * view * modelMatrix * vec4(positions, 1);
       }`;

const flatFrag = `
       precision mediump float;
       uniform vec4 color;
       void main() {
         gl_FragColor = color; // vec4(1, 0.5, 1, 1);
       }`;

class Plane extends Component {
  render(){
    const geometry = createPlane(this.props.width, this.props.height);    

    return (
      <Draw vert={flatVert}
            frag={flatFrag}
            attributes={{
              positions: geometry.positions,
            }}
            uniforms={{
              view: this.props.view,
              projection: this.props.projection,
              color: this.props.color 
            }}
            rotation={this.props.rotation}
            elements={geometry.cells}/>
    );    
  }
}

class Sphere extends Component {
  render(){
    const radius = 1;
    const geometry = createSphere(this.props.radius, {
      segments: this.props.segments
    });

    return (
      <Draw vert={flatVert}
            frag={flatFrag}
            attributes={{
              positions: geometry.positions,
            }}
            uniforms={{
              view: this.props.view,
              projection: this.props.projection,
              color: this.props.color 
            }}
            elements={geometry.cells}/>
    );
  }
}

class Root extends Component {
  constructor(props,context){
    super(props,context);

    this.state = {};
    this.state.view = mat4.lookAt([],
                                  [0, 45, -100],
                                  [0, 0, 0],
                                  [0, 1, 0]);
  }
  
  onFrameTick({tick}){
    const t = 0.01 * tick
    this.setState({
      view: mat4.lookAt([],
                        [100 * Math.cos(t), 45, -100 * Math.sin(t)],
                        [0, 0, 0],
                        [0, 1, 0])
    });
  }
  
  render(){
    const projection = mat4.perspective([],
                                        Math.PI / 4,
                                        window.innerWidth / window.innerHeight,
                                        0.1,
                                        1000.0);

      return (
        <div>
          <h1>React Regl 3d!</h1>
          <Regl width={window.innerWidth}
                height={window.innerHeight}
                onFrame={this.onFrameTick.bind(this)}
                clear={{
                  color: [0.40625, 0.94921, 0.996, 1]
                }}>
            <Sphere projection={projection}
                    view={this.state.view}
                    color={[0.5, 0.25, 0, 1]}
                    radius={10}
                    segments={16}/>
            <Plane projection={projection}
                   view={this.state.view}
                   color={[0, 0.75, 0.3, 1]}
                   rotation={[Math.sqrt(0.5) ,0, 0, Math.sqrt(0.5)]}
                   width={50}
                   height={50}/>
          </Regl>
        </div>
      )
  }
}

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

render(
  <Root />,
  document.getElementById('root')
);
