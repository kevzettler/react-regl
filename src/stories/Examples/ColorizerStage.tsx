import React, {CSSProperties} from 'react';
import regl, {ReglFrame} from '../../'

const Triangle = regl({
    vert: `
          precision mediump float;
          attribute vec2 position;
          void main () {
            gl_Position = vec4(position, 0, 1);
          }`,

    frag: `
          precision mediump float;
          uniform vec4 color;
          void main () {
            gl_FragColor = color;
          }`,
    attributes: {
        position: [
            [-1, 0],
            [0, -1],
            [1, 1]
        ]
    },
    uniforms: {
        color: regl.prop('color')
    },
    count: 3
});

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
}

function hexToArr(color: string) {
    const {r, g, b} = hexToRgb(color);
    return [r / 255, g / 255, b / 255, 0.75];
}

const ColorizerCanvas = ({color, width, height}: { color: string, width: number, height: number }) => {

    return (//TODO figure out why background color doesn't persist
        <ReglFrame webGLContext={{alpha: true, premultipliedAlpha: false}} width={width} height={height}
                   color={[0.9, 0.3, 0.1, 0.5]}>
            <Triangle color={hexToArr(color)}/>
        </ReglFrame>
    );
};

export const ColorizerStack = ({color}: { color: string }) => {
    const width = 400;
    const height = 300;
    const relPos: CSSProperties = {
        position: 'relative',
        width,
        height
    };
    const absPos: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height
    };
    return (
        <div className={'ColorizerStack'} style={relPos}>
            <img style={absPos} src={`https://picsum.photos/${width}/${height}`}/>
            <div style={absPos}>
                <ColorizerCanvas color={color} width={width} height={height}/>
            </div>
        </div>
    );
};

const colors = [
    '#339988',
    '#993388',
    '#3388FF',
    '#b1984c',
];

const shiftColors = () => {
    if (colors.length === 0) return;
    colors.push(colors.shift() || '');
}
//
// const animateColors = () => {
//     let request;
//     const performAnimation = () => {
//         // request = requestAnimationFrame(performAnimation)
//         setTimeout(() => {
//             request = requestAnimationFrame(performAnimation)
//         }, 100)
//         shiftColors()
//     }
//     requestAnimationFrame(performAnimation)
// };

const useAnimationFrame = (callback: any) => {//https://css-tricks.com/using-requestanimationframe-with-react-hooks/
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = React.useRef<number>();
    const previousTimeRef = React.useRef<number>();

    const animate = (time: number) => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime)
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current || 0);
    }, []); // Make sure the effect runs only once
}

export const ColorizerStage = () => {
    const [idx, setIdx] = React.useState(0)
    useAnimationFrame((deltaTime: number) => {
        setIdx(prevCount => (prevCount + 0.03))
    })
    const renderColors = [];
    for (let i = 0; i < colors.length; i++) {
        const pos = (Math.floor(idx) + i) % colors.length;
        renderColors.push(colors[pos]);
    }

    return (
        <div>
            <div>{idx}</div>
            {renderColors.map((color, i) => <div>{color}</div>)}
            {/*<button onClick={() => animateColors()}>*/}
            {/*    NEXT*/}
            {/*</button>*/}
            {renderColors.map((color, i) => <ColorizerStack key={i} color={color}/>)}
        </div>
    );
};
