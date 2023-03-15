import {
  Regl,
  ClearOptions,
  DrawConfig,
  Limits,
  DrawCommand,
  DefaultContext,
  FrameCallback,
  Cancellable,
  DynamicVariable,
} from 'regl'


type StringIndexable = Record<string, (...args: any[]) => any>;


interface QueueItem {
  (r: ExtendedRegl): void,
  key?: string
  opts?: DrawConfig<{}, {}, {}, {}, DefaultContext> | DrawCommand<DefaultContext, {}>
  queueIndex?: number
  is_draw_command?: boolean
};

type IDregl<T> = {
  setRegl: (regl?: Regl) => void
  queue: QueueItem[]
  setQueue: (queuInput: QueueItem[]) => void
  map?: StringIndexable
  replicant?: IDregl<Regl>
  replicateTo: (target: IDregl<Regl>) => void
  (drawConfig?: DrawConfig): IDregl<Regl>
  (drawConfig?: DrawConfig, scopeFn?: (context: any) => void): IDregl<Regl>
  props?: <Props extends {}, Key extends keyof Props>(name: Key) => DynamicVariable<Props[Key]>
} & {
    [K in keyof T]?: T[K]
  } & {
    limits?: Limits
  };

export type DeferredRegl = IDregl<Regl>

type ExtendedRegl = Regl & StringIndexable;

interface ApplyerFn {
  (): void,
  key?: string,
  opts?: DrawConfig<{}, {}, {}, {}, DefaultContext> | DrawCommand<DefaultContext, {}>
  queueIndex?: number
}



interface DeferredFn extends DeferredRegl {
  (opts: DrawConfig<{}, {}, {}, {}, DefaultContext>): void;
  //  (opts: DrawCommand | DrawConfig): void;
}

type ResourceFn = {
  (): void
  key?: string
  opts?: DrawConfig<{}, {}, {}, {}, DefaultContext> | DrawCommand<DefaultContext, {}>
  queueIndex?: number;
  deferred_regl_resource?: boolean;
} & StringIndexable;

function extendType<T extends Record<string, any>>(type: T): T & StringIndexable {
  const result: any = {};
  for (const key in type) {
    if (Object.prototype.hasOwnProperty.call(type, key)) {
      result[key] = type[key];
    }
  }
  return result;
}


function falsy(x: any) {
  return x === null || x === undefined
}


function reduceKeyPaths(object: any) {
  if (!object) return "";
  return Object.entries(object).reduce((accum, [key, val]) => {
    accum += key;
    if (Object.prototype.toString.call(val) === '[object Object]') {
      accum += (':' + reduceKeyPaths(val));
    }
    return accum;
  }, "")
}



