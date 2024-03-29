import mouseChange from 'mouse-change';
import mouseWheel from 'mouse-wheel';
import { mat4 } from 'gl-matrix';
import { ReactReglComponent } from '../../../reglDefer';

interface cameraProps{
  ['minDistance']?: number
  ['maxDistance']?: number
  phi?: number
  theta?: number
  center?: [number,number,number]
  up?: [number,number,number]
  distance?: number
}

interface setupCamera{
  [index:string]: any
}

export default function createCamera (regl: any, props: cameraProps) {
  var cameraState: {[index: string]: any} = {
    view: mat4.identity(new Float32Array(16)),
    projection: mat4.identity(new Float32Array(16)),
    //@ts-ignore
    center: new Float32Array(props.center || 3),
    theta: props.theta || 0,
    phi: props.phi || 0,
    distance: Math.log(props.distance || 10.0),
    eye: new Float32Array(3),
    up: new Float32Array(props.up || [0, 1, 0])
  }

  var right = new Float32Array([1, 0, 0])
  var front = new Float32Array([0, 0, 1])

  var minDistance = Math.log(props.minDistance !== undefined ? props.minDistance : 0.1)
  var maxDistance = Math.log(props.maxDistance !== undefined ? props.maxDistance : 1000)

  var dtheta = 0
  var dphi = 0
  var ddistance = 0

  var prevX = 0
  var prevY = 0
  mouseChange(function (buttons, x, y) {
    if (buttons & 1) {
      var dx = (x - prevX) / window.innerWidth
      var dy = (y - prevY) / window.innerHeight
      var w = Math.max(cameraState.distance, 0.5)

      dtheta += w * dx
      dphi += w * dy
    }
    prevX = x
    prevY = y
  })

  mouseWheel(function (dx, dy) {
    ddistance += dy / window.innerHeight
  })

  function damp (x: number) {
    var xd = x * 0.9
    if (Math.abs(xd) < 0.1) {
      return 0
    }
    return xd
  }

  function clamp (x:number, lo:number, hi:number) {
    return Math.min(Math.max(x, lo), hi)
  }

  function updateCamera () {
    var center = cameraState.center
    var eye = cameraState.eye
    var up = cameraState.up

    cameraState.theta += dtheta
    cameraState.phi = clamp(
      cameraState.phi + dphi,
      -Math.PI / 2.0,
      Math.PI / 2.0)
    cameraState.distance = clamp(
      cameraState.distance + ddistance,
      minDistance,
      maxDistance)

    dtheta = damp(dtheta)
    dphi = damp(dphi)
    ddistance = damp(ddistance)

    var theta = cameraState.theta
    var phi = cameraState.phi
    var r = Math.exp(cameraState.distance)

    var vf = r * Math.sin(theta) * Math.cos(phi)
    var vr = r * Math.cos(theta) * Math.cos(phi)
    var vu = r * Math.sin(phi)

    for (var i = 0; i < 3; ++i) {
      eye[i] = center[i] + vf * front[i] + vr * right[i] + vu * up[i]
    }

    mat4.lookAt(cameraState.view, eye, center, up)
  }

  var injectContext = regl({
    context: Object.assign({}, cameraState, {
      projection: function ({viewportWidth, viewportHeight}: {viewportWidth: number, viewportHeight: number}) {
        return mat4.perspective(cameraState.projection,
          Math.PI / 4.0,
          viewportWidth / viewportHeight,
          0.01,
          1000.0)
      }
    }),
    uniforms: Object.keys(cameraState).reduce(function (uniforms: {[index:string]:any}, name) {
      uniforms[name] = regl.context(name)
      return uniforms
    }, {})
  })

  const setupCamera: setupCamera = (block: () => void) => {
    updateCamera()
    debugger;
    return injectContext(block)
  }

  Object.keys(cameraState).forEach(function (name) {
    setupCamera[name] = cameraState[name]
  })

  return setupCamera
}
