declare module 'mouse-change'{

  interface mods{
    shift: any
    alt: any
    control: any
    meta: any
  }

  interface listener{
    enabled: boolean
    x: number
    y: number
    buttons: MouseEvent.buttons
    mods: mods
  }

  interface mouseCallback{
    (buttons:MouseEvent.buttons, x:number, y:number, mods:mods): void
  }

  function mouseChange (handle?: mouseCallback): listener;
  function mouseChange (element: HTMLElement, handle: mouseCallback ): listener;

  export default mouseChange
}
