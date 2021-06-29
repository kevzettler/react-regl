import React from 'react'
import regl, { ReglFrame } from '../../'
import getUserMedia from 'getusermedia';

export const Microphone = () => {
  const [stream, setStream] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    getUserMedia({audo: true}, (err, stream) => {
      if(err){
        return setErr(err);
      }
      setStream(stream);
    });
  }, [stream, err])

  if(err){
    return (
      <div>{err.toString()}</div>
    )
  }

  if(stream === null) return null;

  const context = new AudioContext()
  const analyser = context.createAnalyser()
  context.createMediaStreamSource(stream).connect(analyser)
  const fftSize = analyser.frequencyBinCount
  const frequencies = new Uint8Array(fftSize)
  const fftBuffer = regl.buffer({
    length: fftSize,
    type: 'uint8',
    usage: 'dynamic'
  })

  const Spectrum = regl({
    vert: `
    precision mediump float;

    #define FFT_SIZE ${fftSize}
    #define PI ${Math.PI}

    attribute float index, frequency;

    void main() {
      float theta = 2.0 * PI * index / float(FFT_SIZE);
      gl_Position = vec4(
        0.5 * cos(theta) * (1.0 + frequency),
        0.5 * sin(theta) * (1.0 + frequency),
        0,
        1);
    }`,

    frag: `
    void main() {
      gl_FragColor = vec4(1, 1, 1, 1
    }`,

    attributes: {
      index: Array(fftSize).fill(0).map((_, i) => i),
      frequency: {
        buffer: fftBuffer,
        normalized: true
      }
    },
    elements: null,
    instances: -1,
    lineWidth: 1,
    depth: {enable: false},
    count: fftSize,
    primitive: 'line loop'
  })

  return (
    <ReglFrame
      onFrame={(context, regl) => {
        regl.clear({
          color: [0,0,0,1],
          depth: 1
        })
        // Poll microphone data
        analyser.getByteFrequencyData(frequencies)

        // Here we use .subdata() to update the buffer in place
        fftBuffer.subdata(frequencies)
      }}>
      <Spectrum />
    </ReglFrame>
  );
};
