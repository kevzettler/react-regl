declare module "bunny" {
  import { vec3, vec2 } from 'gl-matrix';

  const bunny = {
    cells: [],
    positions: [],
    normals: [],
    uvs: [],
  };

  export default bunny;
}
