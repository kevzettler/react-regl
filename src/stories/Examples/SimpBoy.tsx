import React from 'react'
import regl, { ReglFrame } from '../../'
import simpC from '../assets/simp_boy.json';
import { mat4, vec4, vec3 } from 'gl-matrix';
import { PNG } from "pngjs";
import textureArrayBuff from '../assets/boy-tex.png';
const boyPNG =  PNG.sync.read(Buffer.from(textureArrayBuff));

const backgroundColor: vec4 = [0,0,0, 1];

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
      return mat4.lookAt(
        mat4.create(),
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
       attribute vec2 uvs;
       varying vec2 vUv;
       void main() {
          vUv = uvs;
          gl_Position = projection * view * model * vec4(position, 1);
          //gl_Position = vec4(uvs.xy * 2.0 - 1.0, 0.0, 1.0); // renders UV unwraps
       }`,

  frag:`
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D tex;
      void main() {
         gl_FragColor = texture2D(tex,vUv);
      }`,

  elements: simpC.Mesh.cells,
  attributes:{
    position: simpC.Mesh.positions,
    uvs: simpC.Mesh.uvs
  },

  uniforms: {
    //model: mat4.fromXRotation(mat4.create(), -(Math.PI / 2)),
    model: mat4.identity(mat4.create()),

    tex: regl.texture({
      width: boyPNG.width,
      height: boyPNG.height,
      data: boyPNG.data,
      flipY: true
    }),

    /* interpolatedJoints: (context: any, props) => {
     *   debugger
     *   const joints = interpolateJoints({
     *     currentTime: context.tick,
     *     jointNums: Object.values(simpC.armature.joint_indices).sort(),
     *     currentAnimation: {
     *       keyframes: simpC.armature.bone_space_actions['PS1-Boy Idel'].bone_keyframes.keyframes,
     *       startTime: 0,
     *       noLoop: false
     *     }
     *   });

     *   debugger
     *   return joints;
     * } */
  }

});

export const SimpBoy = () => {
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
