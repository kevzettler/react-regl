declare module "vectorize-text"{
  interface options{
    font?: string
    fontStyle?: string
    fontVariant?: string
    fontWeight?: string
    size?: number
    textBaseline?: string
    textAlign?: string
    lineHeight?: number
    width?: number
    height?: number
    triangles?: boolean
    polygons?: boolean
    orientation?: "cw" | "ccw"
    canvas?: HTMLCanvasElement
    context?: CanvasRenderingContext2D
    styletags?: {
      bolds?: boolean
      italics?: boolean
      superscripts?: boolean
      subscripts?: boolean
    }
  }

  export default interface vectorizeText{
    (string:string, options?: options): any
  }
}
