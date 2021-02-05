declare module "angle-normals" {
  export default function angleNormals(
    cells: Array<[number,number,number]>,
    normals: Array<[number,number,number]>): [number,number,number][]
}
