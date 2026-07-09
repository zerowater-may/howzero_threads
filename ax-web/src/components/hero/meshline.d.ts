import type { MeshLineGeometry, MeshLineMaterial } from "meshline";
import type { ThreeElement } from "@react-three/fiber";

// R3F v9 exposes ThreeElement<typeof Ctor>; Object3DNode/MaterialNode were removed.
declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}
