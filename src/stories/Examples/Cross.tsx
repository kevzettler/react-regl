import regl, { ReglFrame } from '../../';
import { vec4 } from 'gl-matrix';

const Cross = regl({
  vert:`
             attribute vec2 position;
             void main() {
                 gl_Position = vec4(position, 0, 1);
             }
  `,

  frag:`
             precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

float box(in vec2 _st, in vec2 _size){
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size,
                        _size+vec2(0.001),
                        _st);
    uv *= smoothstep(_size,
                    _size+vec2(0.001),
                    vec2(1.0)-_st);
    return uv.x*uv.y;
}

float cross(in vec2 _st, float _size){
    return  box(_st, vec2(_size,_size/4.)) +
            box(_st, vec2(_size/4.,_size));
}

                 void main(){
                    vec2 st = gl_FragCoord.xy/u_resolution.xy;
                    vec3 color = vec3(0.0);


    vec2 translate = vec2(cos(u_time),sin(u_time));
    st += translate*0.35;
                  // Add the shape on the foreground
color += vec3(cross(st,0.25));

                  gl_FragColor = vec4(color,1.0);
                 }
  `,

  attributes:{
    position: [
      [-4, 0],
      [0, -4],
      [4, 4]
    ]
  },

  uniforms: {
    u_resolution: ({viewportWidth, viewportHeight}) => {
      return [viewportHeight, viewportWidth];
    },

    u_time: ({tick}) => tick / 100
  },

  count: 3
});


export const AnimatedCross = () => {
  const backgroundColor: vec4 = [0.40625, 0.94921, 0.996, 1];
  return (
    <ReglFrame
      color={backgroundColor}
      onFrame={() => regl.clear({color: backgroundColor})}
    >
      <Cross />
    </ReglFrame>
  )
};
