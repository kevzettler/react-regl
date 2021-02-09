import React from 'react'
import { ReglFrame } from '../'

export default {
  title:"React-Regl/ReglFrame",
  component: ReglFrame,
  parameters: {
    layout: 'fullscreen'
  }
}


export const BasicFrame = () => <ReglFrame width={690} height={420} color={[0.40625, 0.94921, 0.996, 1]}/>
