import React from 'react'
import regl, { ReglFrame } from '../../'
import { mat4, vec4, vec3 } from 'gl-matrix';
import { FBX, FBXAxes } from '@picode/fbx'
import * as FBXParser from 'fbx-parser'
import triangulate from 'geom-triangulate'

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

  elements: regl.prop('cells'),
  attributes:{
    position: (context, props: any) => {
      return props.position
    }
  },
  uniforms: {
    //model: mat4.identity(mat4.create()),
    model: mat4.fromXRotation(mat4.create(), -(Math.PI / 2))
  }
});


const AssetLoader = ({children}) => {
  const [asset, setAsset] = React.useState(null);
  const [error, setError] = React.useState(null);

  async function fetchAsset(){
    try{
      const response = await fetch("./boy.fbx");
      const arrayBuff = await response.arrayBuffer();

      const fbx = new FBX(FBXParser.parseBinary(new Uint8Array(arrayBuff)))

      const geometry = fbx.root.node('Objects').node({ 1: `Geometry::Cube.005` });
      const vertices = geometry.node('Vertices').fbxNode.props[0];

      // @ts-ignore
      const polys = geometry.node('PolygonVertexIndex').fbxNode.props[0].reduce((acc, vertIndex) => {
        let isBreakVert = vertIndex < 0 ? true : false;
        if(!isBreakVert){
          acc.current.push(vertIndex)
        }else{
          // break verts are XOR'd and need to be adjusted
          // https://banexdevblog.wordpress.com/2014/06/23/a-quick-tutorial-about-the-fbx-ascii-format/
          acc.current.push((vertIndex * -1) -1);
          if(acc.current.length !=3){
            acc.other.push(acc.current);
          }else{
            acc.tris = acc.tris.concat(acc.current);
          }
          acc.current = [];
        }
        return acc;
      }, {tris: [], other: [], current: []});

      debugger;
      const cells = polys.tris.concat(triangulate(polys.other).flat);

//      @ts-ignore
      /* const cells = geometry.node('PolygonVertexIndex').fbxNode.props[0].map((vertIndex) => {
       *   // TODO process all the indices and divide any with greater than 3 components in to triangles
       *   // The last vertIndex in the cell is denotated with a negative - prefix
       *   // e.g tris are 2,3,-4,5,6-7
       *   // quads are 3,7,5,-8,9,4,6,-3
       *   // so have to iterate over the list and reduce in to chunks based on negative prefix
       *   // from there need to split into groups of 3 and then do the XOR reversalz
       *   let out = vertIndex
       *   if(out < 0){
       *     // indices are XOR'd and need to be adjusted
       *     // https://banexdevblog.wordpress.com/2014/06/23/a-quick-tutorial-about-the-fbx-ascii-format/
       *     out = (out * -1) -1;
       *   }
       *   return out;
       * }) */
//      const cells = geometry.node('Edges').fbxNode.props[0];
      const normals = geometry.node("LayerElementNormal").node('Normals').fbxNode.props[0];
      const uvs = geometry.node("LayerElementUV").node('UV').fbxNode.props[0];

      debugger
      const simpc = {
        position: vertices,
        cells,
        normals,
        uvs
      };

      setAsset(simpc);
    }catch(error){
      setError(error);
    }
  }

  React.useEffect(() => {
    fetchAsset();
  }, [null]);

  if(error){
    return <div>${error}</div>;
  }

  if(asset){
    return children(asset);
  }

  return null;
};

export const FBXLoader = () => {
  return (
    <AssetLoader>
      {(asset) => { debugger; return(
      <ReglFrame
          color={backgroundColor}
          onFrame={(context, regl) => regl.clear({color: backgroundColor, depth: 1})}>
          <Camera>
            <Model position={asset.position} cells={asset.cells}/>
            <AxisHelper rotation={[0,0,0,1]} origin={[0,0,0]} scale={10} />
          </Camera>
      </ReglFrame>
      )}}
    </AssetLoader>
  );
}
