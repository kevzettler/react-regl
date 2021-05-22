import React from 'react'
import regl, { ReglFrame } from '../../';

const BigTriangle = regl({
  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
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
      -2, 0,
      0, -2,
      2, 2]
  },

  uniforms: {
    texture: regl.prop('texture')
  },

  count: 3
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
       <ReglFrame
         width={600}
         height={600}>
         <BigTriangle  texture={regl.texture(image.current)}/>
       </ReglFrame>
      : null }
    </>
  );
};
