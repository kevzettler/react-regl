declare module "deferred-regl"{
  import { Regl, DrawConfig, Limits } from 'regl'

  type IDregl<T> = {
    setRegl: (regl?: Regl) => void
    queue: any[]
    setQueue: (queuInput: any[]) => void
    map: {[key: string]: () => any}
    replicateTo: (target: IDregl<Regl>) => void
    (drawConfig? : DrawConfig): IDregl<Regl>
  } & {
    [K in keyof T]: () => T[K]
  } & {
    limits: Limits
  };

  export type DeferredRegl = IDregl<Regl>

  export default function defRegl(drawConfig?: DrawConfig): DeferredRegl
}
