declare module "hsv2rgb" {
  export default interface hsv2rgb{
    <H, S, V, O>(
      hue:number,
      sat:number,
      val:number,
      out:[number, number, number] | [number,number,number,number]
    ): O
  }
}
