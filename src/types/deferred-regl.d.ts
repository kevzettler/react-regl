declare module "deferred-regl"{
  import { Regl } from 'regl'

  export interface IDregl extends Regl{
    setRegl: (regl?: Regl) => void
    queue: any[]
    setQueue: (queuInput: any[]) => void
    (): IDregl
  }

  export default function defRegl(): IDregl
}
