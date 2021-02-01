import regl from '../';
import { DefaultContext } from 'regl';
import { mat4 } from 'gl-matrix';

import TreeBuffer from './static/tree1.aomesh';
const treeBuff = new Float32Array(TreeBuffer)

export const Tree = regl({
  vert:`
precision highp float;
attribute vec4 position;
attribute vec4 normal;
attribute vec4 color;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec4 vColor;
varying vec3  vNormal;
varying float ambientOcclusion;

void main() {
  //Compute ambient occlusion
  ambientOcclusion = position.w / 255.0;

  //Compute normal
  vNormal = 128.0 - normal.xyz;

  vColor =  color;

  //NOTE position is vec4 already from aomesh format
  gl_Position = projection * view * model * vec4(position.xyz, 1);
}
  `,

  frag:`
precision highp float;

varying vec3  vNormal;
varying float ambientOcclusion;

varying highp vec4 vColor;

void main() {
  vec4 color   = vec4(0,0,0,1);
  float weight = 0.0;

  for(int dx=0; dx<2; ++dx) {
    for(int dy=0; dy<2; ++dy) {
      vec2 offset = 2.0 * fract(0.5 * ( vec2(dx, dy)));
      float w = pow(1.0 - max(abs(offset.x-1.0), abs(offset.y-1.0)), 16.0);

      color  += w * vColor;
      weight += w;
    }
  }

  color /= weight;

  if(color.w < 0.5) {
    discard;
  }

  float light = ambientOcclusion + max(0.15*dot(vNormal, vec3(1,1,1)), 0.0);
  gl_FragColor = vec4(color.xyz * light, 1.0);
}
  `,

  count: treeBuff.length/12,

  attributes: {
    position:{
      buffer: regl.buffer({
        data: treeBuff,
        usage: 'dynamic',
        type: 'float32',
      }),
      size: 4,
      offset: 0,
      stride: 48,
      normalized: false,
    },

    //Pulls ambient occlusion value the '4th' value
    //https://github.com/mikolalysenko/ao-mesher/blob/master/mesh.js#L18-L32
    normal:{
      buffer: regl.buffer({
        data: treeBuff,
        usage: 'dynamic',
        type: 'float32',
      }),
      size: 4,
      offset: 16,
      stride: 48,
      normalized: false,
    },

    color:{
      buffer: regl.buffer({
        data: treeBuff,
        usage: 'dynamic',
        type: 'float32',
      }),
      size: 4,
      offset: 32,
      stride: 48,
      normalized: true,
    }
  },


  uniforms:{
    projection: ({viewportWidth, viewportHeight}: DefaultContext) => {
      return mat4.perspective(
        mat4.create(),
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000
      );
    },
    view:  () => {
      return mat4.lookAt(
        mat4.create(),
        [40, 50, 40],
        //TODO this .aomesh file is off center in local coords
        [15, 20, -50],
        [0, 1, 0]
      )
    },

    model: mat4.identity(mat4.create()),
  }
 });
