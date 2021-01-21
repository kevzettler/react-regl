import regl, { ReglView, Frame } from '../src'
import { Triangle } from './Triangle'
import { Cross } from './Cross'

const Template = ({children}) => {
  return (
    <ReglView width={600}
              height={500}
              color={[0.40625, 0.94921, 0.996, 1]}>
      {children}
    </ReglView>
  )
}

export default {
  title: "Regl/2D",
  component: Template,
}

const backgroundColor = [0.40625, 0.94921, 0.996, 1];

export const BasicTriangle = () => <Template ><Triangle /></Template>;
export const AnimatedCross = () => {
  return (
    <ReglView width={600}
              height={500}
              color={backgroundColor}>
      <Frame onFrame={() => regl.clear({color: backgroundColor})}>
        <Cross />
      </Frame>
    </ReglView>
  )
};
