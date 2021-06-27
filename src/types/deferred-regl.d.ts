declare module "deferred-regl"{
  import { Regl, DrawConfig } from 'regl'

  type IDregl<T> = {
    setRegl: (regl?: Regl) => void
    queue: any[]
    setQueue: (queuInput: any[]) => void
    (drawConfig? : DrawConfig): IDregl<Regl>
  } & {
    [K in keyof T]: () => T[K]
  };

  export type DeferredRegl = IDregl<Regl>

  export default function defRegl(drawConfig?: DrawConfig): DeferredRegl
}
