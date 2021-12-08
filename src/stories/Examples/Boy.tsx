import React from 'react'
import regl, { ReglFrame } from '../../'
import boy from '../assets/boy_tri.json';
import { mat4, vec4, vec3 } from 'gl-matrix';
import triangulate from 'geom-triangulate';

const backgroundColor: vec4 = [0,0,0, 1];
const mesh = boy.meshes['./PS1'].Mesh;
const position = mesh.multi_indexed_vertex_attributes.positions.attribute.data;
const elements = mesh.multi_indexed_vertex_attributes.positions.indices;

const AxisHelper = regl({
  vert: `
attribute vec4 position;
attribute vec3 color;
uniform mat4 model, view, projection;
varying vec3 vColor;
void main(void) {
    vColor = color;
    gl_Position = projection * view * model * vec4(position.xyz, 1.0);
}
  `,
  frag: `
precision highp float;
varying vec3 vColor;
void main(void) {
    gl_FragColor = vec4(vColor.rgb, 1);
}
  `,
  primitive: 'line strip',
  count: 24,
  attributes: {
    position: [
      [0.0, 0.0, 0.0, 0],
      [1.0, 0.0, 0.0, 0],
      [0.75, 0.25, 0.0, 0],
      [0.75, -0.25, 0.0, 0],
      [1.0, 0.0, 0.0, 0],
      [0.75, 0.0, 0.25, 0],
      [0.75, 0.0, -0.25, 0],
      [1.0, 0.0, 0.0, 0],

      [0.0, 0.0, 0.0, 1],
      [0.0, 1.0, 0.0, 1],
      [0.0, 0.75, 0.25,1],
      [0.0, 0.75, -0.25,1],
      [0.0, 1.0, 0.0,1],
      [0.25, 0.75, 0.0,1],
      [-0.25, 0.75, 0.0,1],
      [0.0, 1.0, 0.0,1],

      [0.0, 0.0, 0.0,2],
      [0.0, 0.0, 1.0,2],
      [0.25, 0.0, 0.75,2],
      [-0.25, 0.0, 0.75,2],
      [0.0, 0.0, 1.0,2],
      [0.0, 0.25, 0.75,2],
      [0.0, -0.25, 0.75,2],
      [0.0, 0.0, 1.0,2],
    ],

    color: [
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],
      [1,0,0],

      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],
      [0,1,0],

      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
      [0,0,1],
    ],
  },
  uniforms:{
    model: (context:any, props: {model: mat4, rotation: vec3, origin: vec3, scale: vec3}) => {
      if(props.model){
        return props.model
      }else{
        return mat4.fromRotationTranslationScaleOrigin(
          mat4.create(),
          props.rotation,
          props.origin,
          //@ts-ignore
          [props.scale, props.scale, props.scale],
          [0,0,0]
        );
      }
    },
  }
});




const Camera = regl({
  uniforms:{
    view: ({tick}) => {
      const t = 0.01 * tick
      /* return mat4.lookAt(mat4.create(),
       *                    [30 * Math.cos(t), 2.5, 30 * Math.sin(t)],
       *                    [0, 2.5, 0],
       *                    [0, 1, 0]) */
      return mat4.lookAt(mat4.create(),
                         [15* Math.cos(t), 12, 15 * Math.sin(t)],
                         [0, 2.5, 0],
                         [0, 1, 0])
    },
    projection: ({ viewportWidth, viewportHeight }) =>
      mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      )
  }
});


const Model = regl({
  vert:`
             precision mediump float;
             attribute vec3 position;
             uniform mat4 model, view, projection;
             void main() {
                 gl_Position = projection * view * model * vec4(position, 1);
             }`,

  frag:`
              precision mediump float;
              void main() {
                  gl_FragColor = vec4(1, 1, 1, 1);
              }`,

  elements,
  attributes:{
    position
  },
  uniforms: {
    model: mat4.fromXRotation(mat4.create(), -(Math.PI / 2))
  }
});

export const Boy = () => {
  return (
    <ReglFrame
      color={backgroundColor}
      onFrame={(context, regl) => regl.clear({color: backgroundColor, depth: 1})}>
      <Camera>
        <Model />
        <AxisHelper rotation={[0,0,0,1]} origin={[0,0,0]} scale={10} />
      </Camera>
    </ReglFrame>
  );
}
