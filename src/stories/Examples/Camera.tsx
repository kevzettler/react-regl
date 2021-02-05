import regl, { ReglFrame } from '../../'
import bunny from 'bunny';
import normals from 'angle-normals';

import CameraHelper from './util/Camera'

const CameraController = CameraHelper(regl, {
  center: [0, 2.5, 0]
})

const Bunny = regl({
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    void main () {
      gl_FragColor = vec4(abs(vnormal), 1.0);
    }`,
  vert: `
    precision mediump float;
    uniform mat4 projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    void main () {
      vnormal = normal;
      gl_Position = projection * view * vec4(position, 1.0);
    }`,
  attributes: {
    position: bunny.positions,
    normal: normals(bunny.cells, bunny.positions)
  },
  elements: bunny.cells
})

export const Camera = () => {
    return (
      <ReglFrame
        onFrame={() => regl.clear({color: [0,0,0,1]})}
      >
        <CameraController>
          <Bunny/>
        </CameraController>
      </ReglFrame>
    );
}
