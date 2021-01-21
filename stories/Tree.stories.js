import { Tree } from './Tree'
import { ReglView } from '../src'

const Template = ({children}) => {
  return (
    <ReglView width={600}
    height={500}
    color={[0.40625, 0.94921, 0.996, 1]}>
      <Tree />
    </ReglView>
  )
}

export default {
  title: "Regl/Voxel",
  component: Template,
  decorators: [],
  parameters: {},
}

export const Vox = () => <Template />;
Vox.storyName = "Tree";
Vox.args = {};