export default function DeferredRegl(): DeferredRegl {
  let regl: ExtendedRegl | null = null
  let queue: any[] = [];
  const map: StringIndexable = {};
  const def: DeferredRegl = dfn('()');
  unset()

  def.queue = queue;
  def.map = map;
  def.setQueue = function (queueInput) {
    queue = queueInput
  }

  // This replicate method is used so that
  // one deferred regl can point all its methods
  // to another deferred instance
  // This is used in react-regl so that the global instance
  // can be pointed to componets as they are rendering
  // this is super brittle and need a
  def.replicateTo = function (
    this: typeof DeferredRegl,
    target: typeof DeferredRegl
  ) {
    target.replicant = this;
    // copy the queue to the target
    this.queue.forEach((qi: QueueItem) => {
      if (!qi.is_draw_command && target.queue) {
        target.queue.push(qi);
      } else {
        throw new Error("missing queue on replicate target");
      }
    })

    // change all the references to the target
    target.map = { ...this.map };
    Object.entries(this.map).forEach(([mk, _mv]) => {
      this[mk] = target[mk];
    });

    this.draw = target.draw
    this.poll = target.poll
    this.clear = target.clear;
  }


  def.setRegl = function (r?: Regl) {
    if (!r) return unset();
    regl = extendType<Regl>(r);
    for (var i = 0; i < queue.length; i++) {
      try {
        queue[i](regl)
      } catch (ex) {
        console.error("deferred-regl queue failure!, ", queue[i].key, ex);
      }
    }
    queue = []

    if (this.replicant) {
      this.replicant.frame = r.frame
      this.replicant.draw = r.draw
      this.replicant.poll = r.poll
      this.replicant.clear = r.clear
      this.replicant.buffer = r.buffer
      // overriding the these causes some failures
      /* this.replicant.texture = r.texture
       * this.replicant.elements = r.elements
       * this.replicant.framebuffer = r.framebuffer
       * this.replicant.framebufferCube = r.framebufferCube
       * this.replicant.renderbuffer = r.renderbuffer
       * this.replicant.cube = r.cube
       * this.replicant.read = r.read */
      this.replicant.hasExtension = r.hasExtension
      this.replicant.limits = r.limits
      //      this.replicant.stats = r.limits // stats is read only?
      this.replicant.now = r.now
      this.replicant.destroy = r.destroy
      this.replicant.on = r.on
    }

    def.frame = r.frame
    def.draw = r.draw
    def.poll = r.poll
    def.clear = r.clear
    def.buffer = r.buffer
    def.texture = r.texture
    def.elements = r.elements
    def.framebuffer = r.framebuffer
    def.framebufferCube = r.framebufferCube
    def.renderbuffer = r.renderbuffer
    def.cube = r.cube
    def.read = r.read
    def.hasExtension = r.hasExtension
    def.limits = r.limits
    //    def.stats = r.limits // stats is read only ?
    def.now = r.now
    def.destroy = r.destroy
    def.on = r.on
  }
  return def;

  function unset(): void {
    if (!queue) queue = []
    def.frame = function (cb: FrameCallback): Cancellable {
      let cancelableRef: Cancellable = { cancel: () => { } };

      queue.push(function (r: ExtendedRegl) {
        cancelableRef = r.frame(cb);
      })
      return cancelableRef;
    }
    def.draw = function () { queue.push(function (r: ExtendedRegl) { r.draw() }) }
    def.poll = function () { queue.push(function (r: ExtendedRegl) { r.poll() }) }
    def.clear = function (opts: ClearOptions) { queue.push(function (r: ExtendedRegl) { r.clear(opts) }) }
    // this deviates from regl prop implementation
    // @ts-ignore
    def.prop = function (key: string | number | symbol) {
      return function (_context: any, props: { [key: string]: { [key: string]: any } }) {
        if (typeof key === "string") {
          if (!falsy(props[key])) {
            return props[key]
          } else {
            // missing key could be speical case unrolled uniform prop
            // https://github.com/regl-project/regl/issues/258
            // https://github.com/regl-project/regl/issues/373
            var matches = key.match(/(?<prop>.+)\[(?<index>.+)\]/i)
            if (matches && matches.groups) {
              return props[matches.groups.prop][matches.groups.index]
            }
          }
        } else if (typeof key === 'number') {
          return props[key];
        }
      }
    }

    def.props = def.prop
    // this deviates from regl prop implementation
    // @ts-ignore
    def.context = function <Context extends DefaultContext, K extends keyof Context>(name: K): DynamicVariable<Context[K]> {
      // @ts-ignore
      return function (context, props) { return context[key] }
    }
    // @ts-ignore
    def['this'] = function (key: string) {
      // @ts-ignore
      return function (context, props) { return this[key] }
    }
    // @ts-ignore
    def.buffer = dfnx('buffer', ['subdata'])
    // @ts-ignore
    def.texture = dfn('texture')
    // @ts-ignore
    def.elements = dfn('elements')
    // @ts-ignore
    def.framebuffer = dfnx('framebuffer', ['resize', 'use'])
    // @ts-ignore
    def.framebufferCube = dfn('framebufferCube')
    // @ts-ignore
    def.renderbuffer = dfn('renderbuffer')
    // @ts-ignore
    def.cube = dfn('cube')
    def.read = function () { }
    // @ts-ignore
    def.hasExtension = function () { }
    // @ts-ignore
    def.limits = { lineWidthDims: [1, 1] }
    // def.stats = function () { } // read only stats?
    def.now = function () { return 0 }
    def.destroy = function () { queue.push(function (r: ExtendedRegl) { r.destroy() }) }
    // @ts-ignore
    def.on = function (name, f) { queue.push(function (r: ExtendedRegl) { r.on(name, f) }) }
  }

  function dfn(key: string): DeferredFn {
    // @ts-ignore
    return function (opts) {
      if (key === '()' && regl && opts) return regl(opts)
      else if (regl) return regl[key](opts)

      let f: any = null;

      let wrap: QueueItem = function (r: ExtendedRegl) {
        if (key === '()' && opts) {
          f = r(opts)
        } else {
          f = r[key](opts)
        }
      };
      wrap.is_draw_command = false;

      if (key === '()') wrap.is_draw_command = true;
      wrap.key = key;
      wrap.opts = opts;
      wrap.queueIndex = queue.length - 1;
      queue.push(wrap);

      // @ts-ignore
      let r: ResourceFn = function () {
        var args = arguments
        if (!falsy(f)) {
          if (key === '()') f.apply(null, args)
          else return f
        } else {
          let applyer: ApplyerFn = function () { f.apply(null, args) };
          applyer.key = key;
          applyer.opts = opts;
          applyer.queueIndex = queue.length - 1;
          queue.push(applyer)
        }
      }

      var mapKey = key + "-" + (queue.length - 1) + "-" + reduceKeyPaths(opts)
      map[mapKey] = r;
      r.key = key
      r.opts = opts
      r.queueIndex = queue.length - 1;
      r.deferred_regl_resource = true;

      return map[mapKey];
    }
  }
  function dfnx(key: string, methods: string[]) {
    return function (opts: DrawConfig) {
      if (key === '()' && regl) return regl(opts)
      else if (regl) return regl[key](opts)

      var f: DrawCommand<DefaultContext, {}> | ExtendedRegl | null = null;
      var wrap: QueueItem = function (r: ExtendedRegl) {
        if (key === '()') {
          f = r(opts)
        } else {
          f = r[key](opts)
        }
      };
      if (key === '()') wrap.is_draw_command = true;
      wrap.key = key;
      wrap.opts = opts;
      wrap.queueIndex = queue.length - 1;
      queue.push(wrap);

      // @ts-ignore
      var r: ResourceFn = function () {
        var args = arguments
        if (!falsy(f)) {
          //@ts-ignore
          if (key === '()') f.apply(null, args)
          else return f
        } else {
          var applyer: ApplyerFn = function () {
            //@ts-ignore null needs to be typed to some scope
            f.apply(null, args)
          };
          applyer.key = key;
          applyer.opts = opts;
          applyer.queueIndex = queue.length - 1;
          queue.push(applyer)
        }
      }
      var mapKey = key + "-" + (queue.length - 1) + "-" + reduceKeyPaths(opts);
      map[mapKey] = r;
      r.key = key
      r.opts = opts
      r.queueIndex = queue.length - 1;
      r.deferred_regl_resource = true;


      for (var i = 0; i < methods.length; i++) {
        var m = methods[i]

        r[m] = function () {
          var args = arguments
          if (!falsy(f)) {
            //@ts-ignore
            return f[m].apply(f, args)
          } else {
            var applyer: ApplyerFn = function () {
              //@ts-ignore
              f.apply(null, args)
            };
            applyer.key = key;
            applyer.opts = opts;
            applyer.queueIndex = queue.length - 1;
            queue.push(applyer)
          }
        }
      }
      return map[mapKey];
    }
  }
}
