declare module "canvas-orbit-camera" {
  import { mat4, vec2, vec3 } from 'gl-matrix'
  interface camera{
    tick: () => void
    view: (out?: mat4) => mat4
    rotate: (cur:vec2, prev:vec2) => void
    zoom: (delta:number) => void
    pan:(translation: vec2 | vec3 ) => void
  }

  export default function(
    canvas:HTMLCanvasElement,
    rotate?: boolean,
    scale?: boolean,
    pan?: boolean
  ): camera
}
