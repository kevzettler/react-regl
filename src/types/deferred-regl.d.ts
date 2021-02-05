declare module "deferred-regl" {
  import { Regl } from 'regl'

  export interface IDregl extends Regl{
    setRegl: (regl?: Regl) => void
    queue: []
    setQueue: (queuInput: any[]) => void
  }

  export default () => IDregl
}
