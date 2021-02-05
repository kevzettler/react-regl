declare module 'mouse-wheel'{
  interface handler{
    (
      dx:number,
      dy:number,
      dz:number,
      ev:number
    )
  }

  interface listener{
    (): void
  }

  function mouseWheel(callback: handler): listener
  function mouseWheel(callback: handler, noScroll: boolean): listener
  function mouseWheel(element: HTMLElement, callback: handler, noScroll: boolean): listener

  export default mouseWheel
}
