import React from 'react'
import regl, { ReglFrame } from '../../';

function normalized(value, min, max){
  return (value - min) / (max - min);
}

const Quad = regl({
  id: "Quad",
  vert: `
  precision mediump float;
  attribute vec2 position;
  attribute vec2 texCoord;
  varying vec2 uv;
  void main () {
    uv = texCoord;
    gl_Position = vec4(position, 0, 1);
  }`,

  frag: `
     precision mediump float;
     uniform sampler2D texture;
     varying vec2 uv;
     void main () {
       gl_FragColor = texture2D(texture, uv);
  }`,

  attributes: {
    position: [
      -1, 1,
      -1, -1,
      1, -1,
      1, 1
    ],
    texCoord: [
      0, 1,
      0, 0,
      1, 0,
      1, 1
    ]
  },

  uniforms: {
    texture: regl.prop('texture')
  },

  elements: [
    [0,1,2],
    [0,2,3]
  ]
})

export const Loader = () => {
  const [loaded, setLoaded] = React.useState(null);
  const image = React.useRef()

  function handleImage(event){
    setLoaded(true);
  }

  return (
    <>
      <img
        style={{display: "none"}}
        src="./peppers.png"
        ref={image}
        onLoad={handleImage} />
      {loaded ?
       <>
         <ReglFrame
           width={200}
           height={200}>
           <Quad texture={regl.texture({data: image.current})}/>
         </ReglFrame>

         <ReglFrame
           width={200}
           height={200}>
           <Quad texture={regl.texture({data: image.current, flipY: true})}/>
         </ReglFrame>
       </>
      : null }
    </>
  );
};
