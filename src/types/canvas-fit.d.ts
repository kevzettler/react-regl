declare module "canvas-fit" {
  interface handler{
    (): void
  }

  export default function(
    canvas: HTMLCanvasElement,
    parent?: HTMLElement,
    scale?: number
  ): handler
}
