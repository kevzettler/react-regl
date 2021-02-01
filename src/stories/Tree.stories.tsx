import { Tree } from './Tree'
import { ReglFrame } from '../'

export default {
  title: "Regl/Voxel",
}

export const Vox = () => {
  return (
    <ReglFrame width={600}
              height={500}
              color={[0.40625, 0.94921, 0.996, 1]}>
      <Tree />
    </ReglFrame>
  )
}
Vox.storyName = "Tree";
Vox.args = {};
